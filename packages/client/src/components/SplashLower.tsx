import { styled } from 'linaria/react';
import * as R from 'ramda';
import React from 'react';

import InspiratContext from 'contexts/Inspirat';
import ImageMeta from 'components/ImageMeta';
import useQuery from 'hooks/use-query';
import { capitalizeWords } from 'lib/utils';


// ----- Styles ----------------------------------------------------------------

interface StyledSplashLowerProps {
  opacity: number;
}

const StyledSplashLower = styled.div<StyledSplashLowerProps>`
  display: flex;
  justify-content: space-between;
  opacity: ${R.prop('opacity')};
  transition: opacity 1.2s ease-in;
  transition-delay: 1.2s;
  width: 100%;
  z-index: 1;
`;

const ImageLocation = styled(ImageMeta)`
  display: none;

  @media(min-width: 700px) {
    display: block;
  }
`;

const ImageAttribution = styled(ImageMeta)`
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
  const location = currentPhoto?.location?.title;

  // Attribution.
  const author = capitalizeWords(currentPhoto?.user?.name ?? '');
  const authorHref = currentPhoto?.user?.links?.html;
  const unsplashHref = currentPhoto?.links?.html;
  const attribution = author && (
    <span>Photo by <a href={authorHref}>{author}</a> on <a href={unsplashHref}>Unsplash</a></span>
  );

  return (
    <StyledSplashLower opacity={currentPhoto ? 1 : 0}>
      <ImageLocation>{location}</ImageLocation>
      <ImageAttribution>{attribution}</ImageAttribution>
    </StyledSplashLower>
  );
};


export default SplashLower;
