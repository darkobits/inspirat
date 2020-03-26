import {styled} from 'linaria/react';
import {css} from 'linaria';
import * as R from 'ramda';
import React, {FunctionComponent, useContext} from 'react';

import PhotoContext from 'contexts/photo';
import ImageMeta from 'components/image-meta';
import {capitalizeWords} from 'lib/utils';


// ----- Styles ----------------------------------------------------------------

interface SplashLowerElProps {
  opacity: number;
}

const SplashLowerEl = styled.div<SplashLowerElProps>`
  display: flex;
  justify-content: space-between;
  opacity: ${R.prop('opacity')};
  transition: opacity 1.2s ease-in 1.2s;
  width: 100%;
  z-index: 1;
`;

// Custom styling for the left ImageMeta element that will indicate the image's
// location.
const locationClassName = css`
  display: none;

  @media(min-width: 700px) {
    display: block;
  }
`;

// Custom styling for the right ImageMeta element that will indicate the image's
// author.
const attributionClassName = css`
  margin-left: auto;
`;


// ----- Component -------------------------------------------------------------

const SplashLower: FunctionComponent = () => {
  const {currentPhoto} = useContext(PhotoContext);

  // Location.
  const location = R.path<string>(['location', 'title'], currentPhoto);

  // Attribution.
  const name = capitalizeWords(R.pathOr('', ['user', 'name'], currentPhoto));
  const nameHref = R.pathOr('', ['user', 'links', 'html'], currentPhoto);
  const unsplashHref = R.pathOr('', ['links', 'html'], currentPhoto);
  const attribution = R.path(['user', 'name'], currentPhoto) ? <span>Photo by&nbsp;<a href={nameHref}>{name}</a>&nbsp;on&nbsp;<a href={unsplashHref}>Unsplash</a></span> : undefined;

  return (
    <SplashLowerEl opacity={currentPhoto ? 1 : 0}>
      <ImageMeta className={locationClassName}>{location}</ImageMeta>
      <ImageMeta className={attributionClassName}>{attribution}</ImageMeta>
    </SplashLowerEl>
  );
};


export default SplashLower;
