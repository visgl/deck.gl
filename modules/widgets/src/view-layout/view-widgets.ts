// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, type WidgetProps} from '@deck.gl/core';

import type {ViewLayoutRect} from './build-views-from-view-layout';
import type {ViewLayoutLength} from './view-layout';

/** Controlled layout-only bounds for one view. */
export type ControlledViewBounds = {
  /** Left offset relative to the layout parent. */
  x: ViewLayoutLength;
  /** Top offset relative to the layout parent. */
  y: ViewLayoutLength;
  /** Width resolved by the view layout compiler. */
  width: ViewLayoutLength;
  /** Height resolved by the view layout compiler. */
  height: ViewLayoutLength;
};

/** Corner where a header resize affordance is shown. */
export type ResizeHandlePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type NumericViewBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Shared props for widgets that attach to one deck.gl view. */
export type ViewBoundsWidgetProps = WidgetProps & {
  /** The deck.gl view id whose widget container should receive this UI. */
  viewId: string;
  /** Visible label. Defaults to `viewId`. */
  label?: string;
  /** Pixel offset applied to the visible label. */
  offset?: [number, number];
};

/** Props for the experimental label widget. */
export type LabelWidgetProps = ViewBoundsWidgetProps;

/** Props for the experimental view header widget. */
export type HeaderWidgetProps = ViewBoundsWidgetProps & {
  /** Parent rectangle that constrains dragging and resizing. */
  containerRect: ViewLayoutRect;
  /** Current resolved rectangle for the attached view. */
  viewRect: ViewLayoutRect;
  /** Whether the header bar can drag the attached view. */
  draggable?: boolean;
  /** Whether the header renders a resize handle. */
  resizable?: boolean;
  /** Corner where the resize handle appears. Defaults to `bottom-right`. */
  resizeHandlePosition?: ResizeHandlePosition;
  /** Pixel margin preserved between the view and `containerRect`. */
  margin?: number;
  /** Minimum resized width in pixels. */
  minWidth?: number;
  /** Minimum resized height in pixels. */
  minHeight?: number;
  /** Maximum resized width in pixels. */
  maxWidth?: number;
  /** Maximum resized height in pixels. */
  maxHeight?: number;
  /** Called with parent-relative bounds after drag or resize. */
  onBoundsChange: (bounds: ControlledViewBounds) => void;
};

const DEFAULT_MARGIN = 16;
const DEFAULT_MIN_WIDTH = 120;
const DEFAULT_MIN_HEIGHT = 80;
const DEFAULT_MAX_WIDTH = 360;
const DEFAULT_MAX_HEIGHT = 260;
const RESIZE_ICON_MARGINS: Record<ResizeHandlePosition, string> = {
  'top-left': '2px 0 0 2px',
  'top-right': '2px 2px 0 0',
  'bottom-left': '0 0 2px 2px',
  'bottom-right': '0 2px 2px 0'
};
const RESIZE_ICON_TRANSFORMS: Record<ResizeHandlePosition, string> = {
  'top-left': 'rotate(180deg)',
  'top-right': 'rotate(-90deg)',
  'bottom-left': 'rotate(90deg)',
  'bottom-right': 'none'
};
const RESIZE_HANDLE_PLACEMENTS: Record<ResizeHandlePosition, Partial<CSSStyleDeclaration>> = {
  'top-left': {
    top: '0',
    left: '0',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    borderBottomRightRadius: '3px',
    cursor: 'nwse-resize'
  },
  'top-right': {
    top: '0',
    right: '0',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: '3px',
    cursor: 'nesw-resize'
  },
  'bottom-left': {
    bottom: '0',
    left: '0',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    borderTopRightRadius: '3px',
    cursor: 'nesw-resize'
  },
  'bottom-right': {
    right: '0',
    bottom: '0',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    borderTopLeftRadius: '3px',
    cursor: 'nwse-resize'
  }
};

/**
 * Small experimental label overlay for showing one view id.
 *
 * This is experimental presentation chrome for demos and view-layout debugging.
 */
