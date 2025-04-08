/**
 * Tests for utility functions
 */

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

// Mock document methods
document.createElement = jest.fn(() => ({
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
  },
  appendChild: jest.fn(),
  textContent: '',
}));

document.getElementById = jest.fn(() => ({
  appendChild: jest.fn(),
  scrollTop: 0,
  scrollHeight: 100,
}));

document.querySelector = jest.fn(() => null);
document.querySelectorAll = jest.fn(() => []);

// Import the utility functions
const ChatUtils = window.ChatUtils;

describe('ChatUtils', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('encrypt and decrypt', () => {
    test('encrypt should encode the input string', () => {
      const input = 'test-api-key';
      const encrypted = ChatUtils.encrypt(input);
      expect(encrypted).toBe(btoa(input));
    });

    test('decrypt should decode the encrypted string', () => {
      const input = 'test-api-key';
      const encrypted = btoa(input);
      const decrypted = ChatUtils.decrypt(encrypted);
      expect(decrypted).toBe(input);
    });
  });

  describe('saveApiKey and getApiKey', () => {
    test('saveApiKey should store the encrypted API key', () => {
      const key = 'test-key';
      const value = 'test-value';
      ChatUtils.saveApiKey(key, value);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(key, btoa(value));
    });

    test('getApiKey should retrieve and decrypt the API key', () => {
      const key = 'test-key';
      const value = 'test-value';
      localStorageMock.getItem.mockReturnValue(btoa(value));
      const retrieved = ChatUtils.getApiKey(key);
      expect(retrieved).toBe(value);
    });

    test('getApiKey should return null if the key does not exist', () => {
      const key = 'non-existent-key';
      localStorageMock.getItem.mockReturnValue(null);
      const retrieved = ChatUtils.getApiKey(key);
      expect(retrieved).toBeNull();
    });
  });

  describe('createMessageElement', () => {
    test('should create a user message element', () => {
      const text = 'Hello, world!';
      const isUser = true;
      const element = ChatUtils.createMessageElement(text, isUser);
      expect(element.classList.add).toHaveBeenCalledWith('message');
      expect(element.classList.add).toHaveBeenCalledWith('user-message');
      expect(element.textContent).toBe(text);
    });

    test('should create a bot message element with feedback buttons', () => {
      const text = 'Hello, world!';
      const isUser = false;
      const element = ChatUtils.createMessageElement(text, isUser);
      expect(element.classList.add).toHaveBeenCalledWith('message');
      expect(element.classList.add).toHaveBeenCalledWith('bot-message');
      expect(element.textContent).toBe(text);
      expect(element.appendChild).toHaveBeenCalled();
    });
  });

  describe('addMessageToChat', () => {
    test('should add a message to the chat window', () => {
      const text = 'Hello, world!';
      const isUser = true;
      ChatUtils.addMessageToChat(text, isUser);
      expect(document.getElementById).toHaveBeenCalledWith('chat-window');
      expect(document.createElement).toHaveBeenCalled();
    });
  });

  describe('toggleWorkingIndicator', () => {
    test('should show the working indicator when it does not exist', () => {
      document.querySelector.mockReturnValue(null);
      ChatUtils.toggleWorkingIndicator(true);
      expect(document.createElement).toHaveBeenCalled();
      expect(document.getElementById).toHaveBeenCalledWith('chat-window');
    });

    test('should show the working indicator when it exists', () => {
      const indicator = { classList: { add: jest.fn(), remove: jest.fn() } };
      document.querySelector.mockReturnValue(indicator);
      ChatUtils.toggleWorkingIndicator(true);
      expect(indicator.classList.add).toHaveBeenCalledWith('active');
    });

    test('should hide the working indicator', () => {
      const indicator = { classList: { add: jest.fn(), remove: jest.fn() } };
      document.querySelector.mockReturnValue(indicator);
      ChatUtils.toggleWorkingIndicator(false);
      expect(indicator.classList.remove).toHaveBeenCalledWith('active');
    });
  });

  describe('changeStyle', () => {
    test('should change the style sheet', () => {
      const styleName = 'vanilla';
      const styleSheet = { href: '', disabled: false };
      document.getElementById.mockReturnValue(styleSheet);
      ChatUtils.changeStyle(styleName);
      expect(styleSheet.href).toBe('styles/vanilla.css');
      expect(styleSheet.disabled).toBe(false);
    });
  });
}); 