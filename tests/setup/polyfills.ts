/**
 * Polyfills for Jest Test Environment
 *
 * This file loads before all other setup files to provide
 * necessary polyfills for Node.js environment
 */

import { TextEncoder, TextDecoder } from 'util';

// TextEncoder/TextDecoder polyfill for MSW
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// BroadcastChannel polyfill for MSW
global.BroadcastChannel = class BroadcastChannel {
  constructor(public name: string) {}
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
} as any;

// Additional polyfills can be added here as needed
