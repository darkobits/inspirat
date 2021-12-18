import { cx } from '@linaria/core';
import React from 'react';
import { Modal } from 'react-bootstrap';

import { GenericFunction, ElementProps } from 'etc/types';
import useHideCallback from 'hooks/use-hide-callback';


interface Props extends ElementProps<HTMLModElement> {
  onClose?: GenericFunction | undefined;
  onBeginHide?: () => void;
  show?: boolean | undefined;
  body: React.ReactNode;
  footer?: React.ReactNode;
}

export const AnimatedModal = (props: Props) => {
  const { id, show, body, footer, onBeginHide, onClose, className } = props;
  const [showInternal, setShowInternal] = React.useState(show ?? false);


  /**
   * [Callback] Sets the new name, waits 500ms, then invokes onClose.
   */
  const [isHiding, handleClose] = useHideCallback({
    hideTime: 500,
    onBeginHide: () => {
      if (onBeginHide) onBeginHide();
    },
    onEndHide: () => {
      setShowInternal(false);
      if (onClose) onClose();
    }
  }, [onBeginHide, onClose]);

  /**
   * [Effect] When `show` becomes truthy, immediately show the modal. When it
   * becomes falsy, invoke our `handleClose` function, which will trigger the
   * hide animation and then hide the modal and call `onClose` when it
   * finishes.
   */
  React.useEffect(() => {
    if (show) {
      setShowInternal(true);
      return;
    }

    void handleClose();
  }, [show, handleClose]);

  return (
    <Modal
      id={id}
      animation={false}
      centered
      onHide={handleClose}
      show={showInternal}
      size="lg"
      backdropClassName={cx('animate__animated', isHiding && 'animate__fadeOut', 'FOO')}
      className={cx('animate__animated', 'animate__faster', !isHiding ? 'animate__zoomIn' : 'animate__zoomOut')}
      contentClassName={className ?? ''}
    >
      <Modal.Body className={cx('bg-dark', 'text-light', 'shadow-lg', 'p-3')}>
        {body}
        {footer && <footer className="text-right mt-3">{footer}</footer>}
      </Modal.Body>
    </Modal>
  );
};
