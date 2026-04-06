// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {JSX, render} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';
import {
  Widget,
  _deepEqual as deepEqual,
  type Deck,
  type WidgetProps,
  type View
} from '@deck.gl/core';

export type ViewLayout = {
  /** Stacking orientation of the sub views */
  orientation: 'vertical' | 'horizontal';
  /** Initial instances that describe the sub views.
   * x, y, width and height of the views' props will be overwritten by the SplitterWidget as split changes. */
  views: [view1: View | ViewLayout, view2: View | ViewLayout];
  /** The ratio of view1's share over the whole available height (vertical) or width (horizontal). Between 0-1.
   * @default 0.5
   */
  initialSplit?: number;
  /** Whether the split can be changed by dragging the border between the two views.
   * @default true
   */
  editable?: boolean;
  /** Min value of the split
   * @default 0.05
   */
  minSplit?: number;
  /** Max value of the split
   * @default 0.95
   */
  maxSplit?: number;
};

type ManagedViewLayout = {
  id: number;
  orientation: 'vertical' | 'horizontal';
  views: [view1: View | ManagedViewLayout, view2: View | ManagedViewLayout];
  split: number;
  editable: boolean;
  minSplit: number;
  maxSplit: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function parseViewLayout(root: ViewLayout): ManagedViewLayout[] {
  const layoutsById: ManagedViewLayout[] = [];
  const isViewLayout = (v: View | ViewLayout): v is ViewLayout => 'views' in v;
  function createManagedViewLayout(l: ViewLayout): ManagedViewLayout {
    const id = layoutsById.length;
    const minSplit = l.minSplit ?? 0.05;
    const maxSplit = l.maxSplit ?? 0.95;
    const split = Math.min(Math.max(l.initialSplit ?? 0.5, minSplit), maxSplit);
    const managed: ManagedViewLayout = {
      id,
      orientation: l.orientation,
      views: l.views as [view1: View | ManagedViewLayout, view2: View | ManagedViewLayout],
      split,
      editable: l.editable ?? true,
      minSplit,
      maxSplit,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    layoutsById.push(managed);
    managed.views = [
      isViewLayout(l.views[0]) ? createManagedViewLayout(l.views[0]) : l.views[0],
      isViewLayout(l.views[1]) ? createManagedViewLayout(l.views[1]) : l.views[1]
    ];
    return managed;
  }
  createManagedViewLayout(root);
  return layoutsById;
}

function evaluateViews(root: ManagedViewLayout): View[] {
  const views: View[] = [];
  function evaluateViewLayout(
    l: ManagedViewLayout,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    l.x = x;
    l.y = y;
    l.width = width;
    l.height = height;

    const child1X = x;
    const child1Y = y;
    let child1Width = width;
    let child1Height = height;
    let child2X = x;
    let child2Y = y;
    let child2Width = width;
    let child2Height = height;

    if (l.orientation === 'horizontal') {
      child1Width = width * l.split;
      child2X = x + child1Width;
      child2Width = width - child1Width;
    } else {
      child1Height = height * l.split;
      child2Y = y + child1Height;
      child2Height = height - child1Height;
    }

    const [view1, view2] = l.views;
    if ('views' in view1) {
      evaluateViewLayout(view1, child1X, child1Y, child1Width, child1Height);
    } else {
      views.push(
        view1.clone({
          x: `${child1X}%`,
          y: `${child1Y}%`,
          width: `${child1Width}%`,
          height: `${child1Height}%`
        })
      );
    }

    if ('views' in view2) {
      evaluateViewLayout(view2, child2X, child2Y, child2Width, child2Height);
    } else {
      views.push(
        view2.clone({
          x: `${child2X}%`,
          y: `${child2Y}%`,
          width: `${child2Width}%`,
          height: `${child2Height}%`
        })
      );
    }
  }

  evaluateViewLayout(root, 0, 0, 100, 100);
  return views;
}

/** Properties for the SplitterWidget */
export type SplitterWidgetProps = WidgetProps & {
  /** Stacking views descriptor */
  viewLayout: ViewLayout;
  /** Callback invoked when the splitter is dragged with the new split value */
  onChange?: (views: View[]) => void;
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
export class SplitterWidget extends Widget<SplitterWidgetProps, View[]> {
  static defaultProps: Required<SplitterWidgetProps> = {
    ...Widget.defaultProps,
    id: 'splitter-widget',
    viewLayout: undefined!,
    onChange: () => {},
    onDragStart: () => {},
    onDragEnd: () => {}
  };

  className = 'deck-widget-splitter';
  placement = 'fill' as const;
  viewLayouts!: ManagedViewLayout[];
  /** evaluated from the current viewLayouts */
  views!: View[];
  /** views set in the last update */
  lastViews?: View[];
  needsUpdate = true;

  constructor(props: SplitterWidgetProps) {
    super(props);
    this.viewLayouts = parseViewLayout(this.props.viewLayout);
  }

  setProps(props: Partial<SplitterWidgetProps>) {
    if (props.viewLayout && !deepEqual(props.viewLayout, this.props.viewLayout, -1)) {
      this.viewLayouts = parseViewLayout(props.viewLayout);
      this.views = undefined!;
    }
    super.setProps(props);
  }

  onRedraw() {
    // Actually update DOM
    super.updateHTML();
  }

  // Usually widgets rerender their DOM elements here
  // In this case we need the widget UI to synchronize with deck view states
  // so we update deck props here and rerender DOM in the next onRedraw
  updateHTML() {
    if (!this.views) {
      // viewLayouts has changed, re-evaluate
      this.views = evaluateViews(this.viewLayouts[0]);
      // we send a copy to the callback so that externally set views can be differentiated from internal
      this.props.onChange(this.views.slice());
    }
    // This method is called inside deck.setProps > widgetManager.setProps > widget.setProps
    // Calling deck.setProps immediately would cause infinite loop
    requestAnimationFrame(() => {
      this.doUpdate();
    });
  }

  private doUpdate() {
    if (this.deck) {
      const deckViews = this.deck.props.views;
      const isManagedExternally =
        // is not empty
        deckViews &&
        // is not set by us
        deckViews !== this.lastViews;

      if (!isManagedExternally && this.lastViews !== this.views) {
        this.lastViews = this.views;
        this.deck.setProps({views: this.views});
      }
    }
  }

  private onChange(newSplit: number, layout: ManagedViewLayout) {
    layout.split = newSplit;
    // layout has updated, re-evaluate
    this.views = evaluateViews(this.viewLayouts[0]);
    // we send a copy to the callback so that externally set views can be differentiated from internal
    this.props.onChange(this.views.slice());
    this.doUpdate();
  }

  onRenderHTML(rootElement: HTMLElement): void {
    render(
      <>
        {this.viewLayouts.map(
          layout =>
            layout.editable && (
              <Splitter
                {...layout}
                onChange={newSplit => this.onChange(newSplit, layout)}
                onDragStart={() => this.props.onDragStart()}
                onDragEnd={() => this.props.onDragStart()}
              />
            )
        )}
      </>,
      rootElement
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
  x,
  y,
  width,
  height,
  split,
  minSplit,
  maxSplit,
  onChange,
  onDragStart,
  onDragEnd
}: {
  orientation: 'vertical' | 'horizontal';
  x: number;
  y: number;
  width: number;
  height: number;
  split: number;
  minSplit: number;
  maxSplit: number;
  onChange?: (newSplit: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dragging) {
      return undefined;
    }

    const handleDragging = (event: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newSplit: number;
      if (orientation === 'horizontal') {
        newSplit = (event.clientX - rect.left) / rect.width;
      } else {
        newSplit = (event.clientY - rect.top) / rect.height;
      }
      // Clamp newSplit between 5% and 95%
      newSplit = Math.min(Math.max(newSplit, minSplit), maxSplit);
      onChange?.(newSplit);
    };

    const handleDragEnd = () => {
      onDragEnd?.();
      setDragging(false);
    };

    document.addEventListener('pointermove', handleDragging);
    document.addEventListener('pointerup', handleDragEnd);
    document.addEventListener('pointerleave', handleDragEnd);

    return () => {
      document.removeEventListener('pointermove', handleDragging);
      document.removeEventListener('pointerup', handleDragEnd);
      document.removeEventListener('pointerleave', handleDragEnd);
    };
  }, [dragging]);

  const handleDragStart = (event: PointerEvent) => {
    setDragging(true);
    onDragStart?.();
    event.preventDefault();
  };

  // The splitter line style based on orientation and the current split percentage.
  const splitterStyle: JSX.CSSProperties =
    orientation === 'horizontal' ? {left: `${split * 100}%`} : {top: `${split * 100}%`};

  // Container style to fill the entire deck.gl canvas.
  const containerStyle: JSX.CSSProperties = {
    position: 'absolute',
    top: `${y}%`,
    left: `${x}%`,
    width: `${width}%`,
    height: `${height}%`
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div
        className={`deck-widget-splitter-handle deck-widget-splitter-handle--${orientation} ${dragging ? 'active' : ''}`}
        style={splitterStyle}
        onPointerDown={handleDragStart} // Use the appropriate Preact event type.
      />
    </div>
  );
}
