import { cx } from 'linaria';
import React from 'react';
import { Button, Modal } from 'react-bootstrap';

import InspiratContext from 'contexts/Inspirat';
import useHideCallback from 'hooks/use-hide-callback';
import { isChromeExtension } from 'lib/utils';


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
    <Modal
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
          <div className="text-muted" style={{ fontSize: '14px', lineHeight: '26px' }}>
            {process.env.PACKAGE_VERSION}
          </div>
        </h1>
        <hr className="bg-secondary mb-4 mx-2" />
        <div className="mx-2">
          <p>
            Welcome to Inspirat, a New Tab experience for Chrome and Chromium-based browsers.
          </p>
          <p>
            Inspirat will display a beautiful photograph from {unsplashLink} each day, along with a
            greeting. To customize Inspirat, simply click and hold anywhere on the screen to open the
            settings menu.
          </p>
        </div>
        <footer className="text-right mt-5">
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Got It
          </Button>
        </footer>
      </Modal.Body>
    </Modal>
  );
};


export default Introduction;
