// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {LayerExtension} from '@deck.gl/core';

import {FillStyleModuleProps, patternShaders} from './shader-module';
import {
  packProceduralPatterns,
  PROCEDURAL_PATTERN_TEXTURE_FORMAT,
  type ProceduralPatternMapping
} from './procedural-pattern';

import type {
  Layer,
  LayerContext,
  Color,
  DefaultProps,
  Accessor,
  AccessorFunction,
  TextureSource,
  Unit,
  UpdateParameters
} from '@deck.gl/core';
import type {Texture} from '@luma.gl/core';

function leastCommonMultiple(a: number, b: number): number {
  if (!Number.isInteger(b) || b <= 0) return 0;
  if (a === 0) return b;
  let [x, y] = [a, b];
  while (y > 0) [x, y] = [y, x % y];
  return (a / x) * b;
}

const defaultProps: DefaultProps<FillStyleExtensionProps> = {
  fillPatternEnabled: true,
  fillPatternAtlas: {
    type: 'image',
    value: null,
    async: true
  },
  fillPatternMapping: {type: 'object', value: {}, async: true},
  fillPatternMask: true,
  fillPatternSizeUnits: 'meters',
  getFillPattern: {type: 'accessor', value: d => d.pattern},
  getFillPatternScale: {type: 'accessor', value: 1},
  getFillPatternOffset: {type: 'accessor', value: [0, 0]},
  getFillPatternBackgroundColor: {type: 'accessor', value: [0, 0, 0, 0]}
};

export type FillStyleExtensionProps<DataT = any> = {
  /** Cheap toggle to enable/disable pattern fill. Requires the `pattern` option to be on.
   * @default true
   */
  fillPatternEnabled?: boolean;
  /** Sprite image url or texture that packs all your patterns into one layout. Ignored for procedural patterns. */
  fillPatternAtlas?: string | TextureSource;
  /** Pattern names mapped to atlas frames or procedural definitions, or a URL to a JSON file. */
  fillPatternMapping?:
    | string
    | ProceduralPatternMapping
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
  /**
   * The units of the pattern size, one of `'meters'`, `'common'` and `'pixels'`. A 24 x 24 pixel
   * pattern at scale `1` covers 24 units of the chosen unit.
   *
   * With `'meters'` (the default) the pattern is anchored to the ground and zooms with the map.
   * With `'pixels'` it keeps a constant size on screen instead, re-anchored at each integer zoom
   * level so that the tiling is stable while zooming within a level.
   * @default 'meters'
   */
  fillPatternSizeUnits?: Unit;
  /** Accessor for the name of the pattern. */
  getFillPattern?: AccessorFunction<DataT, string>;
  /** Accessor for the scale of the pattern, relative to its dimensions in `fillPatternSizeUnits`.
   * @default 1
   */
  getFillPatternScale?: Accessor<DataT, number>;
  /**
   * Accessor for the offset of the pattern, relative to the original size. Offset `[0.5, 0.5]` shifts the pattern alignment by half.
   * @default [0, 0]
   */
  getFillPatternOffset?: Accessor<DataT, Readonly<[number, number]>>;
  /**
   * Accessor for the color filled behind the pattern. The pattern is composited on top of it, so
   * the background is visible wherever the pattern is transparent. Fully transparent by default,
   * which leaves the area behind the pattern unfilled.
   * @default [0, 0, 0, 0]
   */
  getFillPatternBackgroundColor?: Accessor<DataT, Color>;
};

export type FillStyleExtensionOptions = {
  /** If `true`, adds the ability to tile the filled area with a pattern.
   * @default false
   */
  pattern: boolean;
  /** If `true`, generates patterns in the fragment shader instead of sampling an image atlas.
   * @default false
   */
  proceduralPattern: boolean;
};

/** Adds selected features to layers that render a "fill", such as the `PolygonLayer` and `ScatterplotLayer`. */
export default class FillStyleExtension extends LayerExtension<FillStyleExtensionOptions> {
  static defaultProps = defaultProps;
  static extensionName = 'FillStyleExtension';

