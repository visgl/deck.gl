// SplitterWidget.tsx
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {View} from '@deck.gl/core';
import {h, render} from 'preact';
import {useState, useRef} from 'preact/hooks';
import {WidgetImpl, WidgetImplProps} from './widget-impl';

/** Properties for the SplitterWidget */
export type SplitterWidgetProps = WidgetImplProps & {
  /** The view id for the first (resizable) view */
  viewId1: string;
  /** The view id for the second view */
  viewId2: string;
  /** Orientation of the splitter: vertical (default) or horizontal */
  orientation?: 'vertical' | 'horizontal';
  /** The initial split percentage (0 to 1) for the first view, default 0.5 */
  initialSplitRatio?: number;
  /** Callback invoked when the splitter is dragged with the new split value */
  onSplitRatioChange?: (splitRatio: number) => void;
  /** Callback invoked when dragging starts */
  onDragStart?: () => void;
  /** Callback invoked when dragging ends */
  onDragEnd?: () => void;
};

/**
 * A draggable splitter widget that appears as a vertical or horizontal line
 * across the deck.gl canvas. It positions itself based on the split percentage
 * of the first view and provides callbacks when dragged.
 */
export class SplitterWidget extends WidgetImpl<SplitterWidgetProps> {
  static defaultProps: Required<SplitterWidgetProps> = {
    ...WidgetImpl.defaultProps,
    id: 'splitter-widget',
    viewId1: '',
    viewId2: '',
    orientation: 'vertical',
    initialSplitRatio: 0.5,
    onSplitRatioChange: () => { },
    onDragStart: () => { },
    onDragEnd: () => { }
  };

  className = 'deck-widget-splitter';
  placement = 'fill';

  splitRatio: number;

  constructor(props: SplitterWidgetProps) {
    // No placement prop is used.
    super({...SplitterWidget.defaultProps, ...props});
    this.splitRatio = this.props.initialSplitRatio;
  }

  onWidgetInitialized() {
    this._widgetManager!.viewsNeedUpdate = true;
    this._widgetManager!.setNeedsRedraw('SplitterWidget');
  }

  setProps(props: Partial<SplitterWidgetProps>) {
    super.setProps(props);
  }

  onRenderHTML() {
    const element = this.element;
    if (!element) return;
    // Ensure the widget container fills the deck.gl canvas.
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '0';
    element.style.width = '100%';
    element.style.height = '100%';

    element.style.margin = '0px';

    render(
      <Splitter
        orientation={this.props.orientation}
        initialSplitRatio={this.props.initialSplitRatio}
        onChange={this.onSplitRatioChange}
        onDragStart={this.props.onDragStart}
        onDragEnd={this.props.onDragEnd}
      />,
      element
    );
  }

  onSplitRatioChange = (splitRatio: number) => {
    this.props.onSplitRatioChange(splitRatio);
    this.splitRatio = splitRatio;
    this._widgetManager!.viewsNeedUpdate = true;
    this._widgetManager!.setNeedsRedraw('SplitterWidget');
  };

  filterViews(views: View[]): View[] {
    const view1Index = views.findIndex(view => view.id === this.props.viewId1);
    const view2Index = views.findIndex(view => view.id === this.props.viewId2);
    if (view1Index !== -1 && view2Index !== -1) {
      views = [...views];
      const [viewProps1, viewProps2] = getViewPropsForSplitRatio(this.splitRatio);
      views[view1Index] = cloneView(views[view1Index], viewProps1);
      views[view2Index] = cloneView(views[view2Index], viewProps2);
    }
    return views;
  }
}

/** @todo(ib) - We could add view cloning support to the View class or a deck/widget manager util */
function cloneView(
  view: View,
  props: {
    /** A relative (e.g. `'50%'`) or absolute position. Default `0`. */
    x?: number | string;
    /** A relative (e.g. `'50%'`) or absolute position. Default `0`. */
    y?: number | string;
    /** A relative (e.g. `'50%'`) or absolute extent. Default `'100%'`. */
    width?: number | string;
    /** A relative (e.g. `'50%'`) or absolute extent. Default `'100%'`. */
    height?: number | string;
  }
) {
  const ViewType = view.constructor;
  // @ts-expect-error The constructor type is not known
  return new ViewType({...view.props, ...props});
}

/**
 * The first view will take the left/top part, and the second view will take the right/bottom part.
 * @param splitRatio - A number between 0 and 1 representing the split ratio.
 * @param orientation - The orientation of the splitter, either 'horizontal' or 'vertical'.
 *                     Default is 'vertical'.
 * @returns partial view props for the two views.
 */
function getViewPropsForSplitRatio(splitRatio: number, orientation: 'horizontal' | 'vertical' = 'vertical') {
  const percentage = splitRatio * 100;
  switch (orientation) {
    case 'horizontal':
      return getHorizontalSplit(percentage);
    case 'vertical':
    default:
      return getVerticalSplit(percentage);
  }
}

function getVerticalSplit(percentage: number) {
  const x1 = '0%';
  const width1 = `${percentage}%`;
  const x2 = width1;
  const width2 = `${100 - percentage}%`;
  return [
    {x: x1, width: width1},
    {x: x2, width: width2}
  ];
}

function getHorizontalSplit(percentage: number) {
  const y1 = '0%';
  const height1 = `${percentage}%`;
  const y2 = height1;
  const height2 = `${100 - percentage}%`;
  return [
    {y: y1, height: height1},
    {y: y2, height: height2}
  ];
}

/**
 * A functional component that renders a draggable splitter line.
 * It computes its position based on the provided split percentage and
 * updates it during mouse drag events.
 */
function Splitter({
  orientation,
  initialSplitRatio,
  onChange,
  onDragStart,
  onDragEnd
}: {
  orientation: 'vertical' | 'horizontal';
  initialSplitRatio: number;
  onChange?: (newSplit: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const [split, setSplit] = useState(initialSplitRatio);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (event: MouseEvent) => {
    dragging.current = true;
    onDragStart?.();
    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', handleDragEnd);
    event.preventDefault();
  };

  const handleDragging = (event: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newSplitRatio: number;
    if (orientation === 'vertical') {
      newSplitRatio = (event.clientX - rect.left) / rect.width;
    } else {
      newSplitRatio = (event.clientY - rect.top) / rect.height;
    }
    // Clamp newSplitRatio between 5% and 95%
    newSplitRatio = Math.min(Math.max(newSplitRatio, 0.05), 0.95);
    setSplit(newSplitRatio);
    onChange?.(newSplitRatio);
  };

  const handleDragEnd = (event: MouseEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    onDragEnd?.();
    document.removeEventListener('mousemove', handleDragging);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  // The splitter line style based on orientation and the current split percentage.
  const splitterStyle: h.JSX.CSSProperties =
    orientation === 'vertical'
      ? {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${split * 100}%`,
        width: '4px',
        cursor: 'col-resize',
        background: '#ccc',
        zIndex: 10,
        pointerEvents: 'auto',
        boxShadow: 'inset -1px 0 0 white, inset 1px 0 0 white'
      }
      : {
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${split * 100}%`,
        height: '4px',
        cursor: 'row-resize',
        background: '#ccc',
        zIndex: 10,
        pointerEvents: 'auto',
        boxShadow: 'inset -1px 0 0 white, inset 1px 0 0 white'
      };

  // Container style to fill the entire deck.gl canvas.
  const containerStyle: h.JSX.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div
        style={splitterStyle}
        onMouseDown={handleDragStart as h.JSX.MouseEventHandler<HTMLElement>} // Use the appropriate Preact event type.
      />
    </div>
  );
}
