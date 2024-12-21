// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer, project32, picking, log, UNIT} from '@deck.gl/core';
import {SamplerProps, Texture} from '@luma.gl/core';
import {Model, Geometry} from '@luma.gl/engine';

import {iconUniforms, IconProps} from './icon-layer-uniforms';
import vs from './icon-layer-vertex.glsl';
import fs from './icon-layer-fragment.glsl';
import IconManager from './icon-manager';

import type {
  LayerProps,
  LayerDataSource,
  Accessor,
  AccessorFunction,
  Position,
  Color,
  Unit,
  UpdateParameters,
  LayerContext,
  DefaultProps
} from '@deck.gl/core';

import type {UnpackedIcon, IconMapping, LoadIconErrorContext} from './icon-manager';

type _IconLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /** A prepacked image that contains all icons. */
  iconAtlas?: string | Texture;
  /** Icon names mapped to icon definitions, or a URL to load such mapping from a JSON file. */
  iconMapping?: string | IconMapping;

  /** Icon size multiplier.
   * @default 1
   */
  sizeScale?: number;
  /**
   * The units of the icon size, one of `meters`, `common`, and `pixels`.
   *
   * @default 'pixels'
   */
  sizeUnits?: Unit;
  /**
   * The minimum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too small when zoomed out.
   */
  sizeMinPixels?: number;
  /**
   * The maximum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too big when zoomed in.
   */
  sizeMaxPixels?: number;
  /** If `true`, the icon always faces camera. Otherwise the icon faces up (z)
   * @default true
   */
  billboard?: boolean;
  /**
   * Discard pixels whose opacity is below this threshold.
   * A discarded pixel would create a "hole" in the icon that is not considered part of the object.
   * @default 0.05
   */
  alphaCutoff?: number;

  /** Anchor position accessor. */
  getPosition?: Accessor<DataT, Position>;
  /** Icon definition accessor.
   * Should return the icon id if using pre-packed icons (`iconAtlas` + `iconMapping`).
   * Return an object that defines the icon if using auto-packing.
   */
  getIcon?: AccessorFunction<DataT, string> | AccessorFunction<DataT, UnpackedIcon>;
  /** Icon color accessor.
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color>;
  /** Icon size accessor.
   * @default 1
   */
  getSize?: Accessor<DataT, number>;
  /** Icon rotation accessor, in degrees.
   * @default 0
   */
  getAngle?: Accessor<DataT, number>;
  /**
   * Icon offsest accessor, in pixels.
   * @default [0, 0]
   */
  getPixelOffset?: Accessor<DataT, [number, number]>;
  /**
   * Callback called if the attempt to fetch an icon returned by `getIcon` fails.
   */
  onIconError?: ((context: LoadIconErrorContext) => void) | null;

  /** Customize the [texture parameters](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter). */
  textureParameters?: SamplerProps | null;
};

export type IconLayerProps<DataT = unknown> = _IconLayerProps<DataT> & LayerProps;

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

const defaultProps: DefaultProps<IconLayerProps> = {
  iconAtlas: {type: 'image', value: null, async: true},
  iconMapping: {type: 'object', value: {}, async: true},
  sizeScale: {type: 'number', value: 1, min: 0},
  billboard: true,
  sizeUnits: 'pixels',
  sizeMinPixels: {type: 'number', min: 0, value: 0}, //  min point radius in pixels
  sizeMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER}, // max point radius in pixels
  alphaCutoff: {type: 'number', value: 0.05, min: 0, max: 1},

  getPosition: {type: 'accessor', value: (x: any) => x.position},
  getIcon: {type: 'accessor', value: (x: any) => x.icon},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getSize: {type: 'accessor', value: 1},
  getAngle: {type: 'accessor', value: 0},
  getPixelOffset: {type: 'accessor', value: [0, 0]},

  onIconError: {type: 'function', value: null, optional: true},

  textureParameters: {type: 'object', ignore: true, value: null}
};

