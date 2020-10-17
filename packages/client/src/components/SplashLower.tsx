import { styled } from 'linaria/react';
import * as R from 'ramda';
import React from 'react';

import InspiratContext from 'contexts/Inspirat';
import ImageMeta from 'components/ImageMeta';
import useQuery from 'hooks/use-query';
import { capitalizeWords } from 'lib/utils';


// ----- Styles ----------------------------------------------------------------

interface SplashLowerElProps {
  opacity: number;
}

const SplashLowerEl = styled.div<SplashLowerElProps>`
  display: flex;
  justify-content: space-between;
  opacity: ${R.prop('opacity')};
  transition: opacity 1.2s ease-in 0.8s;
  width: 100%;
  z-index: 1;
`;

// Custom styling for the left ImageMeta element that will indicate the image's
// location.
const LocationWrapper = styled.div`
  display: none;

  @media(min-width: 700px) {
    display: block;
  }
`;

// Custom styling for the right ImageMeta element that will indicate the image's
// author.
const AttributionWrapper = styled.div`
  margin-left: auto;
`;


// ----- Splash (Lower) --------------------------------------------------------

const SplashLower: React.FunctionComponent = () => {
  const { currentPhoto } = React.useContext(InspiratContext);
  const query = useQuery();

  // If we have a `meta=false` query param, hide image metadata.
  if (query?.meta === 'false') {
    return null;
  }

  // Location.
  const location = R.path<string>(['location', 'title'], currentPhoto);

  // Attribution.
  const name = capitalizeWords(R.pathOr('', ['user', 'name'], currentPhoto));
  const nameHref = R.pathOr<string>('', ['user', 'links', 'html'], currentPhoto);
  const unsplashHref = R.pathOr<string>('', ['links', 'html'], currentPhoto);
  const attribution = R.path(['user', 'name'], currentPhoto)
    ? <span>Photo by&nbsp;<a href={nameHref}>{name}</a>&nbsp;on&nbsp;<a href={unsplashHref}>Unsplash</a></span>
    : undefined;

  return (
    <SplashLowerEl opacity={currentPhoto ? 1 : 0}>
      <LocationWrapper>
        <ImageMeta>
          {location}
        </ImageMeta>
      </LocationWrapper>
      <AttributionWrapper>
        <ImageMeta>
          {attribution}
        </ImageMeta>
      </AttributionWrapper>
    </SplashLowerEl>
  );
};


export default SplashLower;
