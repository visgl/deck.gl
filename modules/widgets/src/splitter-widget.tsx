// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {JSX, render} from 'preact';
import {useState, useRef, useEffect} from 'preact/hooks';
import {Widget, _deepEqual as deepEqual, type WidgetProps, type View} from '@deck.gl/core';

import {
  buildViewsFromViewLayout,
  type ViewLayoutSplitter,
  type ViewLayoutSplitValues
} from './view-layout/build-views-from-view-layout';
import type {ViewLayout, ViewLayoutChild} from './view-layout/view-layout';

export type SplitterWidgetViewLayout = {
  /** Stacking orientation of the sub views */
  orientation: 'vertical' | 'horizontal';
  /** Initial instances that describe the sub views.
   * x, y, width and height of the views' props will be overwritten by the SplitterWidget as split changes. */
  views: [view1: View | SplitterWidgetViewLayout, view2: View | SplitterWidgetViewLayout];
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
  splitId: string;
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

type AdaptedViewLayout = {
  layout: ViewLayout;
  viewLayouts: ManagedViewLayout[];
};

function adaptViewLayout(root: SplitterWidgetViewLayout): AdaptedViewLayout {
  const layoutsById: ManagedViewLayout[] = [];
  const isViewLayout = (v: View | SplitterWidgetViewLayout): v is SplitterWidgetViewLayout =>
    'views' in v;
  function adaptLayout(l: SplitterWidgetViewLayout): {
    layout: ViewLayout;
    managed: ManagedViewLayout;
  } {
    const id = layoutsById.length;
    const splitId = `splitter-${id}`;
    const minSplit = l.minSplit ?? 0.05;
    const maxSplit = l.maxSplit ?? 0.95;
    const split = Math.min(Math.max(l.initialSplit ?? 0.5, minSplit), maxSplit);
    const managed: ManagedViewLayout = {
      id,
      splitId,
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

    const childEntries = l.views.map(view => {
      if (!isViewLayout(view)) {
        return {layout: view, managed: view};
      }
      const adapted = adaptLayout(view);
      return {layout: adapted.layout, managed: adapted.managed};
    }) as [
      {layout: ViewLayoutChild; managed: View | ManagedViewLayout},
      {layout: ViewLayoutChild; managed: View | ManagedViewLayout}
    ];
    managed.views = [childEntries[0].managed, childEntries[1].managed];

    const layout: ViewLayout = {
      orientation: l.orientation,
      splitId,
      initialSplit: split,
      minSplit,
      maxSplit,
      views: [childEntries[0].layout, childEntries[1].layout]
    };
    return {layout, managed};
  }

  const {layout} = adaptLayout(root);
  return {layout, viewLayouts: layoutsById};
}

function evaluateViews(
  layout: ViewLayout,
  viewLayouts: ManagedViewLayout[],
  splitValues: ViewLayoutSplitValues
): View[] {
  const compiled = buildViewsFromViewLayout({
    layout,
    width: 100,
    height: 100,
    splitValues
  });

  for (const viewLayout of viewLayouts) {
    const splitter = compiled.splittersById[viewLayout.splitId];
    if (splitter) {
      viewLayout.x = splitter.x;
      viewLayout.y = splitter.y;
      viewLayout.width = splitter.width;
      viewLayout.height = splitter.height;
      viewLayout.split = splitter.split;
      viewLayout.minSplit = splitter.minSplit;
      viewLayout.maxSplit = splitter.maxSplit;
    }
  }

  return compiled.views.map(view =>
    view.clone({
      x: `${view.props.x}%`,
      y: `${view.props.y}%`,
      width: `${view.props.width}%`,
      height: `${view.props.height}%`
    })
  );
}

/** Properties for the SplitterWidget */
export type SplitterWidgetProps<ViewsT extends View[] = View[]> = WidgetProps & {
  /** Stacking views descriptor */
  viewLayout?: SplitterWidgetViewLayout;
  /** Single externally managed split to render. */
  split?: ViewLayoutSplitter;
  /** Callback invoked when the splitter is dragged with the new split value */
  onChange?: (views: ViewsT) => void;
  /** Callback invoked when an externally managed splitter is dragged. */
  onSplitChange?: (newSplit: number, splitId: string) => void;
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
export class SplitterWidget<ViewsT extends View[] = View[]> extends Widget<
  SplitterWidgetProps<ViewsT>,
  ViewsT
> {
  static defaultProps: Required<SplitterWidgetProps> = {
    ...Widget.defaultProps,
    id: 'splitter-widget',
    viewLayout: undefined!,
    split: undefined!,
    onChange: () => {},
    onSplitChange: () => {},
    onDragStart: () => {},
    onDragEnd: () => {}
  };

  className = 'deck-widget-splitter';
  placement = 'fill' as const;
  viewLayout!: ViewLayout;
  viewLayouts!: ManagedViewLayout[];
  splitValues: Record<string, number> = {};
  /** evaluated from the current viewLayouts */
  views!: ViewsT;
  /** views set in the last update */
  lastViews?: ViewsT;
  needsUpdate = true;

  constructor(props: SplitterWidgetProps<ViewsT>) {
    super(props);
    this.updateViewLayout(this.props.viewLayout);
  }

  setProps(props: Partial<SplitterWidgetProps<ViewsT>>) {
    if ('viewLayout' in props && !deepEqual(props.viewLayout, this.props.viewLayout, -1)) {
      this.updateViewLayout(props.viewLayout);
      this.views = undefined!;
    }
    super.setProps(props);
  }

  private updateViewLayout(viewLayout: SplitterWidgetViewLayout | undefined): void {
    if (!viewLayout) {
      this.viewLayouts = [];
      this.splitValues = {};
      return;
    }
    const adapted = adaptViewLayout(viewLayout);
    this.viewLayout = adapted.layout;
    this.viewLayouts = adapted.viewLayouts;
    this.splitValues = {};
  }

  onRedraw() {
    // Actually update DOM
    super.updateHTML();
  }

  // Usually widgets rerender their DOM elements here
  // In this case we need the widget UI to synchronize with deck view states
  // so we update deck props here and rerender DOM in the next onRedraw
  updateHTML() {
    if (this.viewLayouts.length > 0 && !this.views) {
      // viewLayouts has changed, re-evaluate
      this.views = evaluateViews(this.viewLayout, this.viewLayouts, this.splitValues) as ViewsT;
      // we send a copy to the callback so that externally set views can be differentiated from internal
      this.props.onChange(this.views.slice() as ViewsT);
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
    this.splitValues = {...this.splitValues, [layout.splitId]: newSplit};
    // layout has updated, re-evaluate
    this.views = evaluateViews(this.viewLayout, this.viewLayouts, this.splitValues) as ViewsT;
    // we send a copy to the callback so that externally set views can be differentiated from internal
    this.props.onChange(this.views.slice() as ViewsT);
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
                onDragEnd={() => this.props.onDragEnd()}
              />
            )
        )}
        {this.props.split && (
          <Splitter
            {...this.props.split}
            onChange={newSplit => this.props.onSplitChange(newSplit, this.props.split.id)}
            onDragStart={() => this.props.onDragStart()}
            onDragEnd={() => this.props.onDragEnd()}
          />
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
