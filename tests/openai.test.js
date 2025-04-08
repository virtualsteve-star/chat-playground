/**
 * Tests for the OpenAI model
 */

// Mock fetch
global.fetch = jest.fn();

// Mock XMLHttpRequest
const xhrMock = {
  open: jest.fn(),
  send: jest.fn(),
  status: 200,
  responseText: '',
};
global.XMLHttpRequest = jest.fn(() => xhrMock);

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.prompt
global.prompt = jest.fn();

// Import the OpenAI model
const OpenAIModel = window.OpenAIModel;

describe('OpenAIModel', () => {
  let openai;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new instance for each test
    openai = new OpenAIModel();
    
    // Mock successful fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('System prompt for tech support'),
    });
    
    // Mock localStorage
    localStorageMock.getItem.mockReturnValue(null);
    global.prompt.mockReturnValue('test-api-key');
  });

  describe('initialize', () => {
    test('should initialize the model with a system prompt', async () => {
      const result = await openai.initialize('personalities/tech_support_prompt.txt');
      expect(result).toBe(true);
      expect(openai.initialized).toBe(true);
      expect(openai.systemPrompt).toBe('System prompt for tech support');
      expect(openai.apiKey).toBe('test-api-key');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should use existing API key from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('bG9uZy1zdHJpbmctdGhhdC1sb29rcy1saWtlLWFuLWVuY3J5cHRlZC1rZXk=');
      const result = await openai.initialize('personalities/tech_support_prompt.txt');
      expect(result).toBe(true);
      expect(openai.apiKey).toBe('long-string-that-looks-like-an-encrypted-key');
      expect(global.prompt).not.toHaveBeenCalled();
    });

    test('should handle fetch errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      const result = await openai.initialize('personalities/tech_support_prompt.txt');
      expect(result).toBe(false);
      expect(openai.initialized).toBe(false);
    });

    test('should handle missing API key', async () => {
      global.prompt.mockReturnValue('');
      const result = await openai.initialize('personalities/tech_support_prompt.txt');
      expect(result).toBe(false);
      expect(openai.initialized).toBe(false);
    });
  });

  describe('generateResponse', () => {
    beforeEach(async () => {
      // Initialize the model before each test
      await openai.initialize('personalities/tech_support_prompt.txt');
      
      // Mock successful API response
      const mockResponse = {
        ok: true,
        body: {
          getReader: jest.fn().mockReturnValue({
            read: jest.fn().mockResolvedValue({
              done: false,
              value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n'),
            }),
          }),
        },
      };
      global.fetch.mockResolvedValue(mockResponse);
    });

    test('should return an error message if not initialized', async () => {
      openai.initialized = false;
      const response = await openai.generateResponse('Hello');
      expect(response).toContain('not properly initialized');
    });

    test('should return an error message if API key is missing', async () => {
      openai.apiKey = null;
      const response = await openai.generateResponse('Hello');
      expect(response).toContain('API key is not set');
    });

    test('should make a request to the OpenAI API', async () => {
      await openai.generateResponse('Hello');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
          body: expect.stringContaining('Hello'),
        })
      );
    });

    test('should handle API errors', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: { message: 'Invalid API key' } }),
      });
      
      await expect(openai.generateResponse('Hello')).rejects.toThrow('OpenAI API error');
    });
  });

  describe('cancel', () => {
    test('should abort the controller if it exists', () => {
      openai.controller = { abort: jest.fn() };
      const result = openai.cancel();
      expect(result).toBe(true);
      expect(openai.controller.abort).toHaveBeenCalled();
    });

    test('should return false if no controller exists', () => {
      openai.controller = null;
      const result = openai.cancel();
      expect(result).toBe(false);
    });
  });
}); 