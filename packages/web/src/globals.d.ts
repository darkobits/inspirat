declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    debug: any;
  }
}

// Suppress TS2669: Augmentations for the global scope can only be directly
// nested in external modules or ambient module declarations.
export {};
