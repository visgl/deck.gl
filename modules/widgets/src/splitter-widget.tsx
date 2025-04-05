// SplitterWidget.tsx
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

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
  initialSplit?: number;
  /** Callback invoked when the splitter is dragged with the new split value */
  onChange?: (newSplit: number) => void;
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
    initialSplit: 0.5,
    onChange: () => {},
    onDragStart: () => {},
    onDragEnd: () => {}
  };

  className = 'deck-widget-splitter';
  placement = 'fill';

  constructor(props: SplitterWidgetProps) {
    // No placement prop is used.
    super({...SplitterWidget.defaultProps, ...props});
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
        initialSplit={this.props.initialSplit}
        onChange={this.props.onChange}
        onDragStart={this.props.onDragStart}
        onDragEnd={this.props.onDragEnd}
      />,
      element
    );
  }
}

/**
 * A functional component that renders a draggable splitter line.
 * It computes its position based on the provided split percentage and
 * updates it during mouse drag events.
 */
function Splitter({
  orientation,
  initialSplit,
  onChange,
  onDragStart,
  onDragEnd
}: {
  orientation: 'vertical' | 'horizontal';
  initialSplit: number;
  onChange?: (newSplit: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const [split, setSplit] = useState(initialSplit);
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
    let newSplit: number;
    if (orientation === 'vertical') {
      newSplit = (event.clientX - rect.left) / rect.width;
    } else {
      newSplit = (event.clientY - rect.top) / rect.height;
    }
    // Clamp newSplit between 5% and 95%
    newSplit = Math.min(Math.max(newSplit, 0.05), 0.95);
    setSplit(newSplit);
    onChange?.(newSplit);
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
        onMouseDown={handleDragStart as any} // Type cast to satisfy event typing.
      />
    </div>
  );
}
