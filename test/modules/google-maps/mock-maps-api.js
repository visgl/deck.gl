import {WebMercatorViewport} from '@deck.gl/core';

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

  draw() {
    for (const overlay of this._overlays) {
      overlay.draw();
    }
  }

  getDiv() {
    return {
      firstChild: {
        offsetWidth: this.opts.width,
        offsetHeight: this.opts.height
      }
    };
  }

  getBounds() {
    return this.projection._getBounds();
  }

  getZoom() {
    return this.opts.zoom;
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
  }

  _removeOverlay(overlay) {
    this._overlays.delete(overlay);
    overlay.onRemove();
  }
}

export class OverlayView {
  constructor() {
    this.map = null;
    /* global document */
    this._container = document.createElement('div');
  }

  setMap(map) {
    if (this.map) {
      this.map._removeOverlay(this);
    }
    if (map) {
      map._addOverlay(this);
    }
    this.map = map;
  }

  getProjection() {
    return this.map.projection;
  }

  getPanes() {
    return {
      floatPane: this._container,
      mapPane: this._container,
      markerLayer: this._container,
      overlayLayer: this._container
    };
  }
}
