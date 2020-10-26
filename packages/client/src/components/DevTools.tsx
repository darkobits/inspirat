import { Color, InspiratPhotoResource } from 'inspirat-types';
import { css } from 'linaria';
import { styled } from 'linaria/react';
import mousetrap from 'mousetrap';
import { desaturate, readableColor, rgba } from 'polished';
import React from 'react';
import { BsArrowRepeat, BsCheck } from 'react-icons/bs';

import InspiratContext from 'contexts/Inspirat';
import { ifDebug, modIndex, toColorString } from 'lib/utils';


// ----- Styles ----------------------------------------------------------------

/**
 * Basis for computing various attributes of the Source and Swatch components.
 */
const BASIS = '28px';


const StyledDevTools = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 12px 10px 0px 10px;
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  z-index: 1;
`;


/**
 * Progress bar that resides at the top of the screen and reflects the current
 * position in the photo collection.
 */
const Progress = styled.div<{progress: number; color: string}>`
  /* background-color: ${props => rgba(readableColor(props.color || 'white'), 0.42)}; */
  border-left-color: ${props => rgba(props.color || 'white', 1)};
  border-left-style: solid;
  border-left-width: ${props => (props.progress || 0) * 100}vw;
  height: 3px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: border-left-width 0.2s ease-in;
`;


/**
 * Image override component.
 */
const Source = styled.div<{ color: string }>`
  height: ${BASIS};
  width: 100%;
  margin-right: 12px;
  backdrop-filter: blur(20px);

  input {
    background: ${props => rgba(desaturate(0.6, props.color), 0.5)};
    backdrop-filter: blur(10px);
    border-radius: 4px;
    border: 1px solid ${props => rgba(readableColor(props.color), 0.64)};
    box-shadow: 0px 0px 4px ${props => rgba(props.color, 0.16)};
    color: ${props => readableColor(desaturate(0.6, props.color))};
    font-family: sans-serif;
    font-size: 15px;
    font-size: inherit;
    font-weight: 100;
    height: ${BASIS};
    line-height: ${BASIS};
    padding: 0px 10px 0px 14px;
    width: 100%;

    &:focus {
      outline: none;
      box-shadow: 0px 0px 0px 1.5px ${props => rgba(readableColor(props.color), 0.32)};
      background: ${props => rgba(desaturate(0.6, props.color), 0.64)};
    }

    &::placeholder {
      color: ${props => rgba(readableColor(props.color), 0.64)};
    }

    &::selection {
      background-color: rgba(255, 255, 255, 0.5);
    }
  }
`;


// ----- Loading Indicator -----------------------------------------------------

const StyledLoadingIndicator = styled.div<{ color?: string }>`
  background-color: ${props => rgba(readableColor(props.color ?? 'white'), 0.42)};
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
  width: 32px;
  height: ${BASIS};
  padding-top: 1px;
  text-align: center;
  transition: background-color 1s ease;

  & svg {
    color: ${props => rgba(props.color ?? 'white', 1)};
    filter: drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16));
    transition: color 1s ease;
  }
`;

const spinClassName = css`
  @keyframes spin {
    from {
      transform:rotate(0deg);
    }
    to {
      transform:rotate(360deg);
    }
  }

  animation: spin 2s infinite linear;
`;

interface LoadingIndicatorProps {
  color?: string;
  isLoading: boolean;
}

const LoadingIndicator = ({ color, isLoading }: LoadingIndicatorProps) => {
  return (
    <StyledLoadingIndicator color={color}>
      {isLoading ? <BsArrowRepeat className={spinClassName} /> : <BsCheck />}
    </StyledLoadingIndicator>
  );
};


// ----- Swatch ---------------------------------------------------------------

interface SwatchProps {
  swatch?: Color;
}


/**
 * Renders a div whose background color is the provided color and whose text
 * color will be a 'readable' color according to Polished.
 */
const Swatch = styled.div<SwatchProps>`
  align-items: center;
  background-color: ${({ swatch }) => rgba(swatch?.r ?? 0, swatch?.g ?? 0, swatch?.b ?? 0, swatch?.a ?? 1)};
  color: ${({ swatch }) => readableColor(rgba(swatch?.r ?? 0, swatch?.g ?? 0, swatch?.b ?? 0, swatch?.a ?? 1))};
  display: flex;
  font-size: 12px;
  height: 1.8em;
  justify-content: center;
  text-transform: capitalize;
  width: 120px;

  &:not(:last-of-type) {
    margin-bottom: 8px;
  }
