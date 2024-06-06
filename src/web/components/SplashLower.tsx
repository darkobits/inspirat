import { ImageMeta } from 'web/components/ImageMeta';
import useQuery from 'web/hooks/use-query';
import { capitalizeWords } from 'web/lib/utils';

import classes from './SplashLower.css';

import type { InspiratPhotoResource } from 'etc/types';

export interface SplashLowerProps {
  photo: InspiratPhotoResource | void;
}

export default function SplashLower({ photo }: SplashLowerProps) {
  const query = useQuery();
  // If we have a `meta=false` query param, hide image metadata.
  if (query?.meta === 'false') return null;

  if (!photo) return null;

  // Location.
  const location = capitalizeWords(photo?.location?.name ?? '');

  // Attribution.
  const author = capitalizeWords(photo?.user?.name ?? '');
  const authorHref = photo?.user?.links?.html;
  const photoHref = photo?.links?.html;

  const attribution = author && (
    <span>
      <a href={photoHref} target="_blank" rel="noopener noreferrer">Photo</a> by{' '}
      <a href={authorHref} target="_blank" rel="noopener noreferrer">{author}</a>
    </span>
  );

  return (
    <div className={classes.splashLower}>
      <ImageMeta className={classes.imageLocation}>
        {location}
      </ImageMeta>
      <ImageMeta className={classes.imageAttribution}>
        {attribution}
      </ImageMeta>
    </div>
  );
}
