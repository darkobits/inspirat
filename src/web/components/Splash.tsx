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

export function Splash(props: ElementProps<HTMLDivElement>) {
  const { className, style, ...restProps } = props;
  const { currentPhoto } = React.useContext(InspiratContext);
  const [aPhoto, setAPhoto] = React.useState<InspiratPhotoResource | void>();
  const [bPhoto, setBPhoto] = React.useState<InspiratPhotoResource | void>();
  const [transitionDuration, setTransitionDuration] = React.useState(INITIAL_LOAD_TRANSITION_DURATION);
  const [activeElement, setActiveElement] = React.useState<'A' | 'B'>('B');

  /**
   * [Effect] Increment `counter` whenever the current photo changes.
   */
  React.useEffect(() => {
    if (!currentPhoto?.id) return;
    setActiveElement(prev => (prev === 'A' ? 'B' : 'A'));
  }, [currentPhoto?.id]);

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
      setAPhoto(currentPhoto);
      clearPhotoTimeoutHandle = setTimeout(() => setBPhoto(), ms(transitionDuration));
    } else if (activeElement === 'B') {
      setBPhoto(currentPhoto);
      clearPhotoTimeoutHandle = setTimeout(() => setAPhoto(), ms(transitionDuration));
    }

    log.debug(`${activeElement} • collection: ${weight?.name ?? 'unknown'} • weight: ${Number(weight?.value ?? 0).toFixed(2)} • id: ${id}`);

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
  }, [activeElement]);

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
        id="BackgroundImage:A"
        photo={aPhoto}
        isActive={activeElement === 'A'}
        style={{ transitionDuration }}
      >
        <SplashLower photo={aPhoto} isActive={activeElement === 'A'} />
      </BackgroundImage>
      <BackgroundImage
        id="BackgroundImage:B"
        photo={bPhoto}
        isActive={activeElement === 'B'}
        style={{ transitionDuration }}
      >
        <SplashLower photo={bPhoto} isActive={activeElement === 'B'} />
      </BackgroundImage>
      <Greeting style={{ transitionDuration }} />
    </div>
  );
}
