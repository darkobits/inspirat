import { cx } from '@linaria/core';
import React from 'react';
import {
  Button,
  Col,
  Form,
  Modal,
  Row
} from 'react-bootstrap';

import InspiratContext from 'contexts/Inspirat';
import useHideCallback from 'hooks/use-hide-callback';


// ----- Props -----------------------------------------------------------------

export interface SettingsProps {
  show?: boolean;
  onClose?: () => void;
}


// ----- Settings --------------------------------------------------------------

const Settings: React.FunctionComponent<SettingsProps> = ({ show, onClose }) => {
  const { name, setName } = React.useContext(InspiratContext);
  const [tempName, setTempName] = React.useState<string | undefined>();


  /**
   * [Effect] LocalStorage -> Input sync. This _should_ only happen once, when
   * the component mounts.
   */
  React.useEffect(() => {
    setTempName(name);
  }, [
    name
  ]);


  /**
   * [Callback] Sets the new name, waits 500ms, then invokes onClose.
   */
  const [isHiding, handleClose] = useHideCallback({
    hideTime: 500,
    onBeginHide: () => {
      setName(tempName ?? '');
    },
    onEndHide: () => {
      if (onClose) {
        onClose();
      }
    }
  }, [
    onClose,
    setName,
    tempName
  ]);


  return (
    <Modal
      animation={false}
      centered
      onHide={handleClose}
      show={show}
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
            {process.env.GIT_DESC}
          </div>
        </h1>
        <hr className="bg-secondary mb-4 mx-2" />
        <Form
          noValidate
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
          }}
        >
          <Form.Group as={Row} controlId="name">
            <Col sm={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} className="pb-3">
              Customize the name that appears in the greeting.
            </Col>
            <Form.Label column="lg" sm={{ span: 2, offset: 1 }} lg={{ span: 2, offset: 2 }}>
              Name
            </Form.Label>
            <Col sm="8" lg="6">
              <Form.Control
                type="text"
                className="bg-dark text-light"
                defaultValue={tempName}
                size="lg"
                onChange={e => {
                  console.debug('Got change event:', e.target);
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
