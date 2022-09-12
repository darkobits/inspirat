import React from 'react';
import { Button } from 'react-bootstrap';

import { AnimatedModal } from 'components/AnimatedModal';
import { useInspirat } from 'hooks/use-inspirat';
import { isChromeExtension } from 'lib/utils';

import classes from './Introduction.css';


export const Introduction = () => {
  const { hasSeenIntroduction, setHasSeenIntroduction } = useInspirat();

  /**
   * [Event Handler] When the modal backdrop is clicked or the 'OK' button is
   * pressed, update the introduction flag, which will hide the modal.
   */
  const handleClose = React.useCallback(() => {
    if (setHasSeenIntroduction) setHasSeenIntroduction(true);
  }, [setHasSeenIntroduction]);

  const unsplashLink = React.useMemo(() => (
    <a
      href="https://unsplash.com/"
      target="_blank"
      rel="noreferrer noopener"
      title="Unsplash"
    >
      Unsplash
    </a>
  ), []);

  if (
    !isChromeExtension() ||
    hasSeenIntroduction === undefined ||
    hasSeenIntroduction
  ) return null;

  return (
    <AnimatedModal
      id="introduction"
      className={classes.introduction}
      show={!hasSeenIntroduction}
      onClose={handleClose}
      body={<>
        <h1
          className="d-flex align-items-end justify-content-between mb-3 mx-2 text-light font-weight-light"
          style={{ letterSpacing: '1px' }}
        >
          <div>
            Inspirat
          </div>
          <div style={{ fontSize: '14px', lineHeight: '26px' }}>
            {import.meta.env.GIT_DESC}
          </div>
        </h1>
        <hr className="bg-secondary mb-4" />
        <div className="mx-2">
          <p>
            Welcome to Inspirat, a New Tab experience for Chrome and Chromium-based browsers.
          </p>
          <p>
            Each day, Inspirat will display a beautiful photograph from {unsplashLink}. To customize
            Inspirat, simply click and hold anywhere on the screen to open the settings menu.
          </p>
          <p>
            – Enjoy!
          </p>
        </div>
      </>}
      footer={
        <Button
          variant="secondary"
          onClick={handleClose}
        >
          OK
        </Button>
      }
    />
  );
};
