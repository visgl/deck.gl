// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { EVENT_HANDLERS } from "./constants.js";
import { deepEqual } from "../utils/deep-equal.js";
const PLACEMENTS = {
    'top-left': { top: 0, left: 0 },
    'top-right': { top: 0, right: 0 },
    'bottom-left': { bottom: 0, left: 0 },
    'bottom-right': { bottom: 0, right: 0 },
    fill: { top: 0, left: 0, bottom: 0, right: 0 }
};
const DEFAULT_PLACEMENT = 'top-left';
const ROOT_CONTAINER_ID = 'root';
export class WidgetManager {
    constructor({ deck, parentElement, getCanvasBounds }) {
        /** Widgets added via the imperative API */
        this.defaultWidgets = [];
        /** Widgets received from the declarative API */
        this.widgets = [];
        /** Resolved widgets from both imperative and declarative APIs */
        this.resolvedWidgets = [];
        /** Mounted HTML containers */
        this.containers = {};
        /** Viewport provided to widget on redraw */
        this.lastViewports = {};
        this.deck = deck;
        parentElement?.classList.add('deck-widget-container');
        this.parentElement = parentElement;
        this._resolveCanvasBounds = getCanvasBounds;
    }
    getWidgets() {
        return this.resolvedWidgets;
    }
    /** Declarative API to configure widgets */
    setProps(props) {
        if (props.widgets && !deepEqual(props.widgets, this.widgets, 1)) {
            // Allow application to supply null widgets
            const nextWidgets = props.widgets.filter(Boolean);
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
    addDefault(widget) {
        if (!this.defaultWidgets.find(w => w.id === widget.id)) {
            this._addWidget(widget);
            this.defaultWidgets.push(widget);
            // Update widget list
            this._setWidgets(this.widgets);
        }
    }
    onRedraw({ viewports, layers }) {
        const viewportsById = viewports.reduce((acc, v) => {
            acc[v.id] = v;
            return acc;
        }, {});
        for (const widget of this.getWidgets()) {
            const { viewId } = widget;
            if (viewId) {
                // Attached to a specific view
                const viewport = viewportsById[viewId];
                if (viewport) {
                    if (widget.onViewportChange) {
                        widget.onViewportChange(viewport);
                    }
                    widget.onRedraw?.({ viewports: [viewport], layers });
                }
            }
            else {
                // Not attached to a specific view
                if (widget.onViewportChange) {
                    for (const viewport of viewports) {
                        widget.onViewportChange(viewport);
                    }
                }
                widget.onRedraw?.({ viewports, layers });
            }
        }
        this.lastViewports = viewportsById;
        this._updateContainers();
    }
    onHover(info, event) {
        for (const widget of this.getWidgets()) {
            const { viewId } = widget;
            if (!viewId || viewId === info.viewport?.id) {
                widget.onHover?.(info, event);
            }
        }
    }
    /** Resolves a viewport's canvas bounds relative to the shared widget root. */
    getCanvasBounds(viewport) {
        if (this._resolveCanvasBounds) {
            return this._resolveCanvasBounds(viewport);
        }
        const canvas = this.deck?.getCanvas?.();
        const canvasBounds = canvas?.getBoundingClientRect();
        const parentBounds = this.parentElement?.getBoundingClientRect();
        return {
            x: canvasBounds && parentBounds ? canvasBounds.left - parentBounds.left : 0,
            y: canvasBounds && parentBounds ? canvasBounds.top - parentBounds.top : 0,
            width: canvasBounds?.width || this.deck?.width || 0,
            height: canvasBounds?.height || this.deck?.height || 0
        };
    }
    onEvent(info, event) {
        const eventHandlerProp = EVENT_HANDLERS[event.type];
        if (!eventHandlerProp) {
            return;
        }
        for (const widget of this.getWidgets()) {
            const { viewId } = widget;
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
    _setWidgets(nextWidgets) {
        const oldWidgetMap = {};
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
            }
            else if (
            // Widget placement changed
            oldWidget.viewId !== widget.viewId ||
                oldWidget.placement !== widget.placement) {
                this._removeWidget(oldWidget);
                this._addWidget(widget);
            }
            else if (widget !== oldWidget) {
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
    _addWidget(widget) {
        const { viewId = null, placement = DEFAULT_PLACEMENT } = widget;
        const container = widget.props._container ?? viewId;
        widget.widgetManager = this;
        widget.deck = this.deck;
        // Create an attach the HTML root element
        widget.rootElement = widget._onAdd({ deck: this.deck, viewId });
        if (widget.rootElement) {
            this._getContainer(container, placement).append(widget.rootElement);
        }
        widget.updateHTML();
    }
    /** Destroy an old widget */
    _removeWidget(widget) {
        widget.onRemove?.();
        if (widget.rootElement) {
            widget.rootElement.remove();
        }
        widget.rootElement = undefined;
        widget.deck = undefined;
        widget.widgetManager = undefined;
    }
    /** Get a container element based on view and placement */
    _getContainer(viewIdOrContainer, placement) {
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
        let container = viewContainer.querySelector(`.${placement}`);
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
    _updateContainers() {
        for (const id in this.containers) {
            const viewport = this.lastViewports[id] || null;
            const visible = id === ROOT_CONTAINER_ID || viewport;
            const container = this.containers[id];
            if (visible) {
                const bounds = this._getContainerBounds(viewport);
                container.style.display = 'block';
                // Align the container with the view
                container.style.left = `${bounds.x}px`;
                container.style.top = `${bounds.y}px`;
                container.style.width = `${bounds.width}px`;
                container.style.height = `${bounds.height}px`;
            }
            else {
                container.style.display = 'none';
            }
        }
    }
    /** Resolves a root container or view container in the shared widget coordinate system. */
    _getContainerBounds(viewport) {
        if (!viewport) {
            return {
                x: 0,
                y: 0,
                width: this.parentElement?.clientWidth || this.deck.width,
                height: this.parentElement?.clientHeight || this.deck.height
            };
        }
        const canvasBounds = this.getCanvasBounds(viewport);
        return {
            x: canvasBounds.x + viewport.x,
            y: canvasBounds.y + viewport.y,
            width: viewport.width,
            height: viewport.height
        };
    }
}
//# sourceMappingURL=widget-manager.js.map