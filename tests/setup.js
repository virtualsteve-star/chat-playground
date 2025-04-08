/**
 * Test setup file for Jest
 */

// Mock TextEncoder and TextDecoder
const TextEncoder = require('util').TextEncoder;
const TextDecoder = require('util').TextDecoder;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window object
global.window = {
  localStorage: {},
  prompt: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  document: {
    createElement: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    getElementById: jest.fn(),
  },
};

// Mock console methods
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

// Mock XMLHttpRequest
global.XMLHttpRequest = jest.fn(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  status: 200,
  responseText: '',
}));

// Mock AbortController
global.AbortController = jest.fn(() => ({
  abort: jest.fn(),
  signal: {},
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));
global.cancelAnimationFrame = jest.fn();

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now()),
};

// Mock crypto
global.crypto = {
  getRandomValues: jest.fn(arr => arr),
  subtle: {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    importKey: jest.fn(),
    generateKey: jest.fn(),
  },
}; 