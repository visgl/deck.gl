// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import type {JSX, ComponentChildren} from 'preact';
import {useRef, useEffect, useMemo} from 'preact/hooks';
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
  autoUpdate,
  type Placement,
  type ComputePositionConfig
} from '@floating-ui/dom';

export type PopoverProps = {
  /** Anchor x */
  x: number;
  /** Anchor y */
  y: number;
  /** Position content relative to the anchor.
   * @default 'right'
   */
  placement?: Placement;
  /** Pixel offset
   * @default 0
   */
  offset?: number;
  /**
   * Show an arrow pointing at the anchor. Optionally accepts a pixel size.
   * @default false
   */
  arrow?: false | number | [width: number, height: number];
  /**
   * CSS color of the arrow
   * @default 'white'
   */
  arrowColor?: string;
  /** Content of the popover */
  children: ComponentChildren;
};

export const Popover = ({
  x,
  y,
  placement = 'right',
  offset: pixelOffset = 0,
  arrow: arrowSize = false,
  arrowColor = 'white',
  children
}: PopoverProps) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const updaterRef = useRef<() => void>();

  updaterRef.current = () => {
    if (!anchorRef.current || !contentRef.current) return;

    const arrowWidth = Array.isArray(arrowSize) ? arrowSize[0] : arrowSize || 0;
    const arrowHeight = Array.isArray(arrowSize) ? arrowSize[1] : arrowSize || 0;
    const padding = pixelOffset + Math.max(arrowHeight, arrowWidth);

    const middleware: ComputePositionConfig['middleware'] = placement.includes('-')
      ? [offset(padding), flip(), shift()]
      : [offset(padding), shift(), flip()];
    if (arrowRef.current) middleware.push(arrow({element: arrowRef.current}));
    computePosition(anchorRef.current, contentRef.current, {
      placement,
      strategy: 'fixed',
      middleware
    }).then(popoverPos => {
      if (contentRef.current) {
        Object.assign(contentRef.current.style, {
          left: `${popoverPos.x}px`,
          top: `${popoverPos.y}px`
        });
      }

      const arrowData = popoverPos.middlewareData.arrow;
      if (arrowData && arrowRef.current) {
        const arrowStyle = createArrow(arrowWidth, arrowHeight, arrowColor, popoverPos.placement);
        arrowStyle.transform = `translate(${arrowData.x || 0}px, ${arrowData.y || 0}px)`;
        Object.assign(arrowRef.current.style, arrowStyle);
      }
    });
  };

  useMemo(() => {
    updaterRef.current?.();
  }, [placement, arrowSize, pixelOffset]);

  useEffect(() => {
    // initial mount
    if (contentRef.current) {
      contentRef.current.style.visibility = 'visible';
    }
    const cleanup = autoUpdate(anchorRef.current!, contentRef.current!, () =>
      updaterRef.current?.()
    );
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div style={{position: 'absolute', left: x, top: y}} ref={anchorRef}>
      <div
        className="deck-widget deck-widget-popover"
        style={{position: 'fixed', visibility: 'hidden', pointerEvents: 'none'}}
        ref={contentRef}
      >
        {Boolean(arrowSize) && (
          <div
            className="deck-widget-popover-arrow"
            style={{position: 'absolute'}}
            ref={arrowRef}
          />
        )}
        {children}
      </div>
    </div>
  );
};

function createArrow(
  width: number,
  height: number,
  color: string,
  placement: Placement
): JSX.CSSProperties {
  const result: JSX.CSSProperties = {
    width: 0,
    height: 0,
    top: '',
    bottom: '',
    left: '',
    right: ''
  };
  if (placement.startsWith('bottom')) {
    result.borderLeft = `${width / 2}px solid transparent`;
    result.borderRight = `${width / 2}px solid transparent`;
    result.borderBottom = `${height}px solid ${color}`;
    result.borderTop = '';
    result.top = `${-height}px`;
  } else if (placement.startsWith('top')) {
    result.borderLeft = `${width / 2}px solid transparent`;
    result.borderRight = `${width / 2}px solid transparent`;
    result.borderTop = `${height}px solid ${color}`;
    result.borderBottom = '';
    result.bottom = `${-height}px`;
  } else if (placement.startsWith('right')) {
    result.borderTop = `${width / 2}px solid transparent`;
    result.borderBottom = `${width / 2}px solid transparent`;
    result.borderRight = `${height}px solid ${color}`;
    result.borderLeft = '';
    result.left = `${-height}px`;
  } else if (placement.startsWith('left')) {
    result.borderTop = `${width / 2}px solid transparent`;
    result.borderBottom = `${width / 2}px solid transparent`;
    result.borderLeft = `${height}px solid ${color}`;
    result.borderRight = '';
    result.right = `${-height}px`;
  }
  return result;
}
