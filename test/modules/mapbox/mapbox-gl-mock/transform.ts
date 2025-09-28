// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default class Transform {
  constructor({
    center = {lng: 0, lat: 0},
    zoom = 0,
    bearing = 0,
    pitch = 0,
    padding = {left: 0, right: 0, top: 0, bottom: 0},
    renderWorldCopies = true
  }) {
    this.center = center;
    this.zoom = zoom;
    this.bearing = bearing;
    this.pitch = pitch;
    this.padding = padding;
    this.renderWorldCopies = renderWorldCopies;
  }
}
