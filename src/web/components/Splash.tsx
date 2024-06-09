/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import ms from 'ms';
import React from 'react';

import BackgroundImage from 'web/components/BackgroundImage';
import Greeting from 'web/components/Greeting';
import SplashLower from 'web/components/SplashLower';
import InspiratContext from 'web/contexts/Inspirat';
import { BACKGROUND_TRANSITION_DURATION } from 'web/etc/constants';
import { Logger } from 'web/lib/log';

import classes from './Splash.css';

import type { InspiratPhotoResource } from 'etc/types';
import type { ElementProps } from 'web/etc/types';

const log = new Logger({ prefix: '🌅 •' });

const INITIAL_LOAD_TRANSITION_DURATION = '0.5s';

/**
 * TODO: Deprecate usage of maskColor and maskAmount overrides. Use photo
 * palette with a box-shadow around text instead.
 */
export function Splash(props: ElementProps<HTMLDivElement>) {
  const { className, style, ...restProps } = props;
  const { currentPhoto, dayOffset } = React.useContext(InspiratContext);
  const [aPhoto, setAPhoto] = React.useState<InspiratPhotoResource | void>();
  const [bPhoto, setBPhoto] = React.useState<InspiratPhotoResource | void>();
  const [transitionDuration, setTransitionDuration] = React.useState(INITIAL_LOAD_TRANSITION_DURATION);
  const activeElement = dayOffset % 2 === 0 ? 'A' : 'B';

  /**
   * [Effect] Handles changes to photo URLs. Sets the transition duration to its
   * configured setting after the initial photo has loaded.
   */
  React.useEffect(() => {
    if (!currentPhoto) return;

    let clearPhotoTimeoutHandle: NodeJS.Timeout;

    // @ts-expect-error - Fix type defs.
    const { id, weight } = currentPhoto;

    if (activeElement === 'A') {
      log.debug('[Splash] A:', id, weight?.name, Number(weight?.value).toFixed(2));
      setAPhoto(currentPhoto);
      clearPhotoTimeoutHandle = setTimeout(() => setBPhoto(), ms(transitionDuration));
    } else if (activeElement === 'B') {
      log.debug('[Splash] B:', id, weight?.name, Number(weight?.value).toFixed(2));
      setBPhoto(currentPhoto);
      clearPhotoTimeoutHandle = setTimeout(() => setAPhoto(), ms(transitionDuration));
    }

    let transitionDurationTimeoutHandle: NodeJS.Timeout;

    if (transitionDuration !== BACKGROUND_TRANSITION_DURATION) {
      transitionDurationTimeoutHandle = setTimeout(() => {
        setTransitionDuration(BACKGROUND_TRANSITION_DURATION);
      }, ms(transitionDuration));
    }

    return () => {
      clearTimeout(clearPhotoTimeoutHandle);
      clearTimeout(transitionDurationTimeoutHandle);
    };
  }, [currentPhoto?.id, transitionDuration]);

  // NOTE: SplashLower is nested inside BackgroundImage so that image metadata
  // can be displayed for both images simultaneously and fade in/out with the
  // associated image.
  // TODO: Make <SplashLower> a part of <BackgroundImage>?
  return (
    <div
      data-testid="Splash"
      role="button"
      tabIndex={0}
      className={cx(classes.splash, className)}
      style={style}
      {...restProps}
    >
      <BackgroundImage
        id="A"
        photo={aPhoto}
        isActive={activeElement === 'A'}
        style={{ transitionDuration }}
      >
        <SplashLower photo={aPhoto} />
      </BackgroundImage>
      <BackgroundImage
        id="B"
        photo={bPhoto}
        isActive={activeElement === 'B'}
        style={{ transitionDuration }}
      >
        <SplashLower photo={bPhoto} />
      </BackgroundImage>
      <Greeting style={{ transitionDuration }} />
    </div>
  );
}
