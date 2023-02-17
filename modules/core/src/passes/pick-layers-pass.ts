import LayersPass, {LayersPassRenderOptions, RenderStats, Rect} from './layers-pass';
import {withParameters} from '@luma.gl/core';
import GL from '@luma.gl/constants';
import log from '../utils/log';

import type {Framebuffer} from '@luma.gl/core';
import type Viewport from '../viewports/viewport';
import type Layer from '../lib/layer';

const PICKING_PARAMETERS = {
  blendFunc: [GL.ONE, GL.ZERO, GL.CONSTANT_ALPHA, GL.ZERO],
  blendEquation: GL.FUNC_ADD
};

type PickLayersPassRenderOptions = LayersPassRenderOptions & {
  pickingFBO: Framebuffer;
  deviceRect: Rect;
  pickZ: boolean;
};

type EncodedPickingColors = {
  a: number;
  layer: Layer;
  viewports: Viewport[];
};

export type PickingColorDecoder = (pickedColor: number[] | Uint8Array) =>
  | {
      pickedLayer: Layer;
      pickedViewports: Viewport[];
      pickedObjectIndex: number;
    }
  | undefined;

export default class PickLayersPass extends LayersPass {
  private pickZ?: boolean;
  private _colorEncoderState: {
    byLayer: Map<Layer, EncodedPickingColors>;
    byAlpha: EncodedPickingColors[];
  } | null = null;

  render(props: LayersPassRenderOptions | PickLayersPassRenderOptions) {
    if ('pickingFBO' in props) {
      // When drawing into an off-screen buffer, use the alpha channel to encode layer index
      return this._drawPickingBuffer(props);
    }
    // When drawing to screen (debug mode), do not use the alpha channel so that result is always visible
    return super.render(props);
  }

  // Private
  // Draws list of layers and viewports into the picking buffer
  // Note: does not sample the buffer, that has to be done by the caller
  _drawPickingBuffer({
    layers,
    layerFilter,
    views,
    viewports,
    onViewportActive,
    pickingFBO,
    deviceRect: {x, y, width, height},
    cullRect,
    effects,
    pass = 'picking',
    pickZ,
    moduleParameters
  }: PickLayersPassRenderOptions): {
    decodePickingColor: PickingColorDecoder | null;
    stats: RenderStats;
  } {
    const gl = this.gl;
    this.pickZ = pickZ;
    const colorEncoderState = this._resetColorEncoder(pickZ);

    // Make sure we clear scissor test and fbo bindings in case of exceptions
    // We are only interested in one pixel, no need to render anything else
    // Note that the callback here is called synchronously.
    // Set blend mode for picking
    // always overwrite existing pixel with [r,g,b,layerIndex]
    const renderStatus = withParameters(
      gl,
      {
        scissorTest: true,
        scissor: [x, y, width, height],
        clearColor: [0, 0, 0, 0],
        // When used as Mapbox custom layer, the context state may be dirty
        // TODO - Remove when mapbox fixes this issue
        // https://github.com/mapbox/mapbox-gl-js/issues/7801
        depthMask: true,
        depthTest: true,
        depthRange: [0, 1],
        colorMask: [true, true, true, true],
        // Blending
        ...PICKING_PARAMETERS,
        blend: !pickZ
      },
      () =>
        super.render({
          target: pickingFBO,
          layers,
          layerFilter,
          views,
          viewports,
          onViewportActive,
          cullRect,
          effects: effects?.filter(e => e.useInPicking),
          pass,
          isPicking: true,
          moduleParameters
        })
    );

    // Clear the temp field
    this._colorEncoderState = null;
    const decodePickingColor = colorEncoderState && decodeColor.bind(null, colorEncoderState);
    return {decodePickingColor, stats: renderStatus};
  }

  shouldDrawLayer(layer: Layer): boolean {
    const {pickable, operation} = layer.props;
    return (pickable && operation.includes('draw')) || operation.includes('terrain');
  }

  protected getModuleParameters() {
    return {
      pickingActive: 1,
      pickingAttribute: this.pickZ,
      // turn off lighting by adding empty light source object
      // lights shader module relies on the `lightSources` to turn on/off lighting
      lightSources: {}
    };
  }

  protected getLayerParameters(layer: Layer, layerIndex: number, viewport: Viewport): any {
    const pickParameters = {...layer.props.parameters};
    const {pickable, operation} = layer.props;

    if (!this._colorEncoderState) {
      pickParameters.blend = false;
    } else if (pickable && operation.includes('draw')) {
      Object.assign(pickParameters, PICKING_PARAMETERS);
      pickParameters.blend = true;
      pickParameters.blendColor = encodeColor(this._colorEncoderState, layer, viewport);
    }
    if (operation.includes('terrain')) {
      pickParameters.blend = false;
    }

    return pickParameters;
  }

  protected _resetColorEncoder(pickZ: boolean) {
    // Track encoded layer indices
    this._colorEncoderState = pickZ
      ? null
      : {
          byLayer: new Map<Layer, EncodedPickingColors>(),
          byAlpha: []
        };
    // Temporarily store it on the instance so that it can be accessed by this.getLayerParameters
    return this._colorEncoderState;
  }
}

// Assign an unique alpha value for each pickable layer and track the encoding in the cache object
// Returns normalized blend color
function encodeColor(
  encoded: {
    byLayer: Map<Layer, EncodedPickingColors>;
    byAlpha: EncodedPickingColors[];
  },
  layer: Layer,
  viewport: Viewport
): number[] {
  const {byLayer, byAlpha} = encoded;
  let a;

  // Encode layerIndex in the alpha channel
  // TODO - combine small layers to better utilize the picking color space
  let entry = byLayer.get(layer);
  if (entry) {
    entry.viewports.push(viewport);
    a = entry.a;
  } else {
    a = byLayer.size + 1;
    if (a <= 255) {
      entry = {a, layer, viewports: [viewport]};
      byLayer.set(layer, entry);
      byAlpha[a] = entry;
    } else {
      log.warn('Too many pickable layers, only picking the first 255')();
      a = 0;
    }
  }
  return [0, 0, 0, a / 255];
}

// Given a picked color, retrieve the corresponding layer and viewports from cache
function decodeColor(
  encoded: {
    byLayer: Map<Layer, EncodedPickingColors>;
    byAlpha: EncodedPickingColors[];
  },
  pickedColor: number[] | Uint8Array
):
  | {
      pickedLayer: Layer;
      pickedViewports: Viewport[];
      pickedObjectIndex: number;
    }
  | undefined {
  const entry = encoded.byAlpha[pickedColor[3]];
  return (
    entry && {
      pickedLayer: entry.layer,
      pickedViewports: entry.viewports,
      pickedObjectIndex: entry.layer.decodePickingColor(pickedColor)
    }
  );
}
