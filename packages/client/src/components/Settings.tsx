import React from 'react';
import {
  Button,
  Col,
  Form,
  Modal
} from 'react-bootstrap';

import PhotoContext from 'contexts/photo';

export interface SettingsProps {
  show?: boolean;
  onClose?: () => void;
}

const Settings: React.FunctionComponent<SettingsProps> = ({ show, onClose }) => {
  const { name, setName } = React.useContext(PhotoContext);
  const [tempName, setTempName] = React.useState<string | undefined>();

  React.useEffect(() => {
    setTempName(name);
  }, [name]);

  const handleClose = React.useCallback(() => {
    setName(tempName ?? '');
    console.debug('should set name to', tempName);

    if (onClose) {
      onClose();
    }
  }, [onClose, setName, tempName]);

  return (
    <Modal
      size="lg"
      centered
      show={show}
      onHide={onClose}
    >
      <Modal.Body className="bg-dark text-light shadow-lg">
        <Modal.Title className="display-4 text-light mb-4">Settings</Modal.Title>
        <Form noValidate>
          <Form.Row>
            <Form.Group controlId="formBasicEmail" as={Col} lg={{span: 8, offset: 2}}>
              <Form.Label>
                Name
              </Form.Label>
              <Form.Control
                type="text"
                className="bg-dark text-light"
                value={tempName}
                size="lg"
                onChange={e => {
                  setTempName(e.target.value);
                }}
              />
            </Form.Group>
          </Form.Row>

        </Form>
        <footer className="text-right mt-5">
          <Button
            variant="secondary"
            className="btn-lg"
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
