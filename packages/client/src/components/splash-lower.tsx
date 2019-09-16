import styled from '@emotion/styled';
import {css} from '@emotion/core';
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

const locationStyles = css`
  display: none;

  @media(min-width: 700px) {
    display: block;
  }
`;

const attributionStyles = css`
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
      <ImageMeta css={locationStyles}>
        {location}
      </ImageMeta>
      <ImageMeta css={attributionStyles}>
        {attribution}
      </ImageMeta>
    </SplashLowerEl>
  );
};


export default SplashLower;