  constructor({
    pattern = false,
    proceduralPattern = false
  }: Partial<FillStyleExtensionOptions> = {}) {
    super({pattern: pattern || proceduralPattern, proceduralPattern});
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
          transform: extension.opts.proceduralPattern
            ? extension.getProceduralPatternIndex.bind(this)
            : extension.getPatternFrame.bind(this)
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
        },
        fillPatternBackgroundColors: {
          size: 4,
          type: 'unorm8',
          stepMode: 'dynamic',
          accessor: 'getFillPatternBackgroundColor',
          defaultValue: [0, 0, 0, 255]
        }
      });
    }
    this.setState({
      emptyTexture: this.context.device.createTexture({
        data: new Uint8Array(4),
        width: 1,
        height: 1
      }),
      ...(extension.opts.proceduralPattern &&
        extension.createProceduralPatternTexture.call(this, {}))
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
      if (extension.opts.proceduralPattern && typeof props.fillPatternMapping !== 'string') {
        const oldTexture = this.state.proceduralPatternTexture as Texture | undefined;
        this.setState(
          extension.createProceduralPatternTexture.call(
            this,
            props.fillPatternMapping as ProceduralPatternMapping
          )
        );
        oldTexture?.delete();
      }
      this.getAttributeManager()!.invalidate('getFillPattern');
    }

    if (
      props.fillPatternMapping !== oldProps.fillPatternMapping ||
      props.getFillPatternScale !== oldProps.getFillPatternScale
    ) {
      this.setState({commonFrame: extension.getCommonFrame(props)});
    }
  }

  draw(this: Layer<FillStyleExtensionProps>, params: any, extension: this) {
    if (!extension.isEnabled(this)) {
      return;
    }

    const {fillPatternAtlas, fillPatternEnabled, fillPatternMask, fillPatternSizeUnits} =
      this.props;
    const fillProps: FillStyleModuleProps = {
      project: params.shaderModuleProps.project,
      fillPatternEnabled,
      fillPatternMask,
      fillPatternSizeUnits,
      procedural: extension.opts.proceduralPattern,
      fillPatternTexture: (extension.opts.proceduralPattern
        ? this.state.proceduralPatternTexture || this.state.emptyTexture
        : fillPatternAtlas || this.state.emptyTexture) as Texture,
      fillPatternCommonFrame: this.state.commonFrame as [number, number] | null
    };
    this.setShaderModuleProps({fill: fillProps});
  }

  finalizeState(this: Layer<FillStyleExtensionProps>) {
    const emptyTexture = this.state.emptyTexture as Texture;
    emptyTexture?.delete();
    const proceduralPatternTexture = this.state.proceduralPatternTexture as Texture;
    proceduralPatternTexture?.delete();
  }

  getPatternFrame(this: Layer<FillStyleExtensionProps>, name: string) {
    const {fillPatternMapping} = this.getCurrentLayer()!.props;
    const def = fillPatternMapping && fillPatternMapping[name];
    return def && 'x' in def ? [def.x, def.y, def.width, def.height] : [0, 0, 0, 0];
  }

  /**
   * Returns common frame into which all patterns fit as integer multiples
   */
  getCommonFrame(props: FillStyleExtensionProps): [number, number] | null {
    const {fillPatternMapping, getFillPatternScale: scale} = props;
    if (typeof scale !== 'number' || !(scale > 0) || typeof fillPatternMapping !== 'object') {
      return null;
    }
    let width = 0;
    let height = 0;
    for (const name in fillPatternMapping) {
      const frame = fillPatternMapping[name];
      // Procedural definitions do not have atlas dimensions and do not need origin reduction here.
      if (!('width' in frame)) return null;
      width = leastCommonMultiple(width, frame.width);
      height = leastCommonMultiple(height, frame.height);
      if (!width || !height) return null;
    }
    return width ? [scale * width, scale * height] : null;
  }

  getProceduralPatternIndex(this: Layer<FillStyleExtensionProps>, name: string) {
    const patternIndices = this.state.proceduralPatternIndices as
      | ReadonlyMap<string, number>
      | undefined;
    return [patternIndices?.get(name) ?? 0, 0, 0, 0];
  }

  createProceduralPatternTexture(
    this: Layer<FillStyleExtensionProps>,
    mapping: ProceduralPatternMapping
  ) {
    const packedPatterns = packProceduralPatterns(mapping);
    return {
      proceduralPatternIndices: packedPatterns.patternIndices,
      proceduralPatternTexture: this.context.device.createTexture({
        data: packedPatterns.data,
        width: packedPatterns.width,
        height: packedPatterns.height,
        format: PROCEDURAL_PATTERN_TEXTURE_FORMAT,
        sampler: {minFilter: 'nearest', magFilter: 'nearest'}
      })
    };
  }
}
