// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Adapted from https://github.com/mapbox/mapbox-gl-js-mock/
// BSD 3-Clause License
// Copyright (c) 2017, Mapbox

export default class Style {
  constructor({sources = {}, layers = []} = {}) {
    this.stylesheet = {
      owner: 'mapbox',
      id: 'testmap'
    };

    this._loaded = false;
    this._sources = {...sources};
    this._layers = {};
    this._order = [];

    for (const layer of layers) {
      this._layers[layer.id] = layer;
      this._order.push(layer.id);
    }
  }

  render() {
    for (const layerId of this._order) {
      const layer = this._layers[layerId];
      if (layer.implementation) {
        layer.implementation.render();
      } else if (layer.render) {
        layer.render();
      }
    }
  }

  serialize() {
    const style = {
      sources: this._sources,
      layers: this._order.map(id => this._layers[id])
    };
    // deep clone
    return JSON.parse(JSON.stringify(style));
  }

  _checkLoaded() {
    if (!this._loaded) {
      throw new Error('style is not done loading');
    }
  }

  addLayer(layer, beforeId) {
    this._checkLoaded();

    const layerId = layer.id;
    if (layerId in this._layers) {
      throw new Error(`Layer with the id ${layerId} already exists`);
    }
    if (layer.type === 'custom') {
      layer = {
        id: layer.id,
        type: 'custom',
        implementation: layer
      };
    }
    this._layers[layerId] = layer;
    if (beforeId) {
      if (!(beforeId in this._layers)) {
        throw new Error(`Layer ${beforeId} does not exist`);
      }
      const i = this._order.indexOf(beforeId);
      this._order.splice(i, 0, layerId);
    } else {
      this._order.push(layerId);
    }
  }

  moveLayer(layerId, beforeId) {
    this._checkLoaded();

    if (!(layerId in this._layers)) {
      throw new Error(`Layer ${layerId} does not exist`);
    }
    const i = this._order.indexOf(layerId);
    this._order.splice(i, 1);

    if (beforeId) {
      if (!(beforeId in this._layers)) {
        throw new Error(`Layer ${beforeId} does not exist`);
      }
      const i1 = this._order.indexOf(beforeId);
      this._order.splice(i1, 0, layerId);
    } else {
      this._order.push(layerId);
    }
  }

  removeLayer(layerId) {
    this._checkLoaded();

    if (!(layerId in this._layers)) {
      throw new Error(`Layer ${layerId} does not exist`);
    }
    delete this._layers[layerId];

    const i = this._order.indexOf(layerId);
    this._order.splice(i, 1);
  }

  getLayer(layerId) {
    return this._layers[layerId];
  }
}
