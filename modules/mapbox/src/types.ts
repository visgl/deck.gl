// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Types that offer basic interface compatible with mapbox-gl and maplibre-gl

type Listener = (event?: any) => any;

export interface Evented {
  on(type: string, listener: Listener);

  off(type: string, listener?: Listener);

  once(type: string, listener: Listener);
}

export type Point = {
  x: number;
  y: number;
};

export type LngLat = {
  lng: number;
  lat: number;
};

export type PaddingOptions = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type FreeCameraOptions = {
  position?: {
    x: number;
    y: number;
    z: number;
  };
};

export interface IControl {
  onAdd(map: Map): HTMLElement;

  onRemove(map: Map): void;

  getDefaultPosition?: (() => string) | undefined;
}

export type ControlPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface CustomLayerInterface {
  id: string;
  type: 'custom';
  renderingMode?: '2d' | '3d';

  onRemove?(map: Map, gl: WebGLRenderingContext): void;
  onAdd?(map: Map, gl: WebGLRenderingContext): void;

  prerender?(gl: WebGLRenderingContext, matrix: number[]): void;
  render(gl: WebGLRenderingContext, matrix: number[]): void;
}

export type MapMouseEvent = {
  type: string;
  target: Map;
  originalEvent: MouseEvent;
  point: Point;
  lngLat: LngLat;
};

/**
 * A minimal type that represents Mapbox.Map or Maplibre.Map
 * Only losely typed for compatibility
 */
export interface Map extends Evented {
  addControl(control: IControl, position?: ControlPosition);

  removeControl(control: IControl);

  hasControl(control: IControl): boolean;

  resize(): this;

  isStyleLoaded(): boolean | void;

  addSource(id: string, source: any);

  removeSource(id: string): this;

  getSource(id: string): any;

  addLayer(layer: any, before?: string);

  moveLayer(id: string, beforeId?: string);

  removeLayer(id: string);

  getLayer(id: string): any;

  getContainer(): HTMLElement;

  getCanvas(): HTMLCanvasElement;

  getCenter(): LngLat;
  getZoom(): number;
  getBearing(): number;
  getPitch(): number;
  getPadding(): PaddingOptions;
  getRenderWorldCopies(): boolean;

  // mapbox v2+, maplibre v3+
  getTerrain?(): any;
  // mapbox v2+, maplibre v5+
  getProjection?(): any;
  // mapbox v2+
  getFreeCameraOptions?(): FreeCameraOptions;

  // This is not a public property
  transform?: any;

  remove(): void;

  triggerRepaint(): void;
}
