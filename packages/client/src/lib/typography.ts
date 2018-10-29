import {DEFAULT_FONTS} from 'etc/constants';


/**
 * Loads a font from Google Fonts and returns a Promise-like object that
 * resolves when the resource has loaded. The object implements a custom
 * toString method that returns the font family,
 */
class GoogleFontResource extends Promise<void> {
  private static readonly BASE_URL = 'https://fonts.googleapis.com/css?family=';

  private readonly fontFamily: string;

  constructor(fontFamily: string, weights?: Array<number>) {
    super(GoogleFontResource.getResolver(fontFamily, weights));
    this.fontFamily = fontFamily;
  }


  static getResolver(fontFamily: string, weights: Array<number> = []) {
    return (resolve: Function, reject: Function) => {
      const linkTag = document.createElement('link');
      linkTag.type = 'text/css';
      linkTag.rel = 'stylesheet';

      linkTag.onload = () => {
        resolve();

        let message = `Font family '${fontFamily}'`;

        if (weights) {
          message += ` (weights ${weights.join(', ')})`;
        }

        message += ' loaded.';

        if (process.env.NODE_ENV === 'development') {
          console.debug(message);
        }
      };

      linkTag.onerror = () => {
        reject(new Error(`Error loading font '${fontFamily}'.`));
      };

      const fontWeights = weights.length ? ':' + weights.join(',') : '';

      linkTag.href = `${GoogleFontResource.BASE_URL}${fontFamily}${fontWeights}`;

      const documentHead = document.getElementsByTagName('head')[0];

      if (!documentHead) {
        throw new Error('Document has no <head> tag.');
      }

      documentHead.appendChild(linkTag);
    };
  }


  toString() {
    return `${this.fontFamily.replace('+', ' ')}, ${DEFAULT_FONTS.join(', ')}`;
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
export function useFont(fontFamily: string, weights?: Array<number>): GoogleFontResource {
  return new GoogleFontResource(fontFamily, weights);
}



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
