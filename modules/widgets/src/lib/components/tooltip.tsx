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
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const delayRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback(() => {
    clearTimeout(delayRef.current);
    delayRef.current = setTimeout(() => setVisible(true), 100);
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

  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return undefined;
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    computePosition(trigger, tooltip, {
      placement,
      strategy: 'fixed',
      middleware: [offset(8), flip(), shift({padding: 4})]
    }).then(({x, y}) => {
      Object.assign(tooltip.style, {left: `${x}px`, top: `${y}px`});
    });

    return undefined;
  }, [visible, placement]);

  useEffect(() => {
    return () => clearTimeout(delayRef.current);
  }, []);

  const renderContent = () => {
    if (content instanceof HTMLElement) {
      return <div ref={el => el && !el.firstChild && el.appendChild(content.cloneNode(true))} />;
    }
    return content;
  };

  if (!content) return <>{children}</>;

  return (
    <div
      ref={triggerRef}
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
          ref={tooltipRef}
          className="deck-widget-tooltip"
          role="tooltip"
          style={{position: 'fixed', visibility: visible ? 'visible' : 'hidden'}}
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
};
