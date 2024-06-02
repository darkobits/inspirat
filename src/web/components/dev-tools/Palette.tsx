import { InspiratPhotoResource } from 'etc/types';
import { Swatch } from 'web/components/dev-tools/Swatch';


interface Props {
  photo: InspiratPhotoResource | undefined;
}


/**
 * Renders a Swatch for each color in a photo's 'palette'.
 */
export const Palette = ({ photo }: Props) => {
  if (!photo?.palette) return null;

  return (
    <div className="ms-3">
      {Object.entries(photo.palette).map(([colorName, swatch]) => {
        return (
          <Swatch
            key={colorName}
            color={swatch}
            className="mb-3"
          >
            <span className="text-capitalize">
              {swatch ? colorName : 'N/A'}
            </span>
          </Swatch>
        );
      })}
    </div>
  );
};
