import React from 'react';

interface WhereTheCursorIsProps {
  /** Whether the element should be in the DOM. */
  enable?: boolean;
  /** Additional X offset to apply to the element's position. */
  xOffset?: string;
  /** Additional Y offset to apply to the element's position. */
  yOffset?: string;
}

/**
 * Returns an invisible element that tracks the position of the cursor. Use as
 * both the `target` and `container` props of an `<Overlay>` to make it move
 * with the cursor.
 */
export function useWhereTheCursorIs(props: WhereTheCursorIsProps = {}) {
  const { enable = true, xOffset, yOffset } = props;
  const whereTheCursorIs = React.useRef(document.createElement('aside'));

  /**
   * [Effect] Adds or removes the element from the DOM.
   */
  React.useEffect(() => {
    if (enable) {
      document.body.append(whereTheCursorIs.current);
    } else {
      whereTheCursorIs.current.remove();
    }
  }, [enable]);

  /**
   * [Effect] Attaches and removes mouse listeners.
   */
  React.useEffect(() => {
    if (!whereTheCursorIs.current) return;

    whereTheCursorIs.current.style.position = 'fixed';
    whereTheCursorIs.current.style.pointerEvents = 'none';

    const handleMouseMove = (event: MouseEvent) => {
      whereTheCursorIs.current.style.left = xOffset
        ? `calc(${event.clientX}px + ${xOffset})`
        : `${event.clientX}px`;
      whereTheCursorIs.current.style.top = yOffset
        ? `calc(${event.clientY}px + ${yOffset})`
        : `${event.clientY}px`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      whereTheCursorIs.current.remove();
    };
  }, []);

  return whereTheCursorIs.current;
}