`;


// ----- Palette ---------------------------------------------------------------

interface PaletteProps {
  photo?: InspiratPhotoResource;
}

/**
 * Renders a Swatch for each color in a photo's 'palette'.
 */
const Palette = ({ photo }: PaletteProps) => {
  if (!photo) {
    return null;
  }

  return (
    <div>
      {Object.entries(photo.palette).map(([colorName, swatch]) => {
        return (
          <Swatch
            key={colorName}
            swatch={swatch}
          >
            {swatch ? colorName : 'N/A'}
          </Swatch>
        );
      })}
    </div>
  );
};


// ----- Dev Tools -------------------------------------------------------------

/**
 * TODO: Showing the dev tools currently changes the photo shown. Should use the
 * photo that would be shown if dev tools were hidden.
 */
const DevTools: React.FunctionComponent = () => {
  const {
    dayOffset,
    showDevTools,
    isLoadingPhotos,
    currentPhoto,
    setCurrentPhoto,
    setDayOffset,
    resetPhoto,
    numPhotos
  } = React.useContext(InspiratContext);

  /*
   * [Effect] Dev Tools initialization.
   */
  React.useEffect(() => ifDebug(() => {
    if (!showDevTools) {
      return;
    }

    console.debug('[DevTools] Dev tools are enabled.');

    mousetrap.bind('left', () => {
      setDayOffset('decrement');
    });

    mousetrap.bind('right', () => {
      setDayOffset('increment');
    });

    return () => {
      mousetrap.unbind('left');
      mousetrap.unbind('right');
    };
  }), [showDevTools]);


  /**
   * [Callback] Immediately select the contents of the image source field when
   * the element is focused.
   */
  const handleImgIdFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select();
  }, []);


  /**
   * [Callback] Handle updates to the image source field.
   *
   * Note: This uses the Unsplash Source API, which redirects to a photo URL
   * with various Imgix query parameters applied. This API lets the user control
   * image dimensions by passing an additional path parameter in the format
   * /<width>x<height>. Rather than implement logic to follow these redirects
   * then run URLs through existing logic to rewrite Imgix params, we will just
   * pass the browser's current width and height using the Source API parameter
   * format.
   */
  const onImgIdChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = event.currentTarget.value;

      const imgId = value.startsWith('https://unsplash.com/photos/')
        ? value.replace('https://unsplash.com/photos/', '')
        : value;

      if (!imgId) {
        resetPhoto();
        return;
      }

      const width = window.innerWidth * window.devicePixelRatio;
      const height = window.innerHeight * window.devicePixelRatio;

      const url = new URL(`https://source.unsplash.com/${imgId}/${width}x${height}`);
      setCurrentPhoto({urls: {full: url.href}} as any);
    } catch {
      resetPhoto();
    }
  }, [
    resetPhoto,
    setCurrentPhoto
  ]);

  if (!showDevTools) {
    return null;
  }

  const color = toColorString(currentPhoto?.palette.vibrant) ?? 'black';
  const progress = modIndex(dayOffset, numPhotos) / numPhotos;

  return (
    <StyledDevTools>
      <Progress
        progress={progress}
        color={color}
      />
      <Source color={color}>
        <input
          type="text"
          onChange={onImgIdChange}
          onFocus={handleImgIdFocus}
          placeholder="https://unsplash.com/photos/:id"
          spellCheck={false}
          autoCorrect="false"
          autoComplete="false"
        />
      </Source>
      <LoadingIndicator color={color} isLoading={isLoadingPhotos} />
      <Palette photo={currentPhoto} />
    </StyledDevTools>
  );
};


export default DevTools;
