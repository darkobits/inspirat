import camelCase from 'camelcase';
import Vibrant from 'node-vibrant';
import * as R from 'ramda';


/**
 * @private
 *
 * Color keys in Vibrant Palette objects to map over.
 */
const PALETTE_COLOR_KEYS = [
  'Vibrant',
  'LightVibrant',
  'DarkVibrant',
  'Muted',
  'LightMuted',
  'DarkMuted'
];


/**
 * Provided an image URL, returns a Vibrant Palette instance.
 */
export default async function getPalette(imgUrl: string) {
  const palette = await Vibrant.from(imgUrl).getPalette();

  return R.reduce((mappedPalette, curKey) => {
    const swatch = palette[curKey];

    // If Vibrant could not compute a color, it will be undefined.
    if (!swatch) {
      return mappedPalette;
    }

    return R.assoc(camelCase(curKey), {
      r: Math.round(swatch.r),
      g: Math.round(swatch.g),
      b: Math.round(swatch.b)
    }, mappedPalette);
  }, {} as any, PALETTE_COLOR_KEYS);
}
