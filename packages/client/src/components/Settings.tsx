import { css } from 'linaria';
import React from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';

import PhotoContext from 'contexts/photo';
import setupShowHideAnimation, { AnimateDescriptor } from 'lib/animate';


// ----- Styles ----------------------------------------------------------------

const modalStyles = css`
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif;
`;


// ----- Props -----------------------------------------------------------------

export interface SettingsProps {
  show?: boolean;
  onClose?: () => void;
}


// ----- Settings --------------------------------------------------------------

const Settings: React.FunctionComponent<SettingsProps> = ({ show, onClose }) => {
  const { name, setName } = React.useContext(PhotoContext);
  const [tempName, setTempName] = React.useState<string | undefined>();
  const [animateBackdrop, setAnimateBackdrop] = React.useState<AnimateDescriptor>();
  const [animateModal, setAnimateModal] = React.useState<AnimateDescriptor>();

  /**
   * [Effect] Setup animation on mount.
   *
   * TODO: Create a custom hook for this so its less verbose.
   */
  React.useEffect(() => {
    setAnimateBackdrop(setupShowHideAnimation({
      // in: 'fadeIn',
      // out: 'fadeOut'
      speed: 'faster',
      initialState: show ? 'show' : 'hide'
    }, document.querySelector<HTMLDivElement>('.modal-backdrop')));

    setAnimateModal(setupShowHideAnimation({
      in: 'zoomIn',
      out: 'zoomOut',
      speed: 'faster',
      initialState: show ? 'show' : 'hide'
    }, document.querySelector<HTMLDivElement>('.modal')));
  }, []);


  /**
   * [Effect] Run custom show/hide animations when 'show' changes.
   */
  React.useEffect(() => {
    if (!animateBackdrop || !animateModal) {
      return;
    }

    if (show) {
      animateBackdrop.show();
      animateModal.show();
    } else {
      animateBackdrop.hide();
      animateModal.hide();
    }
  }, [
    animateBackdrop,
    animateModal,
    show
  ]);


  /**
   * [Effect] One-time LocalStorage -> Input sync.
   */
  React.useEffect(() => {
    setTempName(name);
  }, [name]);


  /**
   * [Callback] Updates name globally, then calls the provided onClose handler.
   */
  const handleClose = React.useCallback(() => {
    setName(tempName ?? '');

    if (onClose) {
      onClose();
    }
  }, [onClose, setName, tempName]);


  return (
    <Modal
      size="lg"
      centered
      show
      onHide={handleClose}
      className={modalStyles}
      animation={false}
    >
      <Modal.Body className="bg-dark text-light shadow-lg">
        <h1 className="text-light mb-4 mt-1 ml-2 font-weight-light" style={{ letterSpacing: '1px' }}>
          Inspirat
        </h1>
        <hr className="bg-secondary mb-4" />
        <Form noValidate>
          <Form.Group as={Row} controlId="name">
            <Form.Label column="lg" sm={{ span: 2, offset: 2 }}>
              Name
            </Form.Label>
            <Col sm="6">
              <Form.Control
                type="text"
                className="bg-dark text-light"
                defaultValue={tempName}
                size="lg"
                onChange={e => {
                  setTempName(e.target.value);
                }}
              />
            </Col>
          </Form.Group>
        </Form>
        <footer className="text-right mt-5">
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Done
          </Button>
        </footer>
      </Modal.Body>
    </Modal>
  );
};


export default Settings;
