declare module '*.woff' {
  const content: string;
  export default content;
}

declare module '*.woff2' {
  const content: string;
  export default content;
}

declare global {
  interface Window {
    debug: any;
  }
}

// Suppress TS2669: Augmentations for the global scope can only be directly
// nested in external modules or ambient module declarations.
export {};
