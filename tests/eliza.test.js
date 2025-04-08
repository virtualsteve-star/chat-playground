/**
 * Tests for the ELIZA model
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

// Import the ELIZA model
const ElizaModel = window.ElizaModel;

describe('ElizaModel', () => {
  let eliza;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new instance for each test
    eliza = new ElizaModel();
    
    // Mock successful fetch response
    global.fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(`
[greetings]
Hello, how are you?
Hi there!

[farewells]
Goodbye!
See you later!

[patterns]
I am feeling=>Tell me more about feeling {input}.
I feel=>How long have you been feeling {input}?
      `),
    });
  });

  describe('initialize', () => {
    test('should initialize the model with a script', async () => {
      const result = await eliza.initialize('personalities/psychotherapist.txt');
      expect(result).toBe(true);
      expect(eliza.initialized).toBe(true);
      expect(eliza.script).toBeDefined();
      expect(eliza.script.greetings).toHaveLength(2);
      expect(eliza.script.farewells).toHaveLength(2);
      expect(eliza.script.patterns).toHaveLength(2);
    });

    test('should handle fetch errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      const result = await eliza.initialize('personalities/psychotherapist.txt');
      expect(result).toBe(false);
      expect(eliza.initialized).toBe(false);
    });
  });

  describe('generateResponse', () => {
    beforeEach(async () => {
      // Initialize the model before each test
      await eliza.initialize('personalities/psychotherapist.txt');
    });

    test('should return a greeting for greeting messages', async () => {
      const response = await eliza.generateResponse('Hello there!');
      expect(eliza.script.greetings).toContain(response);
    });

    test('should return a farewell for farewell messages', async () => {
      const response = await eliza.generateResponse('Goodbye!');
      expect(eliza.script.farewells).toContain(response);
    });

    test('should match patterns and return appropriate responses', async () => {
      const response = await eliza.generateResponse('I am feeling sad');
      expect(response).toContain('feeling sad');
    });

    test('should return a default response when no pattern matches', async () => {
      const response = await eliza.generateResponse('Random message that does not match any pattern');
      expect(response).toBeDefined();
    });

    test('should return an error message if not initialized', async () => {
      eliza.initialized = false;
      const response = await eliza.generateResponse('Hello');
      expect(response).toContain('not properly initialized');
    });
  });

  describe('cancel', () => {
    test('should return true (no-op for ELIZA)', () => {
      const result = eliza.cancel();
      expect(result).toBe(true);
    });
  });
}); 