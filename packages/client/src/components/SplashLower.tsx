import { styled } from '@linaria/react';
import * as R from 'ramda';
import React from 'react';

import ImageMeta from 'components/ImageMeta';
import InspiratContext from 'contexts/Inspirat';
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


/**
 * This adds a subtle gradient at the bottom of the screen that provides some
 * additional contrast behind the image metadata elements to improve
 * readability.
 */
const BottomGradient = styled.div`
  background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
  bottom: 0px;
  height: 128px;
  left: 0px;
  position: fixed;
  right: 0px;
  width: 100%;
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
    <span>
      Photo by <a href={authorHref} target="_blank" rel="noopener noreferrer">{author}</a>
      {' '}on{' '}
      <a href={unsplashHref} target="_blank" rel="noopener noreferrer">Unsplash</a>
    </span>
  );

  return (<>
    <StyledSplashLower opacity={currentPhoto ? 1 : 0}>
      <ImageLocation>{location}</ImageLocation>
      <ImageAttribution>{attribution}</ImageAttribution>
    </StyledSplashLower>
    <BottomGradient />
  </>);
};


export default SplashLower;
