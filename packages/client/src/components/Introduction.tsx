import { css } from '@linaria/core';
import React from 'react';
import { Button } from 'react-bootstrap';

import { AnimatedModal } from 'components/AnimatedModal';
import { useInspirat } from 'hooks/use-inspirat';
import { isPending } from 'hooks/use-storage-item';
import { isChromeExtension } from 'lib/utils';


const styles = {
  introduction: css`
    a {
      color: inherit;
      transition: all 0.25s ease-in-out;
      text-shadow: 0px 0px 1px rgba(255, 255, 255, 1);

      &:hover {
        text-shadow: 0px 0px 1px rgba(255, 255, 255, 1), 0px 0px 6px rgba(255, 255, 255, 0.66);
      }
    }
  `
};


export const Introduction: React.FunctionComponent = () => {
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


  if (!isChromeExtension() || isPending(hasSeenIntroduction)) return null;


  return (
    <AnimatedModal
      id="introduction"
      className={styles.introduction}
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
            {process.env.GIT_DESC}
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
