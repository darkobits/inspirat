import React from 'react';

import { ImageMeta } from 'components/ImageMeta';
import { useInspirat } from 'hooks/use-inspirat';
import useQuery from 'hooks/use-query';
import { capitalizeWords } from 'lib/utils';

import classes from './SplashLower.css';


// ----- Splash (Lower) --------------------------------------------------------

const SplashLower: React.FunctionComponent = () => {
  const { currentPhoto } = useInspirat();
  const query = useQuery();

  // If we have a `meta=false` query param, hide image metadata.
  if (query?.meta === 'false') {
    return null;
  }

  // Location.
  const location = currentPhoto?.location?.title;

  // Attribution.
  const author = capitalizeWords(currentPhoto?.user?.name ?? '');
  const authorHref = currentPhoto?.user?.links?.html;
  const unsplashHref = currentPhoto?.links?.html;
  const attribution = author && (
    <span>
      Photo by <a href={authorHref} target="_blank" rel="noopener noreferrer">{author}</a>
      {' '}on{' '}
      <a href={unsplashHref} target="_blank" rel="noopener noreferrer">Unsplash</a>
    </span>
  );

  return (<>
    <div
      className={classes.splashLower}
      style={{
        opacity: currentPhoto ? 1 : 0
      }}
    >
      <ImageMeta className={classes.imageLocation}>
        {location}
      </ImageMeta>
      <ImageMeta className={classes.imageAttribution}>
        {attribution}
      </ImageMeta>
    </div>
    {/*
      This adds a subtle gradient at the bottom of the screen that provides some
      additional contrast behind the image metadata elements to improve
      readability.
    */}
    <div className={classes.bottomGradient} />
  </>);
};


export default SplashLower;
