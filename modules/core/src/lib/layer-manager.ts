// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {Timeline} from '@luma.gl/core';
import {LIFECYCLE} from '../lifecycle/constants';
import log from '../utils/log';
import debug from '../debug';
import {flatten} from '../utils/flatten';
import {Stats} from '@probe.gl/stats';
import ResourceManager from './resource/resource-manager';

import Viewport from '../viewports/viewport';
import {createProgramManager} from '../shaderlib';

import type Layer from './layer';
import type CompositeLayer from './composite-layer';
import type Deck from './deck';
import type {ProgramManager} from '@luma.gl/engine';

const TRACE_SET_LAYERS = 'layerManager.setLayers';
const TRACE_ACTIVATE_VIEWPORT = 'layerManager.activateViewport';

export type LayerContext = {
  layerManager: LayerManager;
  resourceManager: ResourceManager;
  deck?: Deck;
  gl: WebGLRenderingContext;
  programManager: ProgramManager;
  stats: Stats;
  viewport: Viewport;
  timeline: Timeline;
  mousePosition: {x: number; y: number} | null;
  userData: any;
  onError?: <PropsT>(error: Error, source: Layer<PropsT>) => void;
};

export type LayersList = (Layer | undefined | false | null | LayersList)[];

export default class LayerManager {
  layers: Layer[];
  context: LayerContext;
  resourceManager: ResourceManager;

  private _lastRenderedLayers: LayersList = [];
  private _needsRedraw: string | false = false;
  private _needsUpdate: string | false = false;
  private _nextLayers: LayersList | null = null;
  private _debug: boolean = false;

  // eslint-disable-next-line
  constructor(
    gl,
    {
      deck,
      stats,
      viewport,
      timeline
    }: {
      deck?: Deck;
      stats?: Stats;
      viewport?: Viewport;
      timeline?: Timeline;
    } = {}
  ) {
    // Currently deck.gl expects the DeckGL.layers array to be different
    // whenever React rerenders. If the same layers array is used, the
    // LayerManager's diffing algorithm will generate a fatal error and
    // break the rendering.

    // `this._lastRenderedLayers` stores the UNFILTERED layers sent
    // down to LayerManager, so that `layers` reference can be compared.
    // If it's the same across two React render calls, the diffing logic
    // will be skipped.
    this.layers = [];
    this.resourceManager = new ResourceManager({gl, protocol: 'deck://'});

    this.context = {
      mousePosition: null,
      userData: {},
      layerManager: this,
      gl,
      deck,
      // Enabling luma.gl Program caching using private API (_cachePrograms)
      programManager: gl && createProgramManager(gl),
      stats: stats || new Stats({id: 'deck.gl'}),
      // Make sure context.viewport is not empty on the first layer initialization
      viewport: viewport || new Viewport({id: 'DEFAULT-INITIAL-VIEWPORT'}), // Current viewport, exposed to layers for project* function
      timeline: timeline || new Timeline(),
      resourceManager: this.resourceManager,
      onError: undefined
    };

    Object.seal(this);
  }

  /** Method to call when the layer manager is not needed anymore. */
  finalize() {
    this.resourceManager.finalize();
    // Finalize all layers
    for (const layer of this.layers) {
      this._finalizeLayer(layer);
    }
  }

  /** Check if a redraw is needed */
  needsRedraw(
    opts: {
      /** Reset redraw flags to false after the call */
      clearRedrawFlags: boolean;
    } = {clearRedrawFlags: false}
  ): string | false {
    let redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }

    // This layers list doesn't include sublayers, relying on composite layers
    for (const layer of this.layers) {
      // Call every layer to clear their flags
      const layerNeedsRedraw = layer.getNeedsRedraw(opts);
      redraw = redraw || layerNeedsRedraw;
    }

