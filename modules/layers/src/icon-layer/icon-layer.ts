// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  color,
  project32,
  picking,
  log,
  UNIT,
  _LayerColumns as LayerColumns,
  type _ColumnDefinition as ColumnDefinition,
  _GPUVectorModel as GPUVectorModel
} from '@deck.gl/core';
import {SamplerProps, Texture} from '@luma.gl/core';
import {
  type Model,
  Geometry,
  GPUVectorModel as ArrowModel,
  makeGPUVectorGeometry,
  type GPUVectorGeometry
} from '@luma.gl/engine';

import {iconUniforms, IconProps} from './icon-layer-uniforms';
import vs from './icon-layer-vertex.glsl';
import fs from './icon-layer-fragment.glsl';
import {getShaderWGSL} from './icon-layer.wgsl';
import IconManager from './icon-manager';
import type {ColumnSource} from '@deck.gl/core/arrow';

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
  DefaultProps,
  GetPickingInfoParams,
  PickingInfo
} from '@deck.gl/core';

import type {UnpackedIcon, IconMapping, LoadIconErrorContext} from './icon-manager';

type _IconLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /** Arrow column overriding `getPosition`. */
  positions?: ColumnSource | null;
  /** Arrow column overriding `getSize`. */
  sizes?: ColumnSource | null;
  /** Arrow column overriding `getColor`. */
  colors?: ColumnSource | null;
  /** Arrow column overriding `getAngle`. */
  angles?: ColumnSource | null;
  /** Arrow column overriding `getPixelOffset`. */
  pixelOffsets?: ColumnSource | null;
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
   * The dimension to scale the image
   */
  sizeBasis?: 'height' | 'width';
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
  getPixelOffset?: Accessor<DataT, Readonly<[number, number]>>;
  /**
   * Callback called if the attempt to fetch an icon returned by `getIcon` fails.
   */
  onIconError?: ((context: LoadIconErrorContext) => void) | null;

  /** Customize the [texture parameters](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter). */
  textureParameters?: SamplerProps | null;
};

export type IconLayerProps<DataT = unknown> = _IconLayerProps<DataT> & LayerProps;

const DEFAULT_COLOR = [0, 0, 0, 255] as const;

const COLUMN_DEFINITIONS: Record<string, ColumnDefinition> = {
  positions: {
    attribute: 'instancePositions',
    accessor: 'getPosition',
    semantic: 'position',
    size: 3
  },
  sizes: {
    attribute: 'instanceSizes',
    accessor: 'getSize',
    semantic: 'scalar',
    size: 1,
    defaultValue: 1
  },
  colors: {attribute: 'instanceColors', accessor: 'getColor', semantic: 'color', size: 4},
  angles: {attribute: 'instanceAngles', accessor: 'getAngle', semantic: 'scalar', size: 1},
  pixelOffsets: {
    attribute: 'instancePixelOffset',
    accessor: 'getPixelOffset',
    semantic: 'vector',
    size: 2
  },
  iconOffset: {
    attribute: 'instanceOffsets',
    accessor: 'iconOffset',
    semantic: 'vector',
    size: 2,
    prop: false
  },
  iconFrame: {
    attribute: 'instanceIconFrames',
    accessor: 'iconFrame',
    semantic: 'vector',
    size: 4,
    prop: false
  },
  iconMask: {
    attribute: 'instanceColorModes',
    accessor: 'iconMask',
    semantic: 'vector',
    size: 1,
    prop: false
  }
};

