/**
 * Tests for the main application functionality
 */

// Mock DOM elements
document.body.innerHTML = `
  <div id="chat-window"></div>
  <div id="working-indicator" style="display: none;"></div>
  <select id="model-select"></select>
  <select id="personality-select"></select>
  <select id="style-select"></select>
  <textarea id="user-input"></textarea>
  <button id="send-button"></button>
`;

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

// Mock XMLHttpRequest
const xhrMock = {
  open: jest.fn(),
  send: jest.fn(),
  status: 200,
  responseText: '',
};
global.XMLHttpRequest = jest.fn(() => xhrMock);

// Mock models
const mockElizaModel = {
  initialize: jest.fn().mockResolvedValue(true),
  generateResponse: jest.fn().mockResolvedValue('ELIZA response'),
  cancel: jest.fn().mockReturnValue(true),
};

const mockOpenAIModel = {
  initialize: jest.fn().mockResolvedValue(true),
  generateResponse: jest.fn().mockResolvedValue('OpenAI response'),
  cancel: jest.fn().mockReturnValue(true),
};

// Import the main application code
const { initializeApp, handleSend, handlePersonalityChange, handleStyleChange } = window;

describe('Main Application', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock successful properties loading
    xhrMock.responseText = `
      models=eliza,openai
      styles=default,dark,light
      personalities=psychotherapist,tech_support
    `;
    
    // Mock models
    window.ElizaModel = jest.fn(() => mockElizaModel);
    window.OpenAIModel = jest.fn(() => mockOpenAIModel);
    
    // Initialize the application
    initializeApp();
  });

  describe('initializeApp', () => {
    test('should load properties and initialize the application', () => {
      expect(document.getElementById('model-select').options.length).toBe(2);
      expect(document.getElementById('personality-select').options.length).toBe(2);
      expect(document.getElementById('style-select').options.length).toBe(3);
    });

    test('should handle properties loading errors', () => {
      xhrMock.status = 404;
      xhrMock.responseText = 'Not Found';
      initializeApp();
      expect(document.getElementById('model-select').options.length).toBe(0);
    });
  });

  describe('handleSend', () => {
    beforeEach(() => {
      // Set up the form
      document.getElementById('model-select').value = 'eliza';
      document.getElementById('user-input').value = 'Hello';
    });

    test('should send a message and display the response', async () => {
      await handleSend();
      expect(mockElizaModel.generateResponse).toHaveBeenCalledWith('Hello');
      expect(document.getElementById('chat-window').innerHTML).toContain('Hello');
      expect(document.getElementById('chat-window').innerHTML).toContain('ELIZA response');
    });

    test('should handle empty input', async () => {
      document.getElementById('user-input').value = '';
      await handleSend();
      expect(mockElizaModel.generateResponse).not.toHaveBeenCalled();
    });

    test('should handle model errors', async () => {
      mockElizaModel.generateResponse.mockRejectedValue(new Error('Model error'));
      await handleSend();
      expect(document.getElementById('chat-window').innerHTML).toContain('Error');
    });
  });

  describe('handlePersonalityChange', () => {
    test('should initialize the selected model with the new personality', async () => {
      document.getElementById('model-select').value = 'openai';
      document.getElementById('personality-select').value = 'tech_support';
      await handlePersonalityChange();
      expect(mockOpenAIModel.initialize).toHaveBeenCalledWith('personalities/tech_support_prompt.txt');
    });

    test('should handle initialization errors', async () => {
      mockOpenAIModel.initialize.mockResolvedValue(false);
      document.getElementById('model-select').value = 'openai';
      document.getElementById('personality-select').value = 'tech_support';
      await handlePersonalityChange();
      expect(document.getElementById('chat-window').innerHTML).toContain('Error');
    });
  });

  describe('handleStyleChange', () => {
    test('should change the stylesheet', () => {
      document.getElementById('style-select').value = 'dark';
      handleStyleChange();
      expect(document.querySelector('link[href*="dark"]')).toBeTruthy();
    });
  });
}); 