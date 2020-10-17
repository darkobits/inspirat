import {styled} from 'linaria/react';
import mousetrap from 'mousetrap';
import {rgba} from 'polished';
import React from 'react';

import InspiratContext from 'contexts/Inspirat';
import { ifDebug } from 'lib/utils';


// ----- Styles ----------------------------------------------------------------

/**
 * Basis for computing various attributes of the Source and Swatch components.
 */
const BASIS = '28px';


/**
 * Swatch component that resides at the top of the screen in development mode
 * when the "dev=true" query param is present.
 */
interface SwatchProps {
  color: string;
}

const Swatch = styled.div<SwatchProps>`
  background-color: ${props => props.color};
  border-radius: ${BASIS};
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
  position: absolute;
  width: ${BASIS};
  height: ${BASIS};
  top: 8px;
  right: 8px;
  z-index: 1;
`;


/**
 * Image source input that resides at the top of the screen in development mode
 * when the "dev=true" query param is present.
 */
const Source = styled.div`
  height: ${BASIS};
  left: 8px;
  position: absolute;
  top: 8px;
  width: calc(100% - ${BASIS} - 26px);
  z-index: 2;

  input {
    background: rgba(255, 255, 255, 0.5);
    border-radius: ${BASIS};
    border: none;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
    color: rgba(0, 0, 0, 0.6);
    font-family: sans-serif;
    font-size: 15px;
    font-size: inherit;
    font-weight: 500;
    height: ${BASIS};
    letter-spacing: 0.3px;
    line-height: ${BASIS};
    padding: 0px 10px 0px 14px;
    width: 100%;

    &:focus {
      outline: none;
    }

    &::selection {
      background-color: rgba(255, 255, 255, 0.5);
    }
  }
`;


/**
 * Progress bar that resides at the top of the screen in development mode when
 * the "dev=true" query parameter is present.
 */
const Progress = styled.div<{progress: number; color: string}>`
  border-left-color: ${props => rgba(props.color || 'white', 1)};
  border-left-style: solid;
  border-left-width: ${props => (props.progress || 0) * 100}vw;
  height: 2px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: border-left-width 0.2s ease-in;
`;


// ----- Dev Tools -------------------------------------------------------------

/**
 * TODO: Showing the dev tools currently changes the photo shown. Should use the
 * photo that would be shown if dev tools were hidden.
 */
const DevTools: React.FunctionComponent = () => {
  const {
    dayOffset,
    showDevTools,
    currentPhoto,
    setCurrentPhoto,
    setDayOffset,
    resetPhoto,
    numPhotos
  } = React.useContext(InspiratContext);


  /*
   * [Effect] Create Dev Tools key bindings.
   */
  React.useEffect(() => ifDebug(() => {
    if (!showDevTools) {
      return;
    }

    mousetrap.bind('left', () => {
      setDayOffset('decrement');
    });

    mousetrap.bind('right', () => {
      setDayOffset('increment');
    });

    console.debug('[Development] Keyboard shortcuts registered.');

    return () => {
      mousetrap.unbind('left');
      mousetrap.unbind('right');
    };
  }), [showDevTools]);


  /**
   * [Callback] Handle updates to the image source field.
   */
  const onSrcChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const url = new URL(event.target.value);
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


  return (<>
    <Progress
      progress={(dayOffset % numPhotos || 0) / numPhotos}
      color={color}
    />
    <Source>
      <input type="text" onChange={onSrcChange} />
    </Source>
    <Swatch color={color} />
  </>);
};


export default DevTools;
