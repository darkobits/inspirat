/**
 * Allows us to import various non-JavaScript files without encountering
 * TypeScript errors.
 */
declare module '*.woff' {
  const content: string;
  export default content;
}
