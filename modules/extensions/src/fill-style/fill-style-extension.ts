// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerExtension} from '@deck.gl/core';

import {FillStyleModuleProps, patternShaders} from './shader-module';

import type {
  Layer,
  LayerContext,
  DefaultProps,
  Accessor,
  AccessorFunction,
  TextureSource,
  UpdateParameters
} from '@deck.gl/core';
import type {Texture} from '@luma.gl/core';

const defaultProps: DefaultProps<FillStyleExtensionProps> = {
  fillPatternEnabled: true,
  fillPatternAtlas: {
    type: 'image',
    value: null,
    async: true,
    parameters: {lodMaxClamp: 0}
  },
  fillPatternMapping: {type: 'object', value: {}, async: true},
  fillPatternMask: true,
  getFillPattern: {type: 'accessor', value: d => d.pattern},
  getFillPatternScale: {type: 'accessor', value: 1},
  getFillPatternOffset: {type: 'accessor', value: [0, 0]}
};

export type FillStyleExtensionProps<DataT = any> = {
  /** Cheap toggle to enable/disable pattern fill. Requires the `pattern` option to be on.
   * @default true
   */
  fillPatternEnabled?: boolean;
  /** Sprite image url or texture that packs all your patterns into one layout. */
  fillPatternAtlas?: string | TextureSource;
  /** Pattern names mapped to pattern definitions, or a url that points to a JSON file. */
  fillPatternMapping?:
    | string
    | Record<
        string,
        {
          /** Left position of the pattern on the atlas */
          x: number;
          /** Top position of the pattern on the atlas */
          y: number;
          /** Width of the pattern */
          width: number;
          /** Height of the pattern */
          height: number;
        }
      >;
  /**
   * Whether to treat the patterns as transparency masks.
   * @default true
   */
  fillPatternMask?: boolean;
  /** Accessor for the name of the pattern. */
  getFillPattern?: AccessorFunction<DataT, string>;
  /** Accessor for the scale of the pattern, relative to the original size. If the pattern is 24 x 24 pixels, scale `1` roughly yields 24 meters.
   * @default 1
   */
  getFillPatternScale?: Accessor<DataT, number>;
  /**
   * Accessor for the offset of the pattern, relative to the original size. Offset `[0.5, 0.5]` shifts the pattern alignment by half.
   * @default [0, 0]
   */
  getFillPatternOffset?: Accessor<DataT, [number, number]>;
};

export type FillStyleExtensionOptions = {
  /** If `true`, adds the ability to tile the filled area with a pattern.
   * @default false
   */
  pattern: boolean;
};

/** Adds selected features to layers that render a "fill", such as the `PolygonLayer` and `ScatterplotLayer`. */
export default class FillStyleExtension extends LayerExtension<FillStyleExtensionOptions> {
  static defaultProps = defaultProps;
  static extensionName = 'FillStyleExtension';

  constructor({pattern = false}: Partial<FillStyleExtensionOptions> = {}) {
    super({pattern});
  }

  isEnabled(layer: Layer<FillStyleExtensionProps>): boolean {
    return layer.getAttributeManager() !== null && !('pathTesselator' in layer.state);
  }

  getShaders(this: Layer<FillStyleExtensionProps>, extension: this): any {
    if (!extension.isEnabled(this)) {
      return null;
    }

    return {
      modules: [extension.opts.pattern && patternShaders].filter(Boolean)
    };
  }

  initializeState(this: Layer<FillStyleExtensionProps>, context: LayerContext, extension: this) {
    if (!extension.isEnabled(this)) {
      return;
    }

    const attributeManager = this.getAttributeManager();

    if (extension.opts.pattern) {
      attributeManager!.add({
        fillPatternFrames: {
          size: 4,
          stepMode: 'dynamic',
          accessor: 'getFillPattern',
          transform: extension.getPatternFrame.bind(this)
        },
        fillPatternScales: {
          size: 1,
          stepMode: 'dynamic',
          accessor: 'getFillPatternScale',
          defaultValue: 1
        },
        fillPatternOffsets: {
          size: 2,
          stepMode: 'dynamic',
          accessor: 'getFillPatternOffset'
        }
      });
    }
    this.setState({
      emptyTexture: this.context.device.createTexture({
        data: new Uint8Array(4),
        width: 1,
        height: 1
      })
    });
  }

  updateState(
    this: Layer<FillStyleExtensionProps>,
    {props, oldProps}: UpdateParameters<Layer<FillStyleExtensionProps>>,
    extension: this
  ) {
    if (!extension.isEnabled(this)) {
      return;
    }

    if (props.fillPatternMapping && props.fillPatternMapping !== oldProps.fillPatternMapping) {
      this.getAttributeManager()!.invalidate('getFillPattern');
    }
  }

  draw(this: Layer<FillStyleExtensionProps>, params: any, extension: this) {
    if (!extension.isEnabled(this)) {
      return;
    }

    const {fillPatternAtlas, fillPatternEnabled, fillPatternMask} = this.props;
    const fillProps: FillStyleModuleProps = {
      project: params.shaderModuleProps.project,
      fillPatternEnabled,
      fillPatternMask,
      fillPatternTexture: (fillPatternAtlas || this.state.emptyTexture) as Texture
    };
    this.setShaderModuleProps({fill: fillProps});
  }

  finalizeState(this: Layer<FillStyleExtensionProps>) {
    const emptyTexture = this.state.emptyTexture as Texture;
    emptyTexture?.delete();
  }

  getPatternFrame(this: Layer<FillStyleExtensionProps>, name: string) {
    const {fillPatternMapping} = this.getCurrentLayer()!.props;
    const def = fillPatternMapping && fillPatternMapping[name];
    return def ? [def.x, def.y, def.width, def.height] : [0, 0, 0, 0];
  }
}
