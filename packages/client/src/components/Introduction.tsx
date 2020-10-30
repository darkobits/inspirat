import { cx } from 'linaria';
import { styled } from 'linaria/react';
import React from 'react';
import { Button, Modal } from 'react-bootstrap';

import InspiratContext from 'contexts/Inspirat';
import useHideCallback from 'hooks/use-hide-callback';
import { isChromeExtension } from 'lib/utils';

const IntroductionModal = styled(Modal)`
  a {
    color: inherit;
    transition: all 0.25s ease-in-out;
    text-shadow: 0px 0px 1px rgba(255, 255, 255, 1);

    &:hover {
      text-shadow: 0px 0px 1px rgba(255, 255, 255, 1), 0px 0px 6px rgba(255, 255, 255, 0.66);
    }
  }

  p {
    line-height: 1.8;
    letter-spacing: 0.018em;
  }
`;


// ----- Introduction ----------------------------------------------------------

const Introduction: React.FunctionComponent = () => {
  const { hasSeenIntroduction, setHasSeenIntroduction } = React.useContext(InspiratContext);


  /**
   * [Callback] Waits 500ms, then sets the hasSeenIntroduction flag to true.
   * This will trigger a re-render that will hide the modal.
   */
  const [isHiding, handleClose] = useHideCallback({
    hideTime: 500,
    onEndHide: () => {
      setHasSeenIntroduction(true);
    }
  }, []);


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


  if (!isChromeExtension()) {
    return null;
  }


  return (
    <IntroductionModal
      animation={false}
      centered
      onHide={handleClose}
      show={!hasSeenIntroduction}
      size="lg"
      backdropClassName={cx('animate__animated', isHiding && 'animate__fadeOut')}
      className={cx('animate__animated', 'animate__faster', !isHiding ? 'animate__zoomIn' : 'animate__zoomOut')}
    >
      <Modal.Body className="bg-dark text-light shadow-lg">
        <h1
          className="d-flex align-items-end justify-content-between mb-3 mx-2 text-light font-weight-light"
          style={{ letterSpacing: '1px' }}
        >
          <div>
            Inspirat
          </div>
          <div style={{ fontSize: '14px', lineHeight: '26px' }}>
            {process.env.GIT_VERSION}
          </div>
        </h1>
        <hr className="bg-secondary mb-4 mx-2" />
        <div className="mx-2">
          <p>
            Welcome to Inspirat, a New Tab experience for Chrome and Chromium-based browsers. Each day,
            Inspirat will display a beautiful photograph from {unsplashLink}. To customize Inspirat,
            simply click and hold anywhere on the screen to open the settings menu.
          </p>
        </div>
        <footer className="text-right mt-5">
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            OK
          </Button>
        </footer>
      </Modal.Body>
    </IntroductionModal>
  );
};


export default Introduction;