export class LabelWidget extends Widget<LabelWidgetProps> {
  static defaultProps: Required<LabelWidgetProps> = {
    ...Widget.defaultProps,
    viewId: '',
    label: '',
    offset: [0, 0]
  };

  className = 'view-layout-label-widget';
  placement = 'fill' as const;

  constructor(props: LabelWidgetProps) {
    super(props);
    this.viewId = props.viewId;
  }

  setProps(props: Partial<LabelWidgetProps>): void {
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement): void {
    rootElement.innerHTML = '';
    applyOverlayRootStyle(rootElement);
    rootElement.style.border = '1px solid rgba(15, 23, 42, 0.28)';

    const label = document.createElement('div');
    label.textContent = this.props.label || this.props.viewId;
    label.className = 'view-layout-label';
    applyLabelStyle(label, this.props.offset);
    rootElement.append(label);
  }
}

/**
 * Experimental header chrome for a floating view.
 *
 * The widget attaches to a view container, renders a title bar, and can
 * optionally turn that title bar into a drag handle and add one corner resize
 * handle. Bounds are reported in the same parent-relative coordinate space
 * accepted by `buildViewsFromViewLayout({viewPropsById})`.
 */
export class HeaderWidget extends Widget<HeaderWidgetProps> {
  static defaultProps: Required<HeaderWidgetProps> = {
    ...Widget.defaultProps,
    viewId: '',
    label: '',
    offset: [0, 0],
    containerRect: {x: 0, y: 0, width: 1, height: 1},
    viewRect: {x: 0, y: 0, width: 1, height: 1},
    draggable: false,
    resizable: false,
    resizeHandlePosition: 'bottom-right',
    margin: DEFAULT_MARGIN,
    minWidth: DEFAULT_MIN_WIDTH,
    minHeight: DEFAULT_MIN_HEIGHT,
    maxWidth: DEFAULT_MAX_WIDTH,
    maxHeight: DEFAULT_MAX_HEIGHT,
    onBoundsChange: () => {}
  };

  className = 'view-layout-header-widget';
  placement = 'fill' as const;
  private stopDragging?: () => void;
  private stopResizing?: () => void;

  constructor(props: HeaderWidgetProps) {
    super(props);
    this.viewId = props.viewId;
  }

