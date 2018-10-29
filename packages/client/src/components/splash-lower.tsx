import * as R from 'ramda';
import styled, {css} from 'react-emotion';
import React from 'react';

import PhotoContext from 'contexts/photo';
import ImageMeta from 'components/image-meta';
import {capitalizeWords} from 'lib/utils';


// ----- Styleds ---------------------------------------------------------------

const SplashLowerEl = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  z-index: 1;
`;

const locationClassName = css`
  display: none;

  @media(min-width: 700px) {
    display: block;
  }
`;

const attributionClassName = css`
  margin-left: auto;
`;


// ----- Component -------------------------------------------------------------

const SplashLower: React.SFC = () => (
  <PhotoContext.Consumer>{photo => {
    // Location.
    const location = R.path(['location', 'title'], photo);

    // Attribution.
    const name = capitalizeWords(R.pathOr('', ['user', 'name'], photo));
    const nameHref = R.pathOr('', ['user', 'links', 'html'], photo);
    const unsplashHref = R.pathOr('', ['links', 'html'], photo);
    const attribution = R.path(['user', 'name'], photo) ? <span>Photo by&nbsp;<a href={nameHref}>{name}</a>&nbsp;on&nbsp;<a href={unsplashHref}>Unsplash</a></span> : null;

    return (
      <SplashLowerEl>
        <ImageMeta className={locationClassName}>
          {location}
        </ImageMeta>
        <ImageMeta className={attributionClassName}>
          {attribution}
        </ImageMeta>
      </SplashLowerEl>
    );
  }}</PhotoContext.Consumer>
);


export default SplashLower;
