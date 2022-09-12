import cx from 'classnames';
import React from 'react';
import {
  Button,
  Col,
  Form,
  Row
} from 'react-bootstrap';

import { AnimatedModal } from 'components/AnimatedModal';
import { GenericFunction } from 'etc/types';
import { useInspirat } from 'hooks/use-inspirat';


// ----- Props -----------------------------------------------------------------

export interface SettingsProps {
  show: boolean | undefined;
  onClose?: GenericFunction | undefined;
}

export const Settings: React.FunctionComponent<SettingsProps> = ({ show, onClose }) => {
  const { name, setName } = useInspirat();
  const [tempName, setTempName] = React.useState<string | undefined>();


  /**
   * [Effect] Replicates global state to local state.
   */
  React.useEffect(() => {
    if (typeof name === 'string') setTempName(name);
  }, [name, setTempName, show]);


  /**
   * [Callback] When the form is submitted, replicates internal data to global
   * state, then closes the modal.
   */
  const handleSubmit = React.useCallback(() => {
    if (setName) setName(tempName ?? '');
    if (onClose) onClose();
  }, [setName, onClose, tempName]);

  const version = import.meta.env.GIT_DESC;

  return (
    <AnimatedModal
      show={show}
      onClose={onClose}
      body={<>
        <div className="d-flex flex-row align-items-end justify-content-between mb-3">
          <h1 className="text-light font-weight-light mb-0">
            Inspirat
          </h1>
          <div
            className={cx('text-secondary', 'text-fancy')}
            style={{
              fontSize: '16px',
              letterSpacing: '1.4px'
            }}
          >
            {version}
          </div>
        </div>
        <hr className="bg-secondary mb-4" />
        <Form
          noValidate
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
          }}
        >
          <Form.Group as={Row} controlId="name">
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
                  setTempName(e.target.value);
                }}
              />
            </Col>
            <Col sm={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} className="pb-3 mt-3 text-secondary">
              Customize the name that appears in the greeting.
            </Col>
          </Form.Group>
        </Form>
      </>}
      footer={
        <Button variant="secondary" onClick={handleSubmit}>
          Done
        </Button>
      }
    />
  );
};
