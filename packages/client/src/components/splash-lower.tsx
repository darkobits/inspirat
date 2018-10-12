import styled, {css} from 'react-emotion';
import React from 'react';

import PhotoContext from 'contexts/photo';
import ImageMeta from 'components/image-meta';
import R from 'lib/ramda';
import {capitalizeWords} from 'lib/utils';


// ----- Styled Elements -------------------------------------------------------

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

const SplashLower: React.SFC = () => {
  return (
    <SplashLowerEl>
      <PhotoContext.Consumer>{photo => {
        if (!photo) {
          return null;
        }

        if (!R.path(['user', 'name'], photo)) {
          return null;
        }

        // Format name we get from Unsplash, because some users think its cute
        // to stylize their names in ALL CAPS. :|
        const name = capitalizeWords(R.path(['user', 'name'], photo) as string);
        const nameHref = R.path<string>(['user', 'links', 'html'], photo);
        const unsplashHref = R.path<string>(['links', 'html'], photo);

        return [
          <ImageMeta key="1" className={locationClassName}>
            {R.path(['location', 'title'], photo)}
          </ImageMeta>,
          <ImageMeta key="2" className={attributionClassName}>
            Photo by&nbsp;<a href={nameHref}>{name}</a>&nbsp;on&nbsp;<a href={unsplashHref}>Unsplash</a>
          </ImageMeta>
        ];
      }}</PhotoContext.Consumer>
    </SplashLowerEl>
  );
};


export default SplashLower;
