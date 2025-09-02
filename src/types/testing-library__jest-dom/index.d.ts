// Minimal ambient types to satisfy TS config expecting `testing-library__jest-dom`
// This app doesn’t rely on these at runtime; stubs are sufficient for typecheck.
export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: unknown): R;
      toHaveTextContent(text?: string | RegExp, options?: { normalizeWhitespace?: boolean }): R;
    }
  }
}
