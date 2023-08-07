// Adapted from https://github.com/mapbox/mapbox-gl-js-mock/
// BSD 3-Clause License
// Copyright (c) 2017, Mapbox
import {Evented, Event} from './evented';
import Style from './style';
import Transform from './transform';
import {device, gl} from '@deck.gl/test-utils';

/* global document, setTimeout */
export default class Map extends Evented {
  constructor(options = {}) {
    super();

    this._container = document.createElement('div');
    this.options = options;
    this.version = options.version;
    this.style = new Style(options.style);
    this._controls = [];
    this.transform = new Transform(options);
    this._loaded = false;
    this.painter = {context: {device, gl}};

    setTimeout(() => {
      this.style._loaded = true;
      this.fire(new Event('styledata'));
      this._loaded = true;
      this.fire(new Event('load'));
    }, 0);
  }

  getContainer() {
    return this._container;
  }

  getCenter() {
    return this.transform.center;
  }
  setCenter(value) {
    this.transform.center = value;
    this.fire(new Event('move'));
  }
  getZoom() {
    return this.transform.zoom;
  }
  setZoom(value) {
    this.transform.zoom = value;
    this.fire(new Event('move'));
  }
  getBearing() {
    return this.transform.bearing;
  }
  setBearing(value) {
    this.transform.bearing = value;
    this.fire(new Event('move'));
  }
  getPitch() {
    return this.transform.pitch;
  }
  setPitch(value) {
    this.transform.pitch = value;
    this.fire(new Event('move'));
  }
  getPadding() {
    return this.transform.padding;
  }
  setPadding(value) {
    this.transform.padding = value;
  }
  getRenderWorldCopies() {
    return this.transform.renderWorldCopies;
  }
  setRenderWorldCopies(value) {
    this.transform.renderWorldCopies = value;
  }

  addControl(control) {
    this._controls.push(control);
    control.onAdd(this);
  }
  removeControl(control) {
    const i = this._controls.indexOf(control);
    if (i >= 0) {
      this._controls.splice(i, 1);
      control.onRemove(this);
    }
  }

  loaded() {
    return this._loaded;
  }

  getStyle() {
    return this.style.serialize();
  }
  setStyle(style) {
    this.style = new Style(style);
    setTimeout(() => {
      this.style._loaded = true;
      this.fire(new Event('styledata'));
    }, 0);
  }

  addLayer(layer, beforeId) {
    this.style.addLayer(layer, beforeId);

    if (layer.type === 'custom') {
      layer.onAdd(this, gl);
    }
  }
  moveLayer(layerId, beforeId) {
    this.style.moveLayer(layerId, beforeId);
  }
  removeLayer(layerId) {
    const layer = this.getLayer(layerId);
    if (layer.type === 'custom') {
      layer.implementation.onRemove(this);
    }
    this.style.removeLayer(layerId);
  }
  getLayer(layerId) {
    return this.style.getLayer(layerId);
  }

  triggerRepaint() {
    setTimeout(() => this._render(), 0);
  }

  _render() {
    this.style.render();
    this.fire(new Event('render'));
  }

  remove() {
    this._controls = [];
    this.style = null;
  }
}
