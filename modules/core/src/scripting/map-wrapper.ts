// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {MapViewState} from '../views/map-view';

export type MapProps = {
  /** mapboxgl, maplibregl, or compatible library */
  mapLib: {
    Map: any;
    accessToken?: string;
  };
  container: HTMLElement;
  mapStyle?: string;
  mapboxApiAccessToken?: string;
  /** Directly passed to Map class constructor */
  mapOptions?: any;
  width: number;
  height: number;
  viewState: MapViewState;
};

/** A small wrapper that turns mapbox-gl or maplibre-gl Map into a stateless component
 */
export class MapWrapper {
  constructor(props: MapProps) {
    this.props = {...props};
    this._initialize(this.props);
  }

  private props: MapProps;
  private map: any = null;
  private width: number = 0;
  private height: number = 0;

  finalize() {
    this.map?.remove();
    this.map = null;
  }

  setProps(props: Partial<MapProps>) {
    const oldProps = this.props;
    const newProps = {...this.props, ...props};
    this.props = newProps;

    if (!this.map) {
      return;
    }

    const needsRedraw = this._update(oldProps, newProps);

    if (needsRedraw) {
      this.redraw();
    }
  }

  // Force redraw the map now. Typically resize() and jumpTo() is reflected in the next
  // render cycle, which is managed by Mapbox's animation loop.
  // This removes the synchronization issue caused by requestAnimationFrame.
  redraw() {
    const map = this.map;
    // map._render will throw error if style does not exist
    // https://github.com/mapbox/mapbox-gl-js/blob/fb9fc316da14e99ff4368f3e4faa3888fb43c513
    //   /src/ui/map.js#L1834
    if (map.style) {
      // cancel the scheduled update
      if (map._frame) {
        map._frame.cancel();
        map._frame = null;
      }
      // the order is important - render() may schedule another update
      map._render();
    }
  }

  // External apps can access map this way
  getMap() {
    return this.map;
  }

  private _initialize(props: MapProps) {
    const {mapLib, container} = props;

    // Creation only props
    mapLib.accessToken = props.mapboxApiAccessToken || '';

    this.map = new props.mapLib.Map({
      container,
      maxZoom: 24,
      ...props.mapOptions,
      ...viewStateToMapboxProps(props.viewState),
      style: props.mapStyle,
      interactive: false,
      trackResize: false
    });

    // Hijack dimension properties
    // This eliminates the timing issue between calling resize() and DOM update
    /* eslint-disable accessor-pairs */
    Object.defineProperty(container, 'offsetWidth', {get: () => this.width});
    Object.defineProperty(container, 'clientWidth', {get: () => this.width});
    Object.defineProperty(container, 'offsetHeight', {
      get: () => this.height
    });
    Object.defineProperty(container, 'clientHeight', {
      get: () => this.height
    });
    this.map.resize();
  }

  private _update(oldProps: MapProps, newProps: MapProps) {
    const styleChanged = oldProps.mapStyle !== newProps.mapStyle;
    if (styleChanged) {
      this.map.setStyle(newProps.mapStyle);
    }

    const sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;
    if (sizeChanged) {
      this.width = newProps.width;
      this.height = newProps.height;
      this.map.resize();
    }

    const oldViewState = oldProps.viewState;
    const newViewState = newProps.viewState;
    const viewportChanged =
      newViewState.latitude !== oldViewState.latitude ||
      newViewState.longitude !== oldViewState.longitude ||
      newViewState.zoom !== oldViewState.zoom ||
      newViewState.pitch !== oldViewState.pitch ||
      newViewState.bearing !== oldViewState.bearing;
    if (viewportChanged) {
      this.map.jumpTo(viewStateToMapboxProps(newViewState));
    }
    return sizeChanged || viewportChanged;
  }
}

function viewStateToMapboxProps(viewState: MapViewState) {
  return {
    center: [viewState.longitude, viewState.latitude],
    zoom: viewState.zoom,
    bearing: viewState.bearing ?? 0,
    pitch: viewState.pitch ?? 0
  };
}
