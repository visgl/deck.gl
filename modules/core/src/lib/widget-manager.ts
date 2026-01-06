// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type Deck from './deck';
import type Viewport from '../viewports/viewport';
import type {PickingInfo} from './picking/pick-info';
import type {MjolnirPointerEvent, MjolnirGestureEvent} from 'mjolnir.js';
import type Layer from './layer';
import {Widget} from './widget';

import {EVENT_HANDLERS} from './constants';
import {deepEqual} from '../utils/deep-equal';

const PLACEMENTS = {
  'top-left': {top: 0, left: 0},
  'top-right': {top: 0, right: 0},
  'bottom-left': {bottom: 0, left: 0},
  'bottom-right': {bottom: 0, right: 0},
  fill: {top: 0, left: 0, bottom: 0, right: 0}
} as const;
const DEFAULT_PLACEMENT = 'top-left';

export type WidgetPlacement = keyof typeof PLACEMENTS;

const ROOT_CONTAINER_ID = 'root';

export type WidgetManagerProps = {
  deck: Deck<any>;
  parentElement?: HTMLElement | null;
};
export class WidgetManager {
  deck: Deck<any>;
  parentElement?: HTMLElement | null;

  /** Widgets added via the imperative API */
  private defaultWidgets: Widget[] = [];
  /** Widgets received from the declarative API */
  private widgets: Widget[] = [];
  /** Resolved widgets from both imperative and declarative APIs */
  private resolvedWidgets: Widget[] = [];

  /** Mounted HTML containers */
  private containers: {[id: string]: HTMLDivElement} = {};
  /** Viewport provided to widget on redraw */
  private lastViewports: {[id: string]: Viewport} = {};

  constructor({deck, parentElement}: WidgetManagerProps) {
    this.deck = deck;
    parentElement?.classList.add('deck-widget-container');
    this.parentElement = parentElement;
  }

  getWidgets(): Widget[] {
    return this.resolvedWidgets;
  }

  /** Declarative API to configure widgets */
  setProps(props: {widgets?: (Widget | null | undefined)[]}) {
    if (props.widgets && !deepEqual(props.widgets, this.widgets, 1)) {
      // Allow application to supply null widgets
      const nextWidgets = props.widgets.filter(Boolean) as Widget[];
      this._setWidgets(nextWidgets);
    }
  }

  finalize() {
    for (const widget of this.getWidgets()) {
      this._removeWidget(widget);
    }
    this.defaultWidgets.length = 0;
    this.resolvedWidgets.length = 0;
    for (const id in this.containers) {
      this.containers[id].remove();
    }
  }

  /** Imperative API. Widgets added this way are not affected by the declarative prop. */
  addDefault(widget: Widget) {
    if (!this.defaultWidgets.find(w => w.id === widget.id)) {
      this._addWidget(widget);
      this.defaultWidgets.push(widget);
      // Update widget list
      this._setWidgets(this.widgets);
    }
  }

  onRedraw({viewports, layers}: {viewports: Viewport[]; layers: Layer[]}) {
    const viewportsById: {[id: string]: Viewport} = viewports.reduce((acc, v) => {
      acc[v.id] = v;
      return acc;
    }, {});

    for (const widget of this.getWidgets()) {
      const {viewId} = widget;
      if (viewId) {
        // Attached to a specific view
        const viewport = viewportsById[viewId];
        if (viewport) {
          if (widget.onViewportChange) {
            widget.onViewportChange(viewport);
          }
          widget.onRedraw?.({viewports: [viewport], layers});
        }
      } else {
        // Not attached to a specific view
        if (widget.onViewportChange) {
          for (const viewport of viewports) {
            widget.onViewportChange(viewport);
          }
        }
        widget.onRedraw?.({viewports, layers});
      }
    }
    this.lastViewports = viewportsById;
    this._updateContainers();
  }

  onHover(info: PickingInfo, event: MjolnirPointerEvent) {
    for (const widget of this.getWidgets()) {
      const {viewId} = widget;
      if (!viewId || viewId === info.viewport?.id) {
        widget.onHover?.(info, event);
      }
    }
  }

  onEvent(info: PickingInfo, event: MjolnirGestureEvent) {
    const eventHandlerProp = EVENT_HANDLERS[event.type];
    if (!eventHandlerProp) {
      return;
    }
    for (const widget of this.getWidgets()) {
      const {viewId} = widget;
      if (!viewId || viewId === info.viewport?.id) {
        widget[eventHandlerProp]?.(info, event);
      }
    }
  }

  // INTERNAL METHODS

  /**
   * Resolve widgets from the declarative prop
   * Initialize new widgets and remove old ones
   * Update props of existing widgets
   */
  private _setWidgets(nextWidgets: Widget[]) {
    const oldWidgetMap: Record<string, Widget | null> = {};

    for (const widget of this.resolvedWidgets) {
      oldWidgetMap[widget.id] = widget;
    }
    // Clear and rebuild the list
    this.resolvedWidgets.length = 0;

    // Add all default widgets
    for (const widget of this.defaultWidgets) {
      oldWidgetMap[widget.id] = null;
      this.resolvedWidgets.push(widget);
    }

    for (let widget of nextWidgets) {
      const oldWidget = oldWidgetMap[widget.id];
      if (!oldWidget) {
        // Widget is new
        this._addWidget(widget);
      } else if (
        // Widget placement changed
        oldWidget.viewId !== widget.viewId ||
        oldWidget.placement !== widget.placement
      ) {
        this._removeWidget(oldWidget);
        this._addWidget(widget);
      } else if (widget !== oldWidget) {
        // Widget props changed
        oldWidget.setProps(widget.props);
        widget = oldWidget;
      }

      // mark as matched
      oldWidgetMap[widget.id] = null;
      this.resolvedWidgets.push(widget);
    }

    for (const id in oldWidgetMap) {
      const oldWidget = oldWidgetMap[id];
      if (oldWidget) {
        // No longer exists
        this._removeWidget(oldWidget);
      }
    }
    this.widgets = nextWidgets;
  }

  /** Initialize new widget */
  private _addWidget(widget: Widget) {
    const {viewId = null, placement = DEFAULT_PLACEMENT} = widget;
    const container = widget.props._container ?? viewId;

    widget.widgetManager = this;
    widget.deck = this.deck;

    // Create an attach the HTML root element
    widget.rootElement = widget._onAdd({deck: this.deck, viewId});
    if (widget.rootElement) {
      this._getContainer(container, placement).append(widget.rootElement);
    }

    widget.updateHTML();
  }

  /** Destroy an old widget */
  private _removeWidget(widget: Widget) {
    widget.onRemove?.();

    if (widget.rootElement) {
      widget.rootElement.remove();
    }
    widget.rootElement = undefined;
    widget.deck = undefined;
    widget.widgetManager = undefined;
  }

  /** Get a container element based on view and placement */
  private _getContainer(
    viewIdOrContainer: string | HTMLDivElement | null,
    placement: WidgetPlacement
  ): HTMLDivElement {
    if (viewIdOrContainer && typeof viewIdOrContainer !== 'string') {
      return viewIdOrContainer;
    }
    const containerId = viewIdOrContainer || ROOT_CONTAINER_ID;
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
      container = globalThis.document.createElement('div');
      container.className = placement;
      container.style.position = 'absolute';
      container.style.zIndex = '2';
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
}
