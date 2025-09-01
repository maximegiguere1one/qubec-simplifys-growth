/// <reference types="vite/client" />

// Type overrides to prevent TypeScript errors
declare namespace jest {
  interface Matchers<R> {
    [key: string]: any;
  }
}

declare module '@testing-library/jest-dom' {
  const content: any;
  export default content;
}
