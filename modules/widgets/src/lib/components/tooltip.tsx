// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ComponentChildren} from 'preact';
import {useRef, useState, useEffect, useCallback} from 'preact/hooks';
import {computePosition, flip, shift, offset, type Placement} from '@floating-ui/dom';

export type TooltipProps = {
  /** Tooltip content — string or Preact children. */
  content: string | ComponentChildren;
  /** Position relative to the trigger.
   * @default 'right'
   */
  placement?: Placement;
  /** The trigger element */
  children: ComponentChildren;
};

export const Tooltip = ({content, placement = 'right', children}: TooltipProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const delayRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback(() => {
    clearTimeout(delayRef.current);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(delayRef.current);
    setVisible(false);
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    },
    [hide]
  );

  const tooltipRefCallback = useCallback(
    (tooltip: HTMLDivElement | null) => {
      if (!tooltip || !wrapperRef.current) return;
      const trigger = wrapperRef.current.firstElementChild as HTMLElement | null;
      if (!trigger) return;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      computePosition(trigger, tooltip, {
        placement,
        strategy: 'fixed',
        middleware: [offset(8), flip(), shift({padding: 4})]
      }).then(({x, y}) => {
        Object.assign(tooltip.style, {left: `${x}px`, top: `${y}px`, opacity: '1'});
      });
    },
    [placement]
  );

  useEffect(() => {
    return () => clearTimeout(delayRef.current);
  }, []);

  const renderContent = () => {
    if (content instanceof HTMLElement) {
      return <div ref={el => el?.replaceChildren(content.cloneNode(true))} />;
    }
    return content;
  };

  if (!content) return <>{children}</>;

  return (
    <div
      ref={wrapperRef}
      className="deck-widget-tooltip-trigger"
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      onKeyDown={onKeyDown}
    >
      {children}
      {visible && (
        <div
          ref={tooltipRefCallback}
          className="deck-widget-tooltip"
          role="tooltip"
          style={{
            position: 'fixed',
            opacity: 0,
            whiteSpace: 'nowrap',
            fontSize: '12px',
            padding: '4px 8px'
          }}
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
};
