import { InspiratPhotoResource } from 'etc/types';
import { Swatch, type SwatchProps } from 'web/components/dev-tools/Swatch';

interface Props {
  photo: InspiratPhotoResource | undefined;
  swatchProps?: Partial<SwatchProps>;
}

/**
 * Renders a Swatch for each color in a photo's 'palette'.
 */
export const Palette = ({ photo, swatchProps }: Props) => {
  if (!photo?.palette) return null;

  const { style: swatchStyle, ...restSwatchProps } = swatchProps ?? {};

  return (
    <>
      {Object.entries(photo.palette).map(([colorName, swatch]) => {
        return (
          <Swatch
            key={colorName}
            color={swatch}
            style={swatchStyle}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restSwatchProps}
          >
            <span className="text-capitalize">
              {swatch ? colorName : 'N/A'}
            </span>
          </Swatch>
        );
      })}
    </>
  );
};