/** Render raster icons at given coordinates. */
export default class IconLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_IconLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName = 'IconLayer';

  state!: {
    model?: Model;
    iconManager: IconManager;
  };

  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking, iconUniforms]});
  }

  initializeState() {
    this.state = {
      iconManager: new IconManager(this.context.device, {
        onUpdate: this._onUpdate.bind(this),
        onError: this._onError.bind(this)
      })
    };

    const attributeManager = this.getAttributeManager();
    /* eslint-disable max-len */
    attributeManager!.addInstanced({
      instancePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getPosition'
      },
      instanceSizes: {
        size: 1,
        transition: true,
        accessor: 'getSize',
        defaultValue: 1
      },
      instanceOffsets: {
        size: 2,
        accessor: 'getIcon',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        transform: this.getInstanceOffset
      },
      instanceIconFrames: {
        size: 4,
        accessor: 'getIcon',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        transform: this.getInstanceIconFrame
      },
      instanceColorModes: {
        size: 1,
        type: 'uint8',
        accessor: 'getIcon',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        transform: this.getInstanceColorMode
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        transition: true,
        accessor: 'getColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceAngles: {
        size: 1,
        transition: true,
        accessor: 'getAngle'
      },
      instancePixelOffset: {
        size: 2,
        transition: true,
        accessor: 'getPixelOffset'
      }
    });
    /* eslint-enable max-len */
  }

  /* eslint-disable max-statements, complexity */
  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    const {props, oldProps, changeFlags} = params;

    const attributeManager = this.getAttributeManager();
    const {iconAtlas, iconMapping, data, getIcon, textureParameters} = props;
    const {iconManager} = this.state;

    if (typeof iconAtlas === 'string') {
      return;
    }

    // internalState is always defined during updateState
    const prePacked = iconAtlas || this.internalState!.isAsyncPropLoading('iconAtlas');
    iconManager.setProps({
      loadOptions: props.loadOptions,
      autoPacking: !prePacked,
      iconAtlas,
      iconMapping: prePacked ? (iconMapping as IconMapping) : null,
      textureParameters
    });

    // prepacked iconAtlas from user
    if (prePacked) {
      if (oldProps.iconMapping !== props.iconMapping) {
        attributeManager!.invalidate('getIcon');
      }
    } else if (
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getIcon))
    ) {
      // Auto packing - getIcon is expected to return an object
      iconManager.packIcons(data, getIcon as AccessorFunction<any, UnpackedIcon>);
    }

    if (changeFlags.extensionsChanged) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
      attributeManager!.invalidateAll();
    }
  }
  /* eslint-enable max-statements, complexity */

  get isLoaded(): boolean {
    return super.isLoaded && this.state.iconManager.isLoaded;
  }

  finalizeState(context: LayerContext): void {
    super.finalizeState(context);
    // Release resources held by the icon manager
    this.state.iconManager.finalize();
  }

  draw({uniforms}): void {
    const {sizeScale, sizeMinPixels, sizeMaxPixels, sizeUnits, billboard, alphaCutoff} = this.props;
    const {iconManager} = this.state;

    const iconsTexture = iconManager.getTexture();
    if (iconsTexture) {
      const model = this.state.model!;
      const iconProps: IconProps = {
        iconsTexture,
        iconsTextureDim: [iconsTexture.width, iconsTexture.height],
        sizeUnits: UNIT[sizeUnits],
        sizeScale,
        sizeMinPixels,
        sizeMaxPixels,
        billboard,
        alphaCutoff
      };

      model.shaderInputs.setProps({icon: iconProps});
      model.draw(this.context.renderPass);
    }
  }

  protected _getModel(): Model {
    // The icon-layer vertex shader uses 2d positions
    // specifed via: in vec2 positions;
    const positions = [-1, -1, 1, -1, -1, 1, 1, 1];

    return new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      geometry: new Geometry({
        topology: 'triangle-strip',
        attributes: {
          // The size must be explicitly passed here otherwise luma.gl
          // will default to assuming that positions are 3D (x,y,z)
          positions: {
            size: 2,
            value: new Float32Array(positions)
          }
        }
      }),
      isInstanced: true
    });
  }

  private _onUpdate(): void {
    this.setNeedsRedraw();
  }

  private _onError(evt: LoadIconErrorContext): void {
    const onIconError = this.getCurrentLayer()?.props.onIconError;
    if (onIconError) {
      onIconError(evt);
    } else {
      log.error(evt.error.message)();
    }
  }

  protected getInstanceOffset(icon: string): number[] {
    const {
      width,
      height,
      anchorX = width / 2,
      anchorY = height / 2
    } = this.state.iconManager.getIconMapping(icon);
    return [width / 2 - anchorX, height / 2 - anchorY];
  }

  protected getInstanceColorMode(icon: string): number {
    const mapping = this.state.iconManager.getIconMapping(icon);
    return mapping.mask ? 1 : 0;
  }

  protected getInstanceIconFrame(icon: string): number[] {
    const {x, y, width, height} = this.state.iconManager.getIconMapping(icon);
    return [x, y, width, height];
  }
}
