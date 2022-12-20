import {LayerExtension} from '@deck.gl/core';
import {Texture2D} from '@luma.gl/webgl-legacy';
import GL from '@luma.gl/constants';

import {patternShaders} from './shaders.glsl';

import type {
  Layer,
  LayerContext,
  Accessor,
  AccessorFunction,
  Texture,
  UpdateParameters
} from '@deck.gl/core';

const defaultProps = {
  fillPatternEnabled: true,
  fillPatternAtlas: null,
  fillPatternMapping: null,
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
  fillPatternAtlas?: Texture;
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

type FillStyleExtensionOptions = {
  /** If `true`, adds the ability to tile the filled area with a pattern.
   * @default false
   */
  pattern: boolean;
};

const DEFAULT_TEXTURE_PARAMETERS = {
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
  // GL.LINEAR is the default value but explicitly set it here
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  // for texture boundary artifact
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
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
      attributeManager.add({
        fillPatternFrames: {
          size: 4,
          accessor: 'getFillPattern',
          transform: extension.getPatternFrame.bind(this),
          shaderAttributes: {
            fillPatternFrames: {
              divisor: 0
            },
            instanceFillPatternFrames: {
              divisor: 1
            }
          }
        },
        fillPatternScales: {
          size: 1,
          accessor: 'getFillPatternScale',
          defaultValue: 1,
          shaderAttributes: {
            fillPatternScales: {
              divisor: 0
            },
            instanceFillPatternScales: {
              divisor: 1
            }
          }
        },
        fillPatternOffsets: {
          size: 2,
          accessor: 'getFillPatternOffset',
          shaderAttributes: {
            fillPatternOffsets: {
              divisor: 0
            },
            instanceFillPatternOffsets: {
              divisor: 1
            }
          }
        }
      });
    }
    this.setState({
      emptyTexture: new Texture2D(this.context.gl, {
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

    if (props.fillPatternAtlas && props.fillPatternAtlas !== oldProps.fillPatternAtlas) {
      extension.loadPatternAtlas.call(this);
    }
    if (props.fillPatternMapping && props.fillPatternMapping !== oldProps.fillPatternMapping) {
      extension.loadPatternMapping.call(this);
    }
  }

  draw(this: Layer<FillStyleExtensionProps>, params: any, extension: this) {
    if (!extension.isEnabled(this)) {
      return;
    }

    const {patternTexture} = this.state;
    this.setModuleParameters({
      fillPatternTexture: patternTexture || this.state.emptyTexture
    });
  }

  finalizeState(this: Layer<FillStyleExtensionProps>) {
    const {patternTexture, emptyTexture} = this.state;
    patternTexture?.destroy();
    emptyTexture?.destroy();
  }

  async loadPatternAtlas(this: Layer<FillStyleExtensionProps>) {
    const {fillPatternAtlas, fetch} = this.props;
    this.state.patternTexture?.destroy();
    this.setState({patternTexture: null});
    let image = fillPatternAtlas;
    if (typeof image === 'string') {
      image = await fetch(image, {propName: 'fillPatternAtlas', layer: this});
    }
    const patternTexture =
      image instanceof Texture2D
        ? image
        : new Texture2D(this.context.device, {
            // @ts-expect-error
            data: image,
            parameters: DEFAULT_TEXTURE_PARAMETERS
          });
    this.setState({patternTexture});
  }

  async loadPatternMapping(this: Layer<FillStyleExtensionProps>) {
    const {fillPatternMapping, fetch} = this.props;
    this.setState({patternMapping: null});
    let patternMapping = fillPatternMapping;
    if (typeof patternMapping === 'string') {
      patternMapping = await fetch(patternMapping, {
        propName: 'fillPatternMapping',
        layer: this
      });
    }
    this.setState({patternMapping});
    this.getAttributeManager()!.invalidate('getFillPattern');
    this.setNeedsUpdate();
  }

  getPatternFrame(this: Layer<FillStyleExtensionProps>, name: string) {
    const {patternMapping} = this.state;
    const def = patternMapping && patternMapping[name];
    return def ? [def.x, def.y, def.width, def.height] : [0, 0, 0, 0];
  }
}
