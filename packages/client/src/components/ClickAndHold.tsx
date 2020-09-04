import React from 'react';


export interface ClickAndHoldProps extends React.PropsWithChildren<HTMLDivElement> {
  threshold: number;
}

const ClickAndHold: React.FunctionComponent<ClickAndHoldProps> = ({ threshold, children, ...rest }) => {
  console.log(threshold);

  const handleMouseDown = React.useCallback(() => {
    console.debug('mouse down');
  }, []);

  const handleMouseUp = React.useCallback(() => {
    console.debug('mouse up');
  }, []);

  return (
    <div
      role="button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      tabIndex={0}
      {...rest}
    >
      {children}
    </div>
  );
};


export default ClickAndHold;
