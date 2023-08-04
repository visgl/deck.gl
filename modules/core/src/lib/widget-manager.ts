import type Deck from './deck';
import type Viewport from '../viewports/viewport';
import type {PickingInfo} from './picking/pick-info';
import type {MjolnirPointerEvent, MjolnirGestureEvent} from 'mjolnir.js';
import type Layer from './layer';

import {EVENTS} from './constants';
import {deepEqual} from '../utils/deep-equal';

export interface Widget<PropsT = any> {
  id: string;
  props: PropsT;
  // Populated by core when mounted
  _element?: HTMLDivElement | null;
  _viewId?: string | null;
  _placement?: WidgetPlacement;

  // Lifecycle hooks
  /** Called when the widget is added to a Deck instance.
   * @returns an optional UI element that should be appended to the Deck container */
  onAdd: (params: {
    /** The Deck instance that the widget is attached to */
    deck: Deck;
    /** The id of the view that the widget is attached to */
    viewId: string | null;
  }) => HTMLDivElement | null;
  /** Called when the widget is removed */
  onRemove: () => void;
  /** Called to update widget options */
  setProps: (props: Partial<PropsT>) => void;

  // Optional event hooks
  /** Called when the containing view is changed */
  onViewportChange?: (viewport: Viewport) => void;
  /** Called when the containing view is redrawn */
  onRedraw?: (params: {viewports: Viewport[]; layers: Layer[]}) => void;
  /** Called when a hover event occurs */
  onHover?: (info: PickingInfo, event: MjolnirPointerEvent) => void;
  /** Called when a click event occurs */
  onClick?: (info: PickingInfo, event: MjolnirGestureEvent) => void;
  /** Called when a drag event occurs */
  onDrag?: (info: PickingInfo, event: MjolnirGestureEvent) => void;
  /** Called when a dragstart event occurs */
  onDragStart?: (info: PickingInfo, event: MjolnirGestureEvent) => void;
  /** Called when a dragend event occurs */
  onDragEnd?: (info: PickingInfo, event: MjolnirGestureEvent) => void;
}

export type WidgetConfig =
  | Widget
  | {
      widget: Widget;
      viewId?: string | null;
      placement?: WidgetPlacement;
    };
type NormalizedWidgetConfig = {
  widget: Widget;
  viewId: string | null;
  placement: WidgetPlacement;
};

const PLACEMENTS = {
  'top-left': {top: 0, left: 0},
  'top-right': {top: 0, right: 0},
  'bottom-left': {bottom: 0, left: 0},
  'bottom-right': {bottom: 0, right: 0},
  fill: {top: 0, left: 0, bottom: 0, right: 0}
} as const;
const DEFAULT_PLACEMENT = 'top-left';

export type WidgetPlacement = keyof typeof PLACEMENTS;

const ROOT_CONTAINER_ID = '__root';

export class WidgetManager {
  deck: Deck;
  parentElement?: HTMLElement | null;

  /** Widgets added via the imperative API */
  private defaultWidgets: Widget[] = [];
  /** Resolved widgets from both imperative and declarative APIs */
  private widgets: Widget[] = [];
  /** The last configs received from the declarative API */
  private configs: WidgetConfig[] = [];
  private containers: {[id: string]: HTMLDivElement} = {};
  private lastViewports: {[id: string]: Viewport} = {};

  constructor({deck, parentElement}: {deck: Deck; parentElement?: HTMLElement | null}) {
    this.deck = deck;
    this.parentElement = parentElement;
  }

  /** Declarative API to configure widgets */
  setProps(props: {widgets?: WidgetConfig[]}) {
    if (props.widgets && !deepEqual(props.widgets, this.configs, 1)) {
      this._setConfigs(props.widgets);
    }
  }

  finalize() {
    for (const widget of this.widgets) {
      this._remove(widget);
    }
    this.defaultWidgets.length = 0;
    this.widgets.length = 0;
    for (const id in this.containers) {
      this.containers[id].remove();
    }
  }

  /** Imperative API. Widgets added this way are not affected by the declarative prop. */
  addDefault(
    widget: Widget,
    options?: {
      viewId?: string | null;
      placement?: WidgetPlacement;
    }
  ) {
    if (!this.defaultWidgets.find(w => w.id === widget.id)) {
      const {viewId, placement} = normalizeConfig({widget, ...options});
      this._add(widget, viewId, placement);
      this.defaultWidgets.push(widget);
      // Update widget list
      this._setConfigs(this.configs);
    }
  }

