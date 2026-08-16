// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {device} from '@deck.gl/test-utils';

type Listener = (event?: any) => void;

export default class MockMapLibreMap {
  private readonly listeners: Record<string, Listener[]> = {};
  private readonly controls: any[] = [];
  private readonly container = document.createElement('div');
  private readonly canvas = document.createElement('canvas');

  center: {lng: number; lat: number};
  zoom: number;
  bearing = 0;
  pitch = 0;
  padding = {left: 0, right: 0, top: 0, bottom: 0};
  renderWorldCopies = true;
  projection: {type: string};
  centerElevation: number;

  constructor({
    center = {lng: 0, lat: 0},
    zoom = 0,
    projection = 'mercator',
    centerElevation = 0
  }: {
    center?: {lng: number; lat: number};
    zoom?: number;
    projection?: string;
    centerElevation?: number;
  } = {}) {
    this.center = center;
    this.zoom = zoom;
    this.projection = {type: projection};
    this.centerElevation = centerElevation;

    Object.defineProperties(this.container, {
      clientWidth: {value: 800, configurable: true},
      clientHeight: {value: 600, configurable: true}
    });
  }

  get transform(): never {
    throw new Error('MapLibre private API accessed: transform');
  }

  get painter(): never {
    throw new Error('MapLibre private API accessed: painter');
  }

  get style(): never {
    throw new Error('MapLibre private API accessed: style');
  }

  on(type: string, listener: Listener): this {
    (this.listeners[type] ||= []).push(listener);
    return this;
  }

  off(type: string, listener?: Listener): this {
    if (!listener) {
      delete this.listeners[type];
      return this;
    }
    const listeners = this.listeners[type];
    if (listeners) {
      this.listeners[type] = listeners.filter(candidate => candidate !== listener);
    }
    return this;
  }

  addControl(control: any): this {
    this.controls.push(control);
    control.onAdd(this);
    return this;
  }

  removeControl(control: any): this {
    const controlIndex = this.controls.indexOf(control);
    if (controlIndex >= 0) {
      this.controls.splice(controlIndex, 1);
      control.onRemove(this);
    }
    return this;
  }

  getContainer(): HTMLElement {
    return this.container;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getCenter(): {lng: number; lat: number} {
    return this.center;
  }

  getZoom(): number {
    return this.zoom;
  }

  getBearing(): number {
    return this.bearing;
  }

  getPitch(): number {
    return this.pitch;
  }

  getPadding(): {left: number; right: number; top: number; bottom: number} {
    return this.padding;
  }

  getRenderWorldCopies(): boolean {
    return this.renderWorldCopies;
  }

  getProjection(): {type: string} {
    return this.projection;
  }

  getCenterElevation(): number {
    return this.centerElevation;
  }

  triggerRepaint(): void {}
}

export {device};
