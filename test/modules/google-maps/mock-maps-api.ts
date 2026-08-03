// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {WebMercatorViewport} from '@deck.gl/core';

export const RenderingType = {
  VECTOR: 'VECTOR',
  RASTER: 'RASTER',
  UNINITIALIZED: 'UNINITIALIZED'
};

export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class LatLng {
  constructor(lat, lng) {
    this._lat = lat;
    this._lng = lng;
  }

  lat() {
    return this._lat;
  }
  lng() {
    return this._lng;
  }
}

export class LatLngBounds {
  constructor(ne, sw) {
    this._ne = ne;
    this._sw = sw;
  }

  getNorthEast() {
    return this._ne;
  }
  getSouthWest() {
    return this._sw;
  }
}

export class Projection {
  constructor(opts) {
    this._viewport = new WebMercatorViewport(opts);
  }

  getWorldWidth() {
    return 512 * this._viewport.scale;
  }

  fromLatLngToDivPixel(latLng) {
    const p = this._viewport.project([latLng.lng(), latLng.lat()]);
    return new Point(p[0], p[1]);
  }

  fromLatLngToContainerPixel(latLng) {
    const p = this._viewport.project([latLng.lng(), latLng.lat()]);
    return new Point(p[0], p[1]);
  }

  fromContainerPixelToLatLng(point) {
    const coord = this._viewport.unproject([point.x, point.y]);
    return new LatLng(coord[1], coord[0]);
  }

  _getBounds() {
    const nw = this._viewport.unproject([0, 0]);
    const se = this._viewport.unproject([this._viewport.width, this._viewport.height]);

    return new LatLngBounds(new LatLng(nw[1], se[0]), new LatLng(se[1], nw[0]));
  }
}

export class Map {
  constructor(opts) {
    this.opts = opts;
    this._overlays = new Set();
    this._callbacks = {};

    this.projection = new Projection(opts);
    this.transformer = {
      getCameraParams: () => {
        return {
          center: {
            lat: () => this.opts.latitude,
            lng: () => this.opts.longitude
          },
          heading: this.getHeading(),
          tilt: this.getTilt(),
          zoom: this.getZoom()
        };
      }
    };

    /* global document */
    this._mapDiv = document.createElement('div');
    const firstChild = document.createElement('div');
    firstChild.style.width = `${opts.width}px`;
    firstChild.style.height = `${opts.height}px`;
    Object.defineProperty(firstChild, 'offsetWidth', {value: opts.width});
    Object.defineProperty(firstChild, 'offsetHeight', {value: opts.height});
    this._mapDiv.appendChild(firstChild);
  }

  addListener(event, cb) {
    this._callbacks[event] = this._callbacks[event] || new Set();
    this._callbacks[event].add(cb);
    return {
      remove: () => this._callbacks[event].delete(cb)
    };
  }

  emit(event) {
    if (!this._callbacks[event.type]) {
      return;
    }
    for (const func of this._callbacks[event.type]) {
      func(event);
    }
  }

  getRenderingType() {
    return this.opts.renderingType || RenderingType.RASTER;
  }

  draw() {
    for (const overlay of this._overlays) {
      if (this.getRenderingType() === RenderingType.RASTER) {
        overlay.draw();
      } else {
        // For vector maps, we may have both OverlayView (with draw) and WebGLOverlayView (with onDraw)
        if (overlay.onDraw) {
          overlay.onDraw({transformer: this.transformer});
        } else if (overlay.draw) {
          overlay.draw();
        }
      }
    }
  }

  getDiv() {
    return this._mapDiv;
  }

  getBounds() {
    return this.projection._getBounds();
  }

  getZoom() {
    return this.opts.zoom;
  }

  setHeading(heading) {
    this.opts.heading = heading;
  }

  getHeading() {
    return this.opts.heading || 0;
  }

  setTilt(tilt) {
    this.opts.pitch = tilt;
  }

  getTilt() {
    return this.opts.pitch || 0;
  }

  _addOverlay(overlay) {
    this._overlays.add(overlay);
    overlay.onAdd();
    if (this.getRenderingType() === RenderingType.VECTOR && overlay.onContextRestored) {
      overlay.onContextRestored({});
    }
  }

  _removeOverlay(overlay) {
    this._overlays.delete(overlay);
    overlay.onRemove();
  }
}

export class Map3DElement {
  constructor(opts) {
    /* global document */
    const element = document.createElement('gmp-map-3d');
    const center = opts.center || {
      lat: opts.latitude || 0,
      lng: opts.longitude || 0,
      altitude: opts.altitude || 0
    };

    Object.assign(element, {
      cameraPosition: opts.cameraPosition,
      center,
      range: opts.range || 1000,
      heading: opts.heading || 0,
      tilt: opts.tilt || opts.pitch || 0,
      roll: opts.roll || 0,
      fov: opts.fov || 25,
      emit: event => element.dispatchEvent(new Event(event.type))
    });
    Object.defineProperty(element, 'clientWidth', {value: opts.width, configurable: true});
    Object.defineProperty(element, 'clientHeight', {value: opts.height, configurable: true});
    Object.defineProperty(element, 'offsetWidth', {value: opts.width, configurable: true});
    Object.defineProperty(element, 'offsetHeight', {value: opts.height, configurable: true});
    element.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: opts.width,
      bottom: opts.height,
      width: opts.width,
      height: opts.height
    });

    return element;
  }
}

export const maps3d = {
  Map3DElement
};

export class OverlayView {
  constructor() {
    this.map = null;
    /* global document */
    this._container = document.createElement('div');
  }

  setMap(map) {
    this.map?._removeOverlay(this);
    this.map = map;
    map?._addOverlay(this);
  }

  getMap() {
    return this.map;
  }

  getProjection() {
    return this.map.projection;
  }

  getPanes() {
    // For proper testing, overlayLayer should be part of the map's div
    if (!this.map) return null;
    return {
      floatPane: this._container,
      mapPane: this._container,
      markerLayer: this._container,
      overlayLayer: this.map._mapDiv
    };
  }
}

export class WebGLOverlayView {
  constructor() {
    this.map = null;
    this._container = document.createElement('div');
    this._draws = 0;
  }

  setMap(map) {
    this.map?._removeOverlay(this);
    this.map = map;
    map?._addOverlay(this);
  }

  getMap() {
    return this.map;
  }

  requestRedraw() {
    this._draws++;
  }
}