  /** Resolve widgets from the declarative prop */
  private _setConfigs(nextConfigs: WidgetConfig[]) {
    this.configs = nextConfigs;
    const oldWidgetMap: Record<string, Widget | null> = {};

    for (const widget of this.widgets) {
      oldWidgetMap[widget.id] = widget;
    }
    // Clear and rebuild the list
    this.widgets.length = 0;

    // Add all default widgets
    for (const widget of this.defaultWidgets) {
      oldWidgetMap[widget.id] = null;
      this.widgets.push(widget);
    }

    for (const config of nextConfigs) {
      const normalizedConfig = normalizeConfig(config);
      const {viewId, placement} = normalizedConfig;
      let {widget} = normalizedConfig;

      const oldWidget = oldWidgetMap[widget.id];
      if (!oldWidget) {
        // Widget is new
        this._add(widget, viewId, placement);
      } else if (
        // Widget placement changed
        oldWidget._viewId !== viewId ||
        oldWidget._placement !== placement
      ) {
        this._remove(oldWidget);
        this._add(widget, viewId, placement);
      } else if (widget !== oldWidget) {
        // Widget props changed
        oldWidget.setProps(widget.props);
        widget = oldWidget;
      }

      // mark as matched
      oldWidgetMap[widget.id] = null;
      this.widgets.push(widget);
    }

    for (const id in oldWidgetMap) {
      const oldWidget = oldWidgetMap[id];
      if (oldWidget) {
        // No longer exists
        this._remove(oldWidget);
      }
    }
  }

  private _add(widget: Widget, viewId: string | null, placement: WidgetPlacement) {
    const element = widget.onAdd({deck: this.deck, viewId});

    if (element) {
      this._getContainer(viewId, placement).append(element);
    }
    widget._viewId = viewId;
    widget._element = element;
    widget._placement = placement;
  }

  private _remove(widget: Widget) {
    widget.onRemove();

    if (widget._element) {
      widget._element.remove();
    }
    widget._element = undefined;
    widget._viewId = undefined;
  }

  /* global document */
  private _getContainer(viewId: string | null, placement: WidgetPlacement): HTMLDivElement {
    const containerId = viewId || ROOT_CONTAINER_ID;
    let viewContainer = this.containers[containerId];
    if (!viewContainer) {
      viewContainer = document.createElement('div');
      viewContainer.style.pointerEvents = 'none';
      viewContainer.style.position = 'absolute';
      viewContainer.style.overflow = 'hidden';
      this.parentElement?.append(viewContainer);
      this.containers[containerId] = viewContainer;
    }
    let container = viewContainer.querySelector<HTMLDivElement>(`.${placement}`);
    if (!container) {
      container = document.createElement('div');
      container.className = placement;
      container.style.position = 'absolute';
      Object.assign(container.style, PLACEMENTS[placement]);
      viewContainer.append(container);
    }
    return container;
  }

  private _updateContainers() {
    const canvasWidth = this.deck.width;
    const canvasHeight = this.deck.height;
    for (const id in this.containers) {
      const viewport = this.lastViewports[id] || null;
      const visible = id === ROOT_CONTAINER_ID || viewport;

      const container = this.containers[id];
      if (visible) {
        container.style.display = 'block';
        // Align the container with the view
        container.style.left = `${viewport ? viewport.x : 0}px`;
        container.style.top = `${viewport ? viewport.y : 0}px`;
        container.style.width = `${viewport ? viewport.width : canvasWidth}px`;
        container.style.height = `${viewport ? viewport.height : canvasHeight}px`;
      } else {
        container.style.display = 'none';
      }
    }
  }

  onRedraw({viewports, layers}: {viewports: Viewport[]; layers: Layer[]}) {
    const viewportsById: {[id: string]: Viewport} = viewports.reduce((acc, v) => {
      acc[v.id] = v;
      return acc;
    }, {});
    const {lastViewports} = this;

    for (const widget of this.widgets) {
      const viewId = widget._viewId;
      if (viewId) {
        // Attached to a specific view
        const viewport = viewportsById[viewId];
        if (viewport) {
          if (widget.onViewportChange && !viewport.equals(lastViewports[viewId])) {
            widget.onViewportChange(viewport);
          }
          widget.onRedraw?.({viewports: [viewport], layers});
        }
      } else {
        // Not attached to a specific view
        if (widget.onViewportChange) {
          for (const viewport of viewports) {
            if (!viewport.equals(lastViewports[viewport.id])) {
              widget.onViewportChange(viewport);
            }
          }
        }
        widget.onRedraw?.({viewports, layers});
      }
    }
    this.lastViewports = viewportsById;
    this._updateContainers();
  }

  onHover(info: PickingInfo, event: MjolnirPointerEvent) {
    for (const widget of this.widgets) {
      const viewId = widget._viewId;
      if (!viewId || viewId === info.viewport?.id) {
        widget.onHover?.(info, event);
      }
    }
  }

  onEvent(info: PickingInfo, event: MjolnirGestureEvent) {
    const eventOptions = EVENTS[event.type];
    if (!eventOptions) {
      return;
    }
    for (const widget of this.widgets) {
      const viewId = widget._viewId;
      if (!viewId || viewId === info.viewport?.id) {
        widget[eventOptions.handler]?.(info, event);
      }
    }
  }
}

function normalizeConfig(config: WidgetConfig): NormalizedWidgetConfig {
  if ('widget' in config) {
    return {
      widget: config.widget,
      viewId: config.viewId ?? null,
      placement: config.placement ?? DEFAULT_PLACEMENT
    };
  }
  return {
    widget: config,
    viewId: null,
    placement: DEFAULT_PLACEMENT
  };
}
