/**
 * Jest Setup File
 * Sistema TomaTurnoModerno - INER
 */

// Add custom matchers or global test utilities here
global.console = {
  ...console,
  // Uncomment to suppress console logs during tests
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep errors visible
};
