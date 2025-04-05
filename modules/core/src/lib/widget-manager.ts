// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type Deck from './deck';
import type Viewport from '../viewports/viewport';
import type View from '../views/view';
import type {PickingInfo} from './picking/pick-info';
import type {MjolnirPointerEvent, MjolnirGestureEvent} from 'mjolnir.js';
import type Layer from './layer';

import {EVENT_HANDLERS} from './constants';
import {deepEqual} from '../utils/deep-equal';

export interface Widget<PropsT = any> {
  /** Unique identifier of the widget. */
  id: string;
  /** Widget prop types. */
  props: PropsT;
  /**
   * The view id that this widget is being attached to. Default `null`.
   * If assigned, this widget will only respond to events occurred inside the specific view that matches this id.
   */
  viewId?: string | null;
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;

  // Populated by core when mounted
  _element?: HTMLDivElement | null;
  _widgetManager?: WidgetManager;

  // Lifecycle hooks
  /** Called when the widget is added to a Deck instance.
   * @returns an optional UI element that should be appended to the Deck container */
  onAdd: (params: {
    /** The Deck instance that the widget is attached to */
    deck: Deck<any>;
    /** The id of the view that the widget is attached to */
    viewId: string | null;
  }) => HTMLDivElement | null;
  /** Called when the widget is removed */
  onRemove?: () => void;
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

  /** Widgets can modify or add/remove views */
  filterViews?(views: View[]): View[];
}

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
  deck: Deck<any>;
  parentElement?: HTMLElement | null;

  viewsNeedUpdate = false;

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

  constructor({deck, parentElement}: {deck: Deck<any>; parentElement?: HTMLElement | null}) {
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
      this._remove(widget);
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
      this._add(widget);
      this.defaultWidgets.push(widget);
      // Update widget list
      this._setWidgets(this.widgets);
    }
  }

  // Deck integration

  /** Widgets can modify or add/remove views */
  filterViews(views: View[]): View[] | undefined {
    return this.widgets.reduce((views, widget) => widget.filterViews?.(views) || views, views as View[]);
  }

  needsRedraw(opts: {clearRedrawFlags: boolean} = {clearRedrawFlags: false}): string | false {
    const redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }

  setNeedsRedraw(reason: string) {
    this._needsRedraw = reason;
  }

  private _needsRedraw: string | false = 'WidgetManager initialized';

  /** Resolve widgets from the declarative prop */
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
        this._add(widget);
      } else if (
        // Widget placement changed
        oldWidget.viewId !== widget.viewId ||
        oldWidget.placement !== widget.placement
      ) {
        this._remove(oldWidget);
        this._add(widget);
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
        this._remove(oldWidget);
      }
    }
    this.widgets = nextWidgets;
  }

  private _add(widget: Widget) {
    const {viewId = null, placement = DEFAULT_PLACEMENT} = widget;

    widget._widgetManager = this;
    const element = widget.onAdd({deck: this.deck, viewId});
    if (element) {
      this._getContainer(viewId, placement).append(element);
    }
    widget._element = element;
  }

  private _remove(widget: Widget) {
    widget.onRemove?.();

    if (widget._element) {
      widget._element.remove();
    }
    widget._element = undefined;
    widget._widgetManager = undefined;
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
}
