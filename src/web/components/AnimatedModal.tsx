import React from 'react';
import { Modal } from 'react-bootstrap';
import { twMerge } from 'tailwind-merge';

import useDelayedCallback from 'web/hooks/use-delayed-callback';

import type { GenericFunction, ElementProps } from 'web/etc/types';

interface Props extends ElementProps {
  onClose?: GenericFunction | undefined;
  onBeginHide?: () => void;
  show?: boolean | undefined;
  body: React.ReactNode;
  footer?: React.ReactNode;
}

export const AnimatedModal = React.memo((props: Props) => {
  const { id, show, body, footer, onBeginHide, onClose, className } = props;
  const [showInternal, setShowInternal] = React.useState(false);


  /**
   * [Callback] Sets the new name, waits 500ms, then invokes onClose.
   */
  const [isClosing, handleClose] = useDelayedCallback({
    time: 500,
    onBegin: () => {
      if (onBeginHide) onBeginHide();
    },
    onEnd: () => {
      setShowInternal(false);
      if (onClose) onClose();
    }
  }, [onClose]);


  /**
   * [Effect] When `show` becomes truthy, immediately show the modal. When it
   * becomes falsy, invoke our `handleClose` function, which will trigger the
   * hide animation and then hide the modal and call `onClose` when it
   * finishes.
   */
  React.useEffect(() => {
    if (show === true) {
      setShowInternal(true);
      return;
    }

    if (show === false) {
      void handleClose();
    }
  }, [show, handleClose]);


  return (
    <Modal
      id={id}
      onHide={handleClose}
      show={showInternal}
      className={twMerge(
        'animate__animated',
        !isClosing ? 'animate__zoomIn' : 'animate__zoomOut',
        'h-full w-full'
      )}
      contentClassName={className ?? ''}
      dialogClassName="h-full w-full flex flex-column items-center justify-center"
    >
      <Modal.Body>
        {body}
      </Modal.Body>
      <Modal.Footer>
        {footer}
      </Modal.Footer>
    </Modal>
  );
});
