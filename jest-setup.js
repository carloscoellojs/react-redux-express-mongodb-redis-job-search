// Jest setup file that runs before test environment is initialized
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Also add to globalThis for newer environments
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;