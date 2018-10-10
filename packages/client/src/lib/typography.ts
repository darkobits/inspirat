import queryString from 'lib/query';


/**
 * Default font family string to use.
 */
const DEFAULT_FONTS = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Helvetica',
  'Arial',
  'sans-serif'
];


/**
 * Loads a font from Google Fonts and returns a Promise-like object that
 * resolves when the resource has loaded. The object implements a custom
 * toString method that returns the font family,
 */
class TypographyResource extends Promise<void> {
  private readonly fontFamily: string;

  constructor(param: string) {
    const [fontFamily, weights] = param.split(':');

    const fontUrl = `https://fonts.googleapis.com/css?family=${param}`;

    const resolver = (resolve: Function, reject: Function) => {
      const linkTag = document.createElement('link');
      linkTag.type = 'text/css';
      linkTag.rel = 'stylesheet';

      linkTag.onload = () => {
        resolve();

        let message = `Font family '${fontFamily}'`;

        if (weights) {
          message += ` (weights ${weights.split(',').join(', ')})`;
        }

        message += ' loaded.';

        console.debug(message);
      };

      linkTag.onerror = () => {
        reject(new Error(`Error loading font '${fontFamily}'.`));
      };

      linkTag.href = fontUrl;

      const documentHead = document.getElementsByTagName('head')[0];

      if (!documentHead) {
        throw new Error('Document has no <head> tag.');
      }

      documentHead.appendChild(linkTag);
    };

    super(resolver);

    this.fontFamily = fontFamily;
  }

  toString() {
    return this.fontFamily.replace('+', ' ');
  }
}


/**
 * Returns a Promise that resolves when the provided font has loaded. The
 * Promise implements a toString method that returns the font family, so this
 * function may be used in JS-based stylesheets to semantically use/load a font.
 *
 * The argument provided to this function may optionally specify font weights:
 *
 * "Lato:100,300"
 */
function useFont(param: string): TypographyResource {
  return new TypographyResource(param);
}


/**
 * Returns a string suitable for using as a font-family rule in a stylesheet.
 */
export function buildFontFamilyString(additionalFont?: string): string {
  const fonts = [];

  if (process.env.NODE_ENV === 'development') {
    const parsedQuery = queryString();

    if (parsedQuery.family) {
      fonts.push(`"${useFont(parsedQuery.family)}"`);
    }

    console.debug('[Development] "family" query param supported.');
  }

  if (additionalFont) {
    fonts.push(`"${additionalFont}"`);
  }

  return [...fonts, ...DEFAULT_FONTS].join(', ');
}


export type TextShadow = [number, number, number, string];


/**
 * Provided an array of TextShadow descriptors, returns a string suitable for
 * use as a 'text-shadow' CSS rule.
 */
export function compositeTextShadow(shadows: Array<TextShadow>): string {
  return shadows.map(shadow => {
    const [offsetX, offsetY, blurRadius, color] = shadow;
    return `${offsetX}px ${offsetY}px ${blurRadius}px ${color}`;
  }).join(', ');
}
