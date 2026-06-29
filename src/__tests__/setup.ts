// Only import jest-dom when running in jsdom environment
if (typeof window !== "undefined") {
  import("@testing-library/jest-dom/vitest");
}

// webpack's __non_webpack_require__ is not available in vitest; use real Node.js require
// eslint-disable-next-line
(globalThis as Record<string, unknown>).__non_webpack_require__ = require;
