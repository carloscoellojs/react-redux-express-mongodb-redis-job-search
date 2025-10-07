/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Simple TextEncoder/TextDecoder polyfill for Jest
if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as any).TextEncoder = class {
    encode(str: string) {
      return new Uint8Array([...str].map(c => c.charCodeAt(0)));
    }
  };
}

if (typeof globalThis.TextDecoder === 'undefined') {
  (globalThis as any).TextDecoder = class {
    decode(bytes: Uint8Array) {
      return String.fromCharCode(...bytes);
    }
  };
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock IntersectionObserver
(globalThis as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};