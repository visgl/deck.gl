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
 * @internal Used by MapboxOverlay for widgets with `viewId: 'mapbox'`.
 */
export class DeckWidgetControl implements IControl {
  private _widget: Widget<any>;
  private _container: HTMLDivElement | null = null;

  constructor(widget: Widget<any>) {
    this._widget = widget;
  }

  /**
   * Called when the control is added to the map.
   * Creates a container element that will be positioned by Mapbox/MapLibre,
   * and sets the widget's _container prop so WidgetManager appends the widget here.
   *
   * For widgets with `placement: 'fill'` (e.g. TimelineWidget, SplitterWidget,
   * ScrollbarWidget), the widget needs to span the entire map. The basemap's
   * control container applies `transform: translate(0)` which makes it a small
   * containing block, breaking `position: absolute; left: 0; right: 0`. To fix
   * this, the widget's `_container` is set to the map's container element
   * (which has `position: relative`), while the control div stays empty and
   * hidden for IControl compliance.
   */
  onAdd(map: Map): HTMLElement {
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl mapboxgl-ctrl deck-widget-ctrl';

    if (this._widget.placement === 'fill') {
      this._container.classList.add('deck-widget-ctrl-fill');
      this._widget.props._container = map.getContainer() as HTMLDivElement;
    } else {
      this._widget.props._container = this._container;
    }

    return this._container;
  }

  /**
   * Called when the control is removed from the map.
   */
  onRemove(): void {
    // Clear the _container reference (either the control div or the map container)
    this._widget.props._container = null;
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
  get widget(): Widget<any> {
    return this._widget;
  }

  /**
   * Updates the wrapped widget reference.
   * Used when reusing this control for a new widget instance with the same id.
   */
  setWidget(widget: Widget<any>): void {
    this._widget = widget;
  }
}
