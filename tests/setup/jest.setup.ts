/**
 * Jest Setup File
 *
 * This file runs before each test suite.
 * It sets up:
 * - @testing-library/jest-dom custom matchers
 * - whatwg-fetch polyfill for fetch API
 * - MSW server for mocking API requests (disabled for now due to ESM issues)
 */

import '@testing-library/jest-dom';
import 'whatwg-fetch';

// MSW is temporarily disabled due to ESM module compatibility issues
// Will be enabled for API tests only
// import { server } from './msw.server';

// // Establish API mocking before all tests
// beforeAll(() => {
//   server.listen({
//     onUnhandledRequest: 'warn',
//   });
// });

// // Reset handlers after each test
// afterEach(() => {
//   server.resetHandlers();
// });

// // Clean up after all tests
// afterAll(() => {
//   server.close();
// });

// Mock window.matchMedia (for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver (for lazy loading)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Suppress console errors in tests (optional, can be removed if needed)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
