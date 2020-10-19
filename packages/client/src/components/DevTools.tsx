import { css } from 'linaria';
import { styled } from 'linaria/react';
import mousetrap from 'mousetrap';
import { darken, desaturate, readableColor, rgba } from 'polished';
import * as R from 'ramda';
import React from 'react';
import { BsArrowRepeat, BsCheck } from 'react-icons/bs';

import InspiratContext from 'contexts/Inspirat';
import { ifDebug, modIndex } from 'lib/utils';


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
  z-index: 0;
`;


/**
 * Progress bar that resides at the top of the screen and reflects the current
 * position in the photo collection.
 */
const Progress = styled.div<{progress: number; color: string}>`
  background-color: ${props => rgba(readableColor(props.color || 'white'), 0.42)};
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
 * Image source input that resides at the top of the screen in development mode
 * when the "dev=true" query param is present.
 */
const Source = styled.div<SwatchProps>`
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


/**
 * Swatch component that shows the "color"
 */
interface SwatchProps {
  color: string;
}

const Swatch = styled.div<SwatchProps>`
  background-color: ${R.prop('color')};
  border-radius: 4px;
  border: 1px solid ${props => rgba(darken(0.48, props.color), 0.32)};
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
  height: ${BASIS};
  margin-right: 12px;
  width: ${BASIS};
`;

// ----- Loading Indicator -----------------------------------------------------

interface LoadingIndicatorProps {
  color?: string;
  isLoading: boolean;
}

const StyledLoadingIndicator = styled.div<{ color?: string }>`
  background-color: ${props => rgba(readableColor(props.color ?? 'white'), 0.42)};
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.16);
  width: 32px;
  height: ${BASIS};
  padding-top: 1px;
  text-align: center;

  & svg {
    color: ${props => rgba(props.color ?? 'white', 1)};
    filter: drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16));
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

const LoadingIndicator = ({ color, isLoading }: LoadingIndicatorProps) => {
  return (
    <StyledLoadingIndicator color={color}>
      {isLoading ? <BsArrowRepeat className={spinClassName} /> : <BsCheck />}
    </StyledLoadingIndicator>
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
   * [Callback] Handle updates to the image source field.
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

      const url = new URL(`https://source.unsplash.com/${imgId}`);
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

  const color = currentPhoto?.color ?? 'black';
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
          placeholder="https://unsplash.com/photos/:id"
          spellCheck={false}
          autoCorrect="false"
          autoComplete="false"
        />
      </Source>
      <Swatch color={color} title="Photo Swatch Color" />
      <LoadingIndicator color={color} isLoading={isLoadingPhotos} />
    </StyledDevTools>
  );
};


export default DevTools;
