import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Color, InspiratPhotoResource } from 'inspirat-types';
import mousetrap from 'mousetrap';
import { darken, desaturate, readableColor, lighten } from 'polished';
import React from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';
import { BsArrowRepeat, BsCheck } from 'react-icons/bs';
import { v4 as uuid } from 'uuid';


import InspiratContext from 'contexts/Inspirat';
import { ifDebug, modIndex, rgba } from 'lib/utils';


// ----- Progress Indicator ----------------------------------------------------

/**
 * Basis for computing various attributes of the Source and Swatch components.
 */
const BASIS = '32px';
const BLACK: Color  = {r: 0, g: 0, b: 0};
const WHITE: Color = {r: 255, g: 255, b: 255};


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


// ----- Progress Indicator ----------------------------------------------------

interface ProgressProps extends React.PropsWithChildren<any> {
  photo?: InspiratPhotoResource;
  progress: number;
  onProgressChange?: (progress: number) => void;
}

/**
 * Progress bar that resides at the top of the screen and reflects the current
 * position in the photo collection.
 */
const StyledProgress = styled.div<{ fgColor: Color; bgColor: Color; progress: number }>`
  background-color: ${({ bgColor }) => rgba(bgColor)};
  border-left-color: ${({ fgColor }) => rgba(fgColor)};
  border-left-style: solid;
  border-left-width: ${({ progress }) => (progress || 0) * 100}vw;
  height: 4px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: border-left-width 0.2s ease-in, height 0.2s linear;

  &:hover {
    cursor: pointer;
    height: 10px;
  }
`;

/**
 * TODO: Implement dynamically-positioned tooltip that reads 152/255 where the
 * numerator is the photo the user would navigate to if they clicked on the
 * progress bar and the denominator is the total number of photos in the
 * collection.
 */
const Progress = ({ photo, progress, onProgressChange, children }: ProgressProps) => {
  // const [hoverProgress, setHoverProgress] = React.useState(0);
  // const [tooltipLeftOffset, setTooltipLeftOffset] = React.useState(0);
  const fgColor = photo?.palette?.muted ?? WHITE;
  const bgColor = photo?.palette?.darkMuted ?? BLACK;
  const target = React.useRef(null);


  /**
   * [Callback] Invoke user-provided progress callback when the progress bar is
   * clicked.
   */
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { left, right } = e.currentTarget.getBoundingClientRect();
    const { clientX } = e;
    const userProgress = (clientX - left) / (right - left);

    if (onProgressChange) {
      onProgressChange(userProgress);
    }
  }, [onProgressChange]);


  /**
   * [Callback] Re-compute the element's title attribute when the mouse moves
   * over the element.
   */
  // const handleMouseMove =
  // React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  //   const { left, right } = e.currentTarget.getBoundingClientRect();
  //   const { clientX } = e;
  //   const userProgress = (clientX - left) / (right - left);
  // }, []);

  return (
    <StyledProgress
      fgColor={fgColor}
      bgColor={bgColor}
      progress={progress}
      onClick={handleClick}
      // onMouseMove={handleMouseMove}
      ref={target}
    >
      {children}
      {/* <Overlay target={target.current} show placement="bottom">
        {props => {
          console.debug('tooltip props', props);
          return (
            <Tooltip id="overlay-example" {...props}>
              {hoverProgress}
            </Tooltip>
          );
        }}
      </Overlay> */}
    </StyledProgress>
  );
};


// ----- Image Source ----------------------------------------------------------

interface SourceProps extends React.PropsWithChildren<any> {
  photo?: InspiratPhotoResource;
}

/**
 * Image override component.
 */
const StyledSource = styled.div<{ fgColor: Color; bgColor: Color }>`
  height: ${BASIS};
  width: 100%;
  margin-right: 12px;
  backdrop-filter: blur(20px);

  input {
    background-color: ${({ bgColor }) => darken(0.2, rgba(bgColor, 0.7))};
    backdrop-filter: blur(10px);
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
    border-color: ${({ fgColor }) => desaturate(0.6, rgba(fgColor, 0.4))};
    box-shadow: 0px 0px 2px 1px ${({ bgColor }) => rgba(bgColor, 0.16)};
    color: ${({ fgColor }) => desaturate(0, lighten(0.16, rgba(fgColor)))};
    /* font-family: sans-serif; */
    font-size: 14px;
    font-size: inherit;
    font-weight: 400;
    height: ${BASIS};
    line-height: ${BASIS};
    padding: 0px 10px;
    width: 100%;
    transition: all 0.15s ease-in-out;

    &:focus {
      outline: none;
      box-shadow: 0px 0px 1px 1px ${({ bgColor }) => rgba(bgColor, 0.32)};
      background-color: ${({ bgColor }) => darken(0.2, rgba(bgColor, 0.8))};
      border-color: ${({ fgColor }) => desaturate(0.6, rgba(fgColor, 0.6))};
    }

    &::placeholder {
      color: ${({ fgColor }) => rgba(fgColor, 0.64)};
    }

    &::selection {
      background-color: ${({ bgColor }) => darken(0.05, rgba(bgColor, 0.5))};
    }
  }
`;

