// Stub for testing-library__jest-dom types
declare module 'testing-library__jest-dom' {
  export {};
}

// Global types to prevent TS errors
declare global {
  namespace jest {
    interface Matchers<R> {}
  }
}