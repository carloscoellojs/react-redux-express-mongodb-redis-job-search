/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// Global Jest and Testing Library types for all test files
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classNames: string[]): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveFocus(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string): R;
      toHaveValue(value: string | number): R;
      toHaveStyle(css: Record<string, any> | string): R;
    }
  }
}

export {};