const defaultProps: DefaultProps<IconLayerProps> = {
  positions: {type: 'object', value: null, optional: true},
  sizes: {type: 'object', value: null, optional: true},
  colors: {type: 'object', value: null, optional: true},
  angles: {type: 'object', value: null, optional: true},
  pixelOffsets: {type: 'object', value: null, optional: true},
  iconAtlas: {type: 'image', value: null, async: true},
  iconMapping: {type: 'object', value: {}, async: true},
  sizeScale: {type: 'number', value: 1, min: 0},
  billboard: true,
  sizeUnits: 'pixels',
  sizeBasis: 'height',
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
    arrowModel?: ArrowModel;
    arrowGeometry?: GPUVectorGeometry;
    columns?: LayerColumns;
    iconDefinitionsDirty?: boolean;
    iconManager: IconManager;
  };

  getShaders() {
    const useRowIndexes =
      this.useSourceIndexes() || Boolean((this.props.data as any)?.attributes?.rowIndexes);
    return super.getShaders({
      vs,
      fs,
      source: getShaderWGSL(useRowIndexes, Boolean(this.state?.columns)),
      defines: useRowIndexes ? {USE_ROW_INDEXES: true} : {},
      modules: [project32, color, picking, iconUniforms]
    });
  }

  initializeState() {
    this.state = {
      iconManager: new IconManager(this.context.device, {
        onUpdate: this._onUpdate.bind(this),
        onError: this._onError.bind(this)
      })
    };

    this._initializeAttributes();
  }

  private _initializeAttributes(): void {
    const attributeManager = this.getAttributeManager();
    /* eslint-disable max-len */
    attributeManager!.addInstanced({
      instancePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        ...this.usePositionTransforms(),
        transition: true,
        accessor: 'getPosition'
      },
      instanceSizes: {
        size: 1,
        transition: true,
        bufferGroup: 'icon-instance-data',
        accessor: 'getSize',
        defaultValue: 1
      },
      instanceIconDefs: {
        size: 7,
        bufferGroup: 'icon-instance-data',
        accessor: 'getIcon',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        transform: this.getInstanceIconDef,
        shaderAttributes: {
          instanceOffsets: {
            size: 2,
            elementOffset: 0
          },
          instanceIconFrames: {
            size: 4,
            elementOffset: 2
          },
          instanceColorModes: {
            size: 1,
            elementOffset: 6
          }
        }
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        transition: true,
        bufferGroup: 'icon-instance-data',
        accessor: 'getColor',
        defaultValue: DEFAULT_COLOR
      },
      instanceAngles: {
        size: 1,
        transition: true,
        bufferGroup: 'icon-instance-data',
        accessor: 'getAngle'
      },
      instancePixelOffset: {
        size: 2,
        transition: true,
        bufferGroup: 'icon-instance-data',
        accessor: 'getPixelOffset'
      }
    });
    this._initializeRowIndexes();
    /* eslint-enable max-len */
  }

  /** Whether picking indices refer to rows wrapped by a composite layer. */
  protected useSourceIndexes(data = this.props.data): boolean {
    return !this.state?.columns && Boolean((data as any)[0]?.__source);
  }

  private _initializeRowIndexes(): void {
    const useSourceIndexes = this.useSourceIndexes();
    if (useSourceIndexes || (this.props.data as any)?.attributes?.rowIndexes) {
      this.getAttributeManager()!.addInstanced({
        rowIndexes: {
          size: 1,
          type: 'uint32',
          noAlloc: !useSourceIndexes,
          accessor: useSourceIndexes
            ? (object, {index}) => object.__source?.index ?? index
            : undefined
        }
      });
    }
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
        attributeManager?.invalidate('getIcon');
      }
    } else if (
      changeFlags.dataChanged ||
      props.iconAtlas !== oldProps.iconAtlas ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getIcon))
    ) {
      // Auto packing - getIcon is expected to return an object
      iconManager.packIcons(data, getIcon as AccessorFunction<any, UnpackedIcon>);
    }

    if (!this._updateColumnState(params)) {
      const sourceIndexesChanged =
        this.useSourceIndexes(data) !== this.useSourceIndexes(oldProps.data);
      if (sourceIndexesChanged) {
        attributeManager!.remove(['rowIndexes']);
        this._initializeRowIndexes();
      }
      if (changeFlags.extensionsChanged || sourceIndexesChanged) {
        this.state.model?.destroy();
        this.state.model = this._getModel();
        this.getAttributeManager()!.invalidateAll();
      }
    }
  }
  /* eslint-enable max-statements, complexity */

  /** Resolve a picked icon to its wrapped row before the composite layer unwraps it. */
  getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    const info = super.getPickingInfo(params);
    if (this.useSourceIndexes() && info.index >= 0) {
      info.object = (this.props.data as any[]).find(row => row.__source.index === info.index);
    }
    return info;
  }

  /** Disable every icon from a source row during multi-depth picking. */
  disablePickingIndex(objectIndex: number): void {
    if (this.useSourceIndexes()) {
      const data = this.props.data as any[];
      for (let index = 0; index < data.length; index++) {
        if (data[index].__source.index === objectIndex) {
          this._disablePickingIndex(index);
        }
      }
    } else {
      super.disablePickingIndex(objectIndex);
    }
  }

  /** Switches between Arrow and accessor models when column props change. */
  private _updateColumnState(params: UpdateParameters<this>): boolean {
    const hasColumns = Object.entries(COLUMN_DEFINITIONS).some(
      ([name, definition]) => definition.prop !== false && params.props[name]
    );
    if (hasColumns) {
      this._updateColumns(params);
      return true;
    }
    if (this.state.columns) {
      this._destroyColumns();
      this.internalState!.attributeManager = super._getAttributeManager();
      this._initializeAttributes();
      this.state.model = this._getModel();
      this.getAttributeManager()!.invalidateAll();
      return true;
    }
    return false;
  }

  /** Rebuilds atlas-derived columns when icon definitions or column inputs change. */
  private _updateColumns(params: UpdateParameters<this>): void {
    const {props, oldProps, changeFlags} = params;
    if (props.extensions.length || Object.keys(props.transitions || {}).length) {
      throw new Error('Icon Arrow columns do not support extensions or transitions');
    }
    const useRowIndexes = Boolean((props.data as any)?.attributes?.rowIndexes);
    if (
      !this.state.columns ||
      useRowIndexes !== Boolean((oldProps.data as any)?.attributes?.rowIndexes)
    ) {
      this._destroyColumns();
      this.state.model?.destroy();
      this.state.model = undefined;
      this.internalState!.attributeManager?.finalize();
      this.internalState!.attributeManager = null;
      const columns = new LayerColumns(this.context.device, COLUMN_DEFINITIONS, 'Icon', true);
      this.state.columns = columns;
      const geometry =
        this.context.device.type === 'webgl'
          ? makeGPUVectorGeometry(this.context.device, this._getGeometry())
          : undefined;
      this.state.arrowGeometry = geometry;
      this.state.arrowModel = new ArrowModel(this.context.device, {
        ...this.getShaders(),
        id: props.id,
        ...(geometry ? {geometry} : {topology: 'triangle-strip', vertexCount: 4}),
        bufferLayout: columns.getBufferLayouts(useRowIndexes),
        isInstanced: true,
        inferDrawCount: 'instance'
      });
    }
    type IconAccessor = AccessorFunction<DataT, string | UnpackedIcon>;
    const getDefinition = (row: DataT, info: Parameters<IconAccessor>[1]) =>
      this.getInstanceIconDef(props.getIcon(row, info));
    const accessors = {
      iconOffset: (row: DataT, info: Parameters<IconAccessor>[1]) =>
        getDefinition(row, info).slice(0, 2),
      iconFrame: (row: DataT, info: Parameters<IconAccessor>[1]) =>
        getDefinition(row, info).slice(2, 6),
      iconMask: (row: DataT, info: Parameters<IconAccessor>[1]) => getDefinition(row, info)[6]
    };
    void this.state.columns.updateIfNeeded(
      {
        props: Object.assign(Object.create(props), accessors),
        oldProps: Object.assign(Object.create(oldProps), accessors),
        changeFlags: {
          ...changeFlags,
          dataChanged:
            changeFlags.dataChanged ||
            (this.state.iconDefinitionsDirty || props.iconMapping !== oldProps.iconMapping
              ? 'icon definitions changed'
              : false)
        }
      },
      {
        dataLoading: this.internalState!.isAsyncPropLoading('data'),
        changed: () => {
          this.setState({});
          this.setNeedsUpdate();
        },
        failed: error => this.raiseError(error, 'converting Arrow columns'),
        positionOptions: {
          transform: this.usePositionTransforms().transform?.bind(this),
          fp64: this.use64bitPositions(),
          requireRows: true
        }
      }
    );
    this.state.iconDefinitionsDirty = false;
  }

  private _destroyColumns(): void {
    this.state.columns?.destroy();
    this.state.arrowModel?.destroy();
    this.state.arrowGeometry?.destroy();
    this.state.columns = undefined;
    this.state.arrowModel = undefined;
    this.state.arrowGeometry = undefined;
  }

  getModels(): ArrowModel[] {
    return this.state?.arrowModel ? [this.state.arrowModel] : super.getModels();
  }

  getBounds(): [number[], number[]] | null {
    return this.state?.columns ? this.state.columns.getBounds() : super.getBounds();
  }

  getNumInstances(): number {
    return this.state?.columns && !Number.isFinite(this.props.numInstances)
      ? this.state.columns.length
      : super.getNumInstances();
  }

  get isLoaded(): boolean {
    return super.isLoaded && this.state.iconManager.isLoaded && !this.state.columns?.loading;
  }

  finalizeState(context: LayerContext): void {
    this._destroyColumns();
    super.finalizeState(context);
    // Release resources held by the icon manager
    this.state.iconManager.finalize();
  }

  draw({uniforms}): void {
    this._drawModel(this.state.arrowModel ?? this.state.model!);
  }

  /** Draw one icon model with the current atlas and layer props. */
  protected _drawModel(model: ArrowModel): void {
    const {sizeScale, sizeBasis, sizeMinPixels, sizeMaxPixels, sizeUnits, billboard, alphaCutoff} =
      this.props;
    const {iconManager} = this.state;
    const iconsTexture = iconManager.getTexture();
    if (iconsTexture) {
      const iconProps: IconProps = {
        rowIndexOffset: 0,
        iconsTexture,
        iconsTextureDim: [iconsTexture.width, iconsTexture.height],
        sizeUnits: UNIT[sizeUnits],
        sizeScale,
        sizeBasis: sizeBasis === 'height' ? 1.0 : 0.0,
        sizeMinPixels,
        sizeMaxPixels,
        billboard,
        alphaCutoff
      };

      model.shaderInputs.setProps({icon: iconProps});
      if (this.state.columns) {
        this.state.columns.draw(model, this.context.renderPass, offset => {
          model.setInstanceCount(
            Math.min(model.instanceCount, Math.max(0, this.getNumInstances() - offset))
          );
          model.shaderInputs.setProps({icon: {rowIndexOffset: offset}});
        });
      } else {
        model.draw(this.context.renderPass);
      }
    }
  }

  private _getGeometry(): Geometry {
    // The icon-layer vertex shader uses 2d positions
    // specifed via: in vec2 positions;
    // Top row first: the shader flips y, so this order keeps the strip front-facing (counter-
    // clockwise) and it survives back-face culling, which GlobeView enables by default
    const positions = [-1, 1, 1, 1, -1, -1, 1, -1];

    return new Geometry({
      topology: 'triangle-strip',
      attributes: {positions: {size: 2, value: new Float32Array(positions)}}
    });
  }

  protected _getModel(id = this.props.id): Model {
    return new GPUVectorModel(this.context.device, {
      ...this.getShaders(),
      id,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      geometry: this._getGeometry(),
      isInstanced: true
    });
  }

  private _onUpdate(didFrameChange: boolean): void {
    if (didFrameChange) {
      this.state.iconDefinitionsDirty = true;
      this.getAttributeManager()?.invalidate('getIcon');
      this.setNeedsUpdate();
    } else {
      this.setNeedsRedraw();
    }
  }

  private _onError(evt: LoadIconErrorContext): void {
    const onIconError = this.getCurrentLayer()?.props.onIconError;
    if (onIconError) {
      onIconError(evt);
    } else {
      log.error(evt.error.message)();
    }
  }

  protected getInstanceIconDef(icon: string | UnpackedIcon): number[] {
    const {
      x,
      y,
      width,
      height,
      mask,
      anchorX = width / 2,
      anchorY = height / 2
    } = this.state.iconManager.getIconMapping(icon);

    return [width / 2 - anchorX, height / 2 - anchorY, x, y, width, height, mask ? 1 : 0];
  }
}
