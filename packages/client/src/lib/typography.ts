export type TextShadow = [number, number, number, string];


/**
 * Provided an array of TextShadow descriptors, returns a string suitable for
 * use as a 'text-shadow' CSS rule.
 */
export function compositeTextShadow(shadows: Array<TextShadow>): string {
  return shadows.map(([offsetX, offsetY, blurRadius, color]) => {
    return `${offsetX}px ${offsetY}px ${blurRadius}px ${color}`;
  }).join(', ');
}
