// Local type root to satisfy implicit library resolution for `testing-library__jest-dom`.
// Safe stub: we don’t use these in app runtime.
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
