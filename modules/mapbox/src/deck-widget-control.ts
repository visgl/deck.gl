// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Widget} from '@deck.gl/core';
import type {IControl, ControlPosition, Map} from './types';

/**
 * Wraps a deck.gl Widget as a Mapbox/MapLibre IControl.
 *
 * This enables deck widgets to be positioned alongside native map controls
 * in the same DOM container, preventing overlap issues.
 *
 * Used internally by MapboxOverlay for widgets with `viewId: 'mapbox'`.
 * Can also be used directly for more control over widget positioning.
 *
 * @example
 * ```typescript
 * const zoomWidget = new ZoomWidget({placement: 'top-right'});
 * const control = new DeckWidgetControl(zoomWidget);
 * map.addControl(control, 'top-right');
 * ```
 */
export class DeckWidgetControl implements IControl {
  private _widget: Widget;
  private _container: HTMLDivElement | null = null;

  constructor(widget: Widget) {
    this._widget = widget;
  }

  /**
   * Called when the control is added to the map.
   * Creates a container element that will be positioned by Mapbox/MapLibre,
   * and sets the widget's _container prop so WidgetManager appends the widget here.
   */
  onAdd(map: Map): HTMLElement {
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl mapboxgl-ctrl deck-widget-ctrl';

    // Set _container so WidgetManager appends the widget's rootElement here
    // instead of in its own overlay container
    this._widget.props._container = this._container;

    return this._container;
  }

  /**
   * Called when the control is removed from the map.
   */
  onRemove(): void {
    // Clear the _container reference so widget doesn't try to append there
    if (this._widget.props._container === this._container) {
      this._widget.props._container = null;
    }
    this._container?.remove();
    this._container = null;
  }

  /**
   * Returns the default position for this control.
   * Uses the widget's placement, which conveniently matches Mapbox control positions.
   * Note: 'fill' placement is not supported by Mapbox controls, defaults to 'top-left'.
   */
  getDefaultPosition(): ControlPosition {
    const placement = this._widget.placement;
    // 'fill' is not a valid Mapbox control position
    if (!placement || placement === 'fill') {
      return 'top-left';
    }
    return placement;
  }

  /** Returns the wrapped widget */
  get widget(): Widget {
    return this._widget;
  }
}