  setProps(props: Partial<HeaderWidgetProps>): void {
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRemove(): void {
    this.stopDragging?.();
    this.stopResizing?.();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    rootElement.innerHTML = '';
    applyOverlayRootStyle(rootElement);
    rootElement.style.border = '1px solid rgba(15, 23, 42, 0.28)';

    const header = document.createElement('button');
    header.type = 'button';
    header.textContent = this.props.label || this.props.viewId;
    header.setAttribute(
      'aria-label',
      this.props.draggable ? `Move ${header.textContent}` : `${header.textContent}`
    );
    header.className = 'view-layout-header';
    applyHeaderStyle(
      header,
      this.props.draggable,
      this.props.resizable ? this.props.resizeHandlePosition : null
    );
    if (this.props.draggable) {
      header.onpointerdown = event => this.startDragging(event, header);
    }
    rootElement.append(header);

    if (this.props.resizable) {
      rootElement.append(this.createResizeHandle());
    }
  }

  private createResizeHandle(): HTMLButtonElement {
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.setAttribute('aria-label', `Resize ${this.props.label || this.props.viewId}`);
    handle.className = `view-layout-resize-handle view-layout-resize-handle--${this.props.resizeHandlePosition}`;
    applyResizeHandleStyle(handle, this.props.resizeHandlePosition);

    const icon = createResizeIcon(this.props.resizeHandlePosition);
    Object.assign(icon.style, {
      width: '15px',
      height: '15px'
    });
    handle.append(icon);
    handle.onpointerdown = event => this.startResizing(event, handle);
    return handle;
  }

  private startDragging(event: PointerEvent, handle: HTMLButtonElement): void {
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startBounds = getRelativeBounds(this.props.viewRect, this.props.containerRect);
    const previousUserSelect = document.body.style.userSelect;

    this.stopDragging?.();
    document.body.style.userSelect = 'none';
    handle.style.cursor = 'grabbing';

    const onPointerMove = (moveEvent: PointerEvent) => {
      const nextBounds = clampPosition(
        {
          ...startBounds,
          x: startBounds.x + moveEvent.clientX - startClientX,
          y: startBounds.y + moveEvent.clientY - startClientY
        },
        this.props.containerRect,
        this.props.margin
      );
      this.props.onBoundsChange(nextBounds);
    };

    const onPointerUp = () => {
      handle.style.cursor = this.props.draggable ? 'grab' : 'default';
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      this.stopDragging = undefined;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    this.stopDragging = onPointerUp;

    event.preventDefault();
    event.stopPropagation();
  }

  private startResizing(event: PointerEvent, handle: HTMLButtonElement): void {
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startBounds = getRelativeBounds(this.props.viewRect, this.props.containerRect);
    const previousUserSelect = document.body.style.userSelect;

    this.stopResizing?.();
    document.body.style.userSelect = 'none';
    applyResizeHandleState(handle, this.props.resizeHandlePosition, true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const nextBounds = resizeBounds({
        bounds: startBounds,
        deltaX: moveEvent.clientX - startClientX,
        deltaY: moveEvent.clientY - startClientY,
        containerRect: this.props.containerRect,
        margin: this.props.margin,
        minWidth: this.props.minWidth,
        minHeight: this.props.minHeight,
        maxWidth: this.props.maxWidth,
        maxHeight: this.props.maxHeight,
        position: this.props.resizeHandlePosition
      });
      this.props.onBoundsChange(nextBounds);
    };

    const onPointerUp = () => {
      applyResizeHandleState(handle, this.props.resizeHandlePosition, false);
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      this.stopResizing = undefined;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    this.stopResizing = onPointerUp;

    event.preventDefault();
    event.stopPropagation();
  }
}

function applyOverlayRootStyle(rootElement: HTMLElement): void {
  Object.assign(rootElement.style, {
    position: 'absolute',
    inset: '0',
    margin: '0',
    boxSizing: 'border-box',
    pointerEvents: 'none'
  });
}

function applyLabelStyle(label: HTMLElement, offset: [number, number]): void {
  Object.assign(label.style, {
    margin: '6px',
    padding: '2px 6px',
    display: 'inline-block',
    borderRadius: '4px',
    background: 'rgba(15, 23, 42, 0.72)',
    color: 'white',
    fontSize: '11px',
    lineHeight: '16px',
    transform: `translate(${offset[0]}px, ${offset[1]}px)`
  });
}

function applyHeaderStyle(
  header: HTMLButtonElement,
  draggable: boolean,
  resizeHandlePosition: ResizeHandlePosition | null
): void {
  Object.assign(header.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    height: '22px',
    border: '0',
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    background: 'rgba(15, 23, 42, 0.72)',
    color: 'white',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: '700',
    lineHeight: '22px',
    cursor: draggable ? 'grab' : 'default',
    pointerEvents: draggable ? 'auto' : 'none',
    userSelect: 'none'
  });
  if (resizeHandlePosition?.endsWith('left')) {
    header.style.paddingLeft = '28px';
  } else if (resizeHandlePosition?.endsWith('right')) {
    header.style.paddingRight = '28px';
  }
}

function applyResizeHandleStyle(handle: HTMLButtonElement, position: ResizeHandlePosition): void {
  const placement = RESIZE_HANDLE_PLACEMENTS[position];
  const isInHeader = position.startsWith('top');
  Object.assign(handle.style, {
    position: 'absolute',
    top: placement.top,
    right: placement.right,
    bottom: placement.bottom,
    left: placement.left,
    width: '22px',
    height: '22px',
    border: '0',
    padding: '0',
    display: 'flex',
    alignItems: placement.alignItems,
    justifyContent: placement.justifyContent,
    borderTopLeftRadius: placement.borderTopLeftRadius,
    borderTopRightRadius: placement.borderTopRightRadius,
    borderBottomLeftRadius: placement.borderBottomLeftRadius,
    borderBottomRightRadius: placement.borderBottomRightRadius,
    background: isInHeader ? 'transparent' : 'rgba(15, 23, 42, 0.08)',
    color: isInHeader ? 'rgba(248, 250, 252, 0.92)' : 'rgba(15, 23, 42, 0.72)',
    cursor: placement.cursor,
    pointerEvents: 'auto',
    boxShadow: 'none'
  });
}

function applyResizeHandleState(
  handle: HTMLButtonElement,
  position: ResizeHandlePosition,
  active: boolean
): void {
  if (position.startsWith('top')) {
    handle.style.background = 'transparent';
    handle.style.color = active ? 'white' : 'rgba(248, 250, 252, 0.92)';
    return;
  }
  handle.style.background = active ? 'rgba(15, 23, 42, 0.16)' : 'rgba(15, 23, 42, 0.08)';
  handle.style.color = 'rgba(15, 23, 42, 0.72)';
}

function getRelativeBounds(
  viewRect: ViewLayoutRect,
  containerRect: ViewLayoutRect
): NumericViewBounds {
  return {
    x: viewRect.x - containerRect.x,
    y: viewRect.y - containerRect.y,
    width: viewRect.width,
    height: viewRect.height
  };
}

function resizeBounds({
  bounds,
  deltaX,
  deltaY,
  containerRect,
  margin,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  position
}: {
  bounds: NumericViewBounds;
  deltaX: number;
  deltaY: number;
  containerRect: ViewLayoutRect;
  margin: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  position: ResizeHandlePosition;
}): NumericViewBounds {
  const rightEdge = bounds.x + bounds.width;
  const bottomEdge = bounds.y + bounds.height;
  const isLeft = position.endsWith('left');
  const isTop = position.startsWith('top');

  let nextX = bounds.x;
  let nextY = bounds.y;
  let nextWidth = bounds.width + (isLeft ? -deltaX : deltaX);
  let nextHeight = bounds.height + (isTop ? -deltaY : deltaY);

  const maxAllowedWidth = Math.min(
    maxWidth,
    isLeft ? rightEdge - margin : containerRect.width - bounds.x - margin
  );
  const maxAllowedHeight = Math.min(
    maxHeight,
    isTop ? bottomEdge - margin : containerRect.height - bounds.y - margin
  );
  nextWidth = clamp(nextWidth, minWidth, Math.max(minWidth, maxAllowedWidth));
  nextHeight = clamp(nextHeight, minHeight, Math.max(minHeight, maxAllowedHeight));

  if (isLeft) {
    nextX = rightEdge - nextWidth;
  }
  if (isTop) {
    nextY = bottomEdge - nextHeight;
  }

  return clampPosition(
    {x: nextX, y: nextY, width: nextWidth, height: nextHeight},
    containerRect,
    margin
  );
}

function clampPosition(
  bounds: NumericViewBounds,
  containerRect: ViewLayoutRect,
  margin = DEFAULT_MARGIN
): NumericViewBounds {
  return {
    ...bounds,
    x: clamp(bounds.x, margin, Math.max(margin, containerRect.width - bounds.width - margin)),
    y: clamp(bounds.y, margin, Math.max(margin, containerRect.height - bounds.height - margin))
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createResizeIcon(position: ResizeHandlePosition): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', '0 0 12 12');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-width', '1.35');
  svg.style.margin = RESIZE_ICON_MARGINS[position];
  svg.style.transform = RESIZE_ICON_TRANSFORMS[position];

  [
    {d: 'M11 1L4 8', opacity: '0.8'},
    {d: 'M11 4L7 8', opacity: '0.65'},
    {d: 'M11 7L10 8', opacity: '0.5'}
  ].forEach(({d, opacity}) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('opacity', opacity);
    svg.append(path);
  });

  return svg;
}