    return redraw;
  }

  /** Check if a deep update of all layers is needed */
  needsUpdate(): string | false {
    if (this._nextLayers && this._nextLayers !== this._lastRenderedLayers) {
      // New layers array may be the same as the old one if `setProps` is called by React
      return 'layers changed';
    }
    return this._needsUpdate;
  }

  /** Layers will be redrawn (in next animation frame) */
  setNeedsRedraw(reason: string): void {
    this._needsRedraw = this._needsRedraw || reason;
  }

  /** Layers will be updated deeply (in next animation frame)
    Potentially regenerating attributes and sub layers */
  setNeedsUpdate(reason: string): void {
    this._needsUpdate = this._needsUpdate || reason;
  }

  /** Gets a list of currently rendered layers. Optionally filter by id. */
  getLayers({layerIds}: {layerIds?: string[]} = {}): Layer[] {
    // Filtering by layerId compares beginning of strings, so that sublayers will be included
    // Dependes on the convention of adding suffixes to the parent's layer name
    return layerIds
      ? this.layers.filter(layer => layerIds.find(layerId => layer.id.indexOf(layerId) === 0))
      : this.layers;
  }

  /** Set props needed for layer rendering and picking. */
  setProps(props: any): void {
    if ('debug' in props) {
      this._debug = props.debug;
    }

    // A way for apps to add data to context that can be accessed in layers
    if ('userData' in props) {
      this.context.userData = props.userData;
    }

    // New layers will be processed in `updateLayers` in the next update cycle
    if ('layers' in props) {
      this._nextLayers = props.layers;
    }

    if ('onError' in props) {
      this.context.onError = props.onError;
    }
  }

  /** Supply a new layer list, initiating sublayer generation and layer matching */
  setLayers(newLayers: LayersList, reason?: string): void {
    debug(TRACE_SET_LAYERS, this, reason, newLayers);

    this._lastRenderedLayers = newLayers;

    const flatLayers = flatten(newLayers, Boolean) as Layer[];

    for (const layer of flatLayers) {
      layer.context = this.context;
    }

    this._updateLayers(this.layers, flatLayers);
  }

  /** Update layers from last cycle if `setNeedsUpdate()` has been called */
  updateLayers(): void {
    // NOTE: For now, even if only some layer has changed, we update all layers
    // to ensure that layer id maps etc remain consistent even if different
    // sublayers are rendered
    const reason = this.needsUpdate();
    if (reason) {
      this.setNeedsRedraw(`updating layers: ${reason}`);
      // Force a full update
      this.setLayers(this._nextLayers || this._lastRenderedLayers, reason);
    }
    // Updated, clear the backlog
    this._nextLayers = null;
  }

  //
  // INTERNAL METHODS
  //

  /** Make a viewport "current" in layer context, updating viewportChanged flags */
  activateViewport = (viewport: Viewport) => {
    debug(TRACE_ACTIVATE_VIEWPORT, this, viewport);
    if (viewport) {
      this.context.viewport = viewport;
    }
  };

  private _handleError(stage: string, error: Error, layer: Layer) {
    layer.raiseError(error, `${stage} of ${layer}`);
  }

  // TODO - mark layers with exceptions as bad and remove from rendering cycle?
  /** Match all layers, checking for caught errors
    to avoid having an exception in one layer disrupt other layers */
  private _updateLayers(oldLayers: Layer[], newLayers: Layer[]): void {
    // Create old layer map
    const oldLayerMap: {[layerId: string]: Layer | null} = {};
    for (const oldLayer of oldLayers) {
      if (oldLayerMap[oldLayer.id]) {
        log.warn(`Multiple old layers with same id ${oldLayer.id}`)();
      } else {
        oldLayerMap[oldLayer.id] = oldLayer;
      }
    }

    // Allocate array for generated layers
    const generatedLayers: Layer[] = [];

    // Match sublayers
    this._updateSublayersRecursively(newLayers, oldLayerMap, generatedLayers);

    // Finalize unmatched layers
    this._finalizeOldLayers(oldLayerMap);

    let needsUpdate: string | false = false;
    for (const layer of generatedLayers) {
      if (layer.hasUniformTransition()) {
        needsUpdate = `Uniform transition in ${layer}`;
        break;
      }
    }

    this._needsUpdate = needsUpdate;
    this.layers = generatedLayers;
  }

  /* eslint-disable complexity,max-statements */
  // Note: adds generated layers to `generatedLayers` array parameter
  private _updateSublayersRecursively(
    newLayers: Layer[],
    oldLayerMap: {[layerId: string]: Layer | null},
    generatedLayers: Layer[]
  ) {
    for (const newLayer of newLayers) {
      newLayer.context = this.context;

      // Given a new coming layer, find its matching old layer (if any)
      const oldLayer = oldLayerMap[newLayer.id];
      if (oldLayer === null) {
        // null, rather than undefined, means this id was originally there
        log.warn(`Multiple new layers with same id ${newLayer.id}`)();
      }
      // Remove the old layer from candidates, as it has been matched with this layer
      oldLayerMap[newLayer.id] = null;

      let sublayers: Layer[] | null = null;

      // We must not generate exceptions until after layer matching is complete
      try {
        if (this._debug && oldLayer !== newLayer) {
          newLayer.validateProps();
        }

        if (!oldLayer) {
          this._initializeLayer(newLayer);
        } else {
          this._transferLayerState(oldLayer, newLayer);
          this._updateLayer(newLayer);
        }
        generatedLayers.push(newLayer);

        // Call layer lifecycle method: render sublayers
        sublayers = newLayer.isComposite ? (newLayer as CompositeLayer).getSubLayers() : null;
        // End layer lifecycle method: render sublayers
      } catch (err) {
        this._handleError('matching', err as Error, newLayer); // Record first exception
      }

      if (sublayers) {
        this._updateSublayersRecursively(sublayers, oldLayerMap, generatedLayers);
      }
    }
  }
  /* eslint-enable complexity,max-statements */

  // Finalize any old layers that were not matched
  private _finalizeOldLayers(oldLayerMap: {[layerId: string]: Layer | null}): void {
    for (const layerId in oldLayerMap) {
      const layer = oldLayerMap[layerId];
      if (layer) {
        this._finalizeLayer(layer);
      }
    }
  }

  // / EXCEPTION SAFE LAYER ACCESS

  /** Safely initializes a single layer, calling layer methods */
  private _initializeLayer(layer: Layer): void {
    try {
      layer._initialize();
      layer.lifecycle = LIFECYCLE.INITIALIZED;
    } catch (err) {
      this._handleError('initialization', err as Error, layer);
      // TODO - what should the lifecycle state be here? LIFECYCLE.INITIALIZATION_FAILED?
    }
  }

  /** Transfer state from one layer to a newer version */
  private _transferLayerState(oldLayer: Layer, newLayer: Layer): void {
    newLayer._transferState(oldLayer);
    newLayer.lifecycle = LIFECYCLE.MATCHED;

    if (newLayer !== oldLayer) {
      oldLayer.lifecycle = LIFECYCLE.AWAITING_GC;
    }
  }

  /** Safely updates a single layer, cleaning all flags */
  private _updateLayer(layer: Layer): void {
    try {
      layer._update();
    } catch (err) {
      this._handleError('update', err as Error, layer);
    }
  }

  /** Safely finalizes a single layer, removing all resources */
  private _finalizeLayer(layer: Layer): void {
    this._needsRedraw = this._needsRedraw || `finalized ${layer}`;

    layer.lifecycle = LIFECYCLE.AWAITING_FINALIZATION;

    try {
      layer._finalize();
      layer.lifecycle = LIFECYCLE.FINALIZED;
    } catch (err) {
      this._handleError('finalization', err as Error, layer);
    }
  }
}
