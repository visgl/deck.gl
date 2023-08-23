import type Deck from './deck';
import type Viewport from '../viewports/viewport';
import type {PickingInfo} from './picking/pick-info';
import type {MjolnirPointerEvent, MjolnirGestureEvent} from 'mjolnir.js';
import type Layer from './layer';

import {EVENTS} from './constants';

export interface Widget<PropsT = any> {
  // Populated by core when mounted
  _element?: HTMLDivElement | null;
  _viewId?: string | null;

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
  setProps?: (props: Partial<PropsT>) => void;

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

const PLACEMENTS = {
  'top-left': {top: 0, left: 0},
  'top-right': {top: 0, right: 0},
  'bottom-left': {bottom: 0, left: 0},
  'bottom-right': {bottom: 0, right: 0},
  fill: {top: 0, left: 0, bottom: 0, right: 0}
} as const;

export type WidgetPlacement = keyof typeof PLACEMENTS;

const ROOT_CONTAINER_ID = '__root';

export class WidgetManager {
  deck: Deck;
  parentElement?: HTMLElement | null;
  containers: {[id: string]: HTMLDivElement} = {};
  widgets: Widget[] = [];
  lastViewports: {[id: string]: Viewport} = {};

  constructor({deck, parentElement}: {deck: Deck; parentElement?: HTMLElement | null}) {
    this.deck = deck;
    this.parentElement = parentElement;
  }

  finalize() {
    for (const widget of this.widgets) {
      this.remove(widget);
    }
    for (const id in this.containers) {
      this.containers[id].remove();
    }
  }

  add(
    widget: Widget,
    opts: {
      viewId?: string | null;
      placement?: WidgetPlacement;
    } = {}
  ) {
    if (this.widgets.includes(widget)) {
      // widget already added
      return;
    }

    const {placement = 'top-left', viewId = null} = opts;
    const element = widget.onAdd({deck: this.deck, viewId});

    if (element) {
      this._getContainer(viewId, placement).append(element);
    }
    widget._viewId = viewId;
    widget._element = element;
    this.widgets.push(widget);
  }

  remove(widget: Widget) {
    const i = this.widgets.indexOf(widget);
    if (i < 0) {
      // widget not found
      return;
    }
    this.widgets.splice(i, 1);
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
            // eslint-disable-next-line max-depth
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