const Source = ({ photo, children }: SourceProps) => {
  const fgColor = photo?.palette?.lightMuted ?? WHITE;
  const bgColor = photo?.palette?.darkVibrant ?? BLACK;

  return (
    <StyledSource fgColor={fgColor} bgColor={bgColor}>
      {children}
    </StyledSource>
  );
};


// ----- Swatch ---------------------------------------------------------------

interface SwatchProps extends React.PropsWithChildren<any> {
  color?: Color;
}

const StyledSwatch = styled.div<{ notHtmlColor?: Color }>`
  align-items: center;
  background-color: ${({ notHtmlColor }) => rgba(notHtmlColor ?? WHITE)};
  border-radius: 4px;
  border: 1px solid ${({ notHtmlColor }) => darken(0.2, rgba(notHtmlColor ?? BLACK, 0.42))};
  color: ${({ notHtmlColor }) => readableColor(rgba(notHtmlColor ?? WHITE))};
  display: flex;
  font-size: 12px;
  height: ${BASIS};
  justify-content: center;
  text-transform: capitalize;
  width: 32px;
`;

/**
 * Renders a div whose background color is the provided color and whose text
 * color will be a 'readable' color according to Polished.
 */
const Swatch = ({ color, children, ...props }: SwatchProps) => {
  const [tooltipId] = React.useState(uuid());
  const tooltipTarget = React.useRef(null);
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <StyledSwatch
      ref={tooltipTarget}
      notHtmlColor={color}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      <Overlay
        target={tooltipTarget.current}
        show={showTooltip}
        placement="auto"
        flip
      >
        {props => (
          <Tooltip id={tooltipId} {...props}>
            {children}
          </Tooltip>
        )}
      </Overlay>
    </StyledSwatch>
  );
};


// ----- Loading Indicator -----------------------------------------------------

interface LoadingIndicatorProps {
  photo?: InspiratPhotoResource;
  isLoading: boolean;
}

const StyledLoadingIndicator = styled.div<{ fgColor?: Color; bgColor?: Color }>`
  align-items: center;
  background-color: ${({ bgColor }) => rgba(bgColor ?? BLACK)};
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
  display: flex;
  height: ${BASIS};
  justify-content: center;
  transition: background-color 1s ease;
  width: ${BASIS};

  & svg {
    color: ${({ fgColor }) => rgba(fgColor ?? WHITE)};
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


const LoadingIndicator = ({ photo, isLoading }: LoadingIndicatorProps) => {
  const fgColor = photo?.palette?.lightVibrant ?? WHITE;
  const bgColor = photo?.palette?.darkMuted ?? BLACK;

  return (
    <StyledLoadingIndicator fgColor={fgColor} bgColor={bgColor}>
      {isLoading ? <BsArrowRepeat className={spinClassName} /> : <BsCheck />}
    </StyledLoadingIndicator>
  );
};


// ----- Palette ---------------------------------------------------------------

interface PaletteProps {
  photo?: InspiratPhotoResource;
}

/**
 * Renders a Swatch for each color in a photo's 'palette'.
 */
const Palette = ({ photo }: PaletteProps) => {
  if (!photo || !photo.palette) {
    return null;
  }

  return (
    <div
      className={css`
        margin-left: 12px;
      `}
    >
      {Object.entries(photo.palette).map(([colorName, swatch]) => {
        return (
          <Swatch
            key={colorName}
            color={swatch}
            className={css`
              &:not(:last-child) {
                margin-bottom: 14px;
              }
            `}
          >
            <span className="text-capitalize">
              {swatch ? colorName : 'N/A'}
            </span>
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
        : undefined;

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


  /**
   * [Callback] Explicitly sets the day offset when we get a progress update
   * from the progress bar.
   */
  const handleProgressChange = React.useCallback((newProgress: number) => {
    setDayOffset(Math.floor(numPhotos * newProgress));
  }, [setDayOffset]);


  if (!showDevTools) {
    return null;
  }


  const progress = modIndex(dayOffset, numPhotos) / numPhotos;


  return (
    <StyledDevTools>
      <Progress
        progress={progress}
        photo={currentPhoto}
        onProgressChange={handleProgressChange}
      />
      <Source photo={currentPhoto}>
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
      <LoadingIndicator photo={currentPhoto} isLoading={isLoadingPhotos} />
      <Palette photo={currentPhoto} />
    </StyledDevTools>
  );
};


export default DevTools;
