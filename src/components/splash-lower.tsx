import {css} from 'react-emotion';
import React from 'react';

import PhotoContext from 'contexts/photo';
import ImageMeta from 'components/image-meta';
import R from 'lib/ramda';
import {capitalizeWords} from 'lib/utils';


// ----- Styles ----------------------------------------------------------------

const className = css`
  display: flex;
  justify-content: space-between;
  width: 100%;
  z-index: 1;
`;


// ----- Component -------------------------------------------------------------

const SplashLower: React.SFC = () => {
  return (
    <div className={className}>
      <PhotoContext.Consumer>
        {photo => {
          if (!photo) {
            return null;
          }

          // Format name we get from Unsplash, because some users think its 'cute' to
          // stylize their names in all caps. :|
          const name = capitalizeWords(photo.user.name);
          const nameHref = R.path<string>(['user', 'links', 'html'], photo);
          const unsplashHref = R.path<string>(['links', 'html'], photo);

          return [
            <ImageMeta key="1">
              {R.path(['location', 'title'], photo)}
            </ImageMeta>,
            <ImageMeta key="2">
              Photo by&nbsp;<a href={nameHref}>{name}</a>&nbsp;on&nbsp;<a href={unsplashHref}>Unsplash</a>
            </ImageMeta>
          ];
        }}
      </PhotoContext.Consumer>
    </div>
  );
};


export default SplashLower;
