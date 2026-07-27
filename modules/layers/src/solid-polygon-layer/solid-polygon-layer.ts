// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer, color, project32, picking, gouraudMaterial} from '@deck.gl/core';
import {Model, Geometry} from '@luma.gl/engine';

// Polygon geometry generation is managed by the polygon tesselator
import PolygonTesselator from './polygon-tesselator';

import {solidPolygonUniforms, SolidPolygonProps} from './solid-polygon-layer-uniforms';
import vsTop from './solid-polygon-layer-vertex-top.glsl';
import vsSide from './solid-polygon-layer-vertex-side.glsl';
import fs from './solid-polygon-layer-fragment.glsl';
import {getSolidPolygonShaderWGSL} from './solid-polygon-layer.wgsl';

import type {
  LayerProps,
  LayerDataSource,
  Color,
  Material,
  Accessor,
  AccessorFunction,
  UpdateParameters,
  GetPickingInfoParams,
  PickingInfo,
  DefaultProps
} from '@deck.gl/core';
import type {PolygonGeometry} from './polygon';

type _SolidPolygonLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /** Whether to fill the polygons
   * @default true
   */
  filled?: boolean;
  /** Whether to extrude the polygons
   * @default false
   */
  extruded?: boolean;
  /** Whether to generate a line wireframe of the polygon.
   * @default false
   */
  wireframe?: boolean;
  /**
   * (Experimental) If `false`, will skip normalizing the coordinates returned by `getPolygon`.
   * @default true
   */
  _normalize?: boolean;
  /**
   * (Experimental) This prop is only effective with `_normalize: false`.
   * It specifies the winding order of rings in the polygon data, one of 'CW' (clockwise) and 'CCW' (counter-clockwise)
   */
  _windingOrder?: 'CW' | 'CCW';

  /**
   * (Experimental) This prop is only effective with `XYZ` data.
   * When true, polygon tesselation will be performed on the plane with the largest area, instead of the xy plane.
   * @default false
   */
  _full3d?: boolean;

  /** Elevation multiplier.
   * @default 1
   */
  elevationScale?: number;

  /** Polygon geometry accessor. */
  getPolygon?: AccessorFunction<DataT, PolygonGeometry>;
  /** Extrusion height accessor.
   * @default 1000
   */
  getElevation?: Accessor<DataT, number>;
  /** Fill color accessor.
   * @default [0, 0, 0, 255]
   */
  getFillColor?: Accessor<DataT, Color>;
  /** Stroke color accessor.
   * @default [0, 0, 0, 255]
   */
  getLineColor?: Accessor<DataT, Color>;

  /**
   * Material settings for lighting effect. Applies if `extruded: true`
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;
};

/** Render filled and/or extruded polygons. */
export type SolidPolygonLayerProps<DataT = unknown> = _SolidPolygonLayerProps<DataT> & LayerProps;

const DEFAULT_COLOR = [0, 0, 0, 255] as const;

const defaultProps: DefaultProps<SolidPolygonLayerProps> = {
  filled: true,
  extruded: false,
  wireframe: false,
  _normalize: true,
  _windingOrder: 'CW',
  _full3d: false,

  elevationScale: {type: 'number', min: 0, value: 1},

  getPolygon: {type: 'accessor', value: (f: any) => f.polygon},
  getElevation: {type: 'accessor', value: 1000},
  getFillColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineColor: {type: 'accessor', value: DEFAULT_COLOR},

  material: true
};

const ATTRIBUTE_TRANSITION = {
  enter: (value, chunk) => {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};

export default class SolidPolygonLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_SolidPolygonLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName = 'SolidPolygonLayer';

  state!: {
    topModel?: Model;
    sideModel?: Model;
    wireframeModel?: Model;
    models?: Model[];
    numInstances: number;
    polygonTesselator: PolygonTesselator;
  };

  getShaders(type) {
    const ringWindingOrderCW = !this.props._normalize && this.props._windingOrder === 'CCW' ? 0 : 1;

    return super.getShaders({
      vs: type === 'top' ? vsTop : vsSide,
      fs,
      source: getSolidPolygonShaderWGSL(type, Boolean(ringWindingOrderCW)),
      defines: {
        RING_WINDING_ORDER_CW: ringWindingOrderCW
      },
      modules: [project32, color, gouraudMaterial, picking, solidPolygonUniforms]
    });
  }

  get wrapLongitude(): boolean {
    return false;
  }

  getBounds(): [number[], number[]] | null {
    return this.getAttributeManager()?.getBounds(['vertexPositions']);
  }

  initializeState() {
    const {viewport} = this.context;
    let {coordinateSystem} = this.props;
    const {_full3d} = this.props;
    if (viewport.isGeospatial && coordinateSystem === 'default') {
      coordinateSystem = 'lnglat';
    }

    let preproject: ((xy: number[]) => number[]) | undefined;

    if (coordinateSystem === 'lnglat') {
      if (_full3d) {
        preproject = viewport.projectPosition.bind(viewport);
      } else {
        preproject = viewport.projectFlat.bind(viewport);
      }
    }

    this.setState({
      numInstances: 0,
      polygonTesselator: new PolygonTesselator({
        // Lnglat coordinates are usually projected non-linearly, which affects tesselation results
        // Provide a preproject function if the coordinates are in lnglat
        preproject,
        fp64: this.use64bitPositions(),
        IndexType: Uint32Array
      })
    });

    const attributeManager = this.getAttributeManager()!;
    const noAlloc = true;
    const isWebGPU = this.context.device.type === 'webgpu';

    /* eslint-disable max-len */
    attributeManager.add({
      indices: {
        size: 1,
        isIndexed: true,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateIndices,
        noAlloc
      },
      vertexPositions: {
        size: 3,
        type: 'float64',
        stepMode: 'dynamic',
        fp64: this.use64bitPositions(),
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getPolygon',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculatePositions,
        noAlloc,
        ...(isWebGPU
          ? {}
          : {
              shaderAttributes: {
                nextVertexPositions: {
                  vertexOffset: 1
                }
              }
            })
      },
      ...(isWebGPU
        ? {
            // WebGPU cannot express WebGL's one-vertex offset view in a buffer layout.
            nextVertexPositions: {
              size: 3,
              type: 'float64',
              stepMode: 'dynamic',
              fp64: this.use64bitPositions(),
              transition: false,
              // eslint-disable-next-line @typescript-eslint/unbound-method
              update: this.calculateNextPositions,
              noAlloc
            }
          }
        : {}),
      [isWebGPU ? 'vertexValid' : 'instanceVertexValid']: {
        size: 1,
        type: isWebGPU ? 'float32' : 'uint16',
        stepMode: 'instance',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateVertexValid,
        noAlloc
      },
      elevations: {
        size: 1,
        stepMode: 'dynamic',
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getElevation',
        bufferGroup: 'solid-polygon-instance-data'
      },
      fillColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        stepMode: 'dynamic',
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getFillColor',
        defaultValue: DEFAULT_COLOR,
        bufferGroup: 'solid-polygon-instance-data'
      },
      lineColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        stepMode: 'dynamic',
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getLineColor',
        defaultValue: DEFAULT_COLOR,
        bufferGroup: 'solid-polygon-instance-data'
      },
      /** Source polygon row, including __source.index for composite data. */
      rowIndexes: {
        size: 1,
        type: 'uint32',
        stepMode: 'dynamic',
        accessor: (object, {index}) => (object && object.__source ? object.__source.index : index),
        bufferGroup: 'solid-polygon-instance-data'
      }
    });
    /* eslint-enable max-len */
  }

  getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    const info = super.getPickingInfo(params);
    const {index} = info;
    const data = this.props.data as any[];

    // Check if data comes from a composite layer, wrapped with getSubLayerRow
    if (data[0] && data[0].__source) {
      // index decoded from picking color refers to the source index
      info.object = data.find(d => d.__source.index === index);
    }
    return info;
  }

  disablePickingIndex(objectIndex: number) {
    const data = this.props.data as any[];

    // Check if data comes from a composite layer, wrapped with getSubLayerRow
    if (data[0] && data[0].__source) {
      // index decoded from picking color refers to the source index
      for (let i = 0; i < data.length; i++) {
        if (data[i].__source.index === objectIndex) {
          this._disablePickingIndex(i);
        }
      }
    } else {
      super.disablePickingIndex(objectIndex);
    }
  }

  draw({uniforms}) {
    const {extruded, filled, wireframe, elevationScale} = this.props;
    const {topModel, sideModel, wireframeModel, polygonTesselator} = this.state;

    const renderUniforms: SolidPolygonProps = {
      extruded: Boolean(extruded),
      elevationScale,
      isWireframe: false
    };

    // Note - the order is important
    if (wireframeModel && wireframe) {
      wireframeModel.setInstanceCount(polygonTesselator.instanceCount - 1);
      wireframeModel.shaderInputs.setProps({solidPolygon: {...renderUniforms, isWireframe: true}});
      wireframeModel.draw(this.context.renderPass);
    }

    if (sideModel && filled) {
      sideModel.setInstanceCount(polygonTesselator.instanceCount - 1);
      sideModel.shaderInputs.setProps({solidPolygon: renderUniforms});
      sideModel.draw(this.context.renderPass);
    }

    if (topModel && filled) {
      topModel.setVertexCount(polygonTesselator.vertexCount);
      topModel.shaderInputs.setProps({solidPolygon: renderUniforms});
      topModel.draw(this.context.renderPass);
    }
  }

  updateState(updateParams: UpdateParameters<this>) {
    super.updateState(updateParams);

    this.updateGeometry(updateParams);

    const {props, oldProps, changeFlags} = updateParams;
    const attributeManager = this.getAttributeManager();

    const regenerateModels =
      changeFlags.extensionsChanged ||
      props.filled !== oldProps.filled ||
      props.extruded !== oldProps.extruded;

    if (regenerateModels) {
      this.state.models?.forEach(model => model.destroy());

      this.setState(this._getModels());
      attributeManager!.invalidateAll();
    }
  }

  protected updateGeometry({props, oldProps, changeFlags}: UpdateParameters<this>) {
    const geometryConfigChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon));

    // When the geometry config  or the data is changed,
    // tessellator needs to be invoked
    if (geometryConfigChanged) {
      const {polygonTesselator} = this.state;
      const buffers = (props.data as any).attributes || {};
      polygonTesselator.updateGeometry({
        data: props.data,
        normalize: props._normalize,
        geometryBuffer: buffers.getPolygon,
        // Keep derived WebGPU attributes independent of external binary accessor buffers.
        buffers: this.context.device.type === 'webgpu' ? {...buffers} : buffers,
        getGeometry: props.getPolygon,
        positionFormat: props.positionFormat,
        wrapLongitude: props.wrapLongitude,
        // TODO - move the flag out of the viewport
        resolution: this.context.viewport.resolution,
        fp64: this.use64bitPositions(),
        dataChanged: changeFlags.dataChanged,
        full3d: props._full3d
      });

      this.setState({
        numInstances: polygonTesselator.instanceCount,
        startIndices: polygonTesselator.vertexStarts
      });

      if (!changeFlags.dataChanged) {
        // Base `layer.updateState` only invalidates all attributes on data change
        // Cover the rest of the scenarios here
        this.getAttributeManager()!.invalidateAll();
      }
    }
  }

  protected _getModels() {
    const {id, filled, extruded} = this.props;

    let topModel;
    let sideModel;
    let wireframeModel;

    if (filled) {
      const shaders = this.getShaders('top');
      shaders.defines = {...shaders.defines, NON_INSTANCED_MODEL: 1};
      let bufferLayout = this.getAttributeManager()!.getBufferLayouts({isInstanced: false});
      if (this.context.device.type === 'webgpu') {
        // Indices are bound separately, and the top model does not bind side-only attributes.
        bufferLayout = bufferLayout.filter(
          layout =>
            layout.name !== 'indices' &&
            layout.name !== 'vertexValid' &&
            layout.name !== 'instanceVertexValid' &&
            layout.name !== 'nextVertexPositions'
        );
      }

      topModel = new Model(this.context.device, {
        ...shaders,
        id: `${id}-top`,
        topology: 'triangle-list',
        bufferLayout,
        isIndexed: true,
        userData: {
          excludeAttributes: {
            vertexValid: true,
            instanceVertexValid: true,
            nextVertexPositions: true
          }
        }
      });
    }
    if (extruded) {
      let bufferLayout = this.getAttributeManager()!.getBufferLayouts({isInstanced: true});
      if (this.context.device.type === 'webgpu') {
        // Indices are owned by the top model; WebGPU vertex layouts cannot include index buffers.
        bufferLayout = bufferLayout.filter(layout => layout.name !== 'indices');
      }

      sideModel = new Model(this.context.device, {
        ...this.getShaders('side'),
        id: `${id}-side`,
        bufferLayout,
        geometry: new Geometry({
          topology: 'triangle-strip',
          attributes: {
            // top right - top left - bottom right - bottom left
            positions: {
              size: 2,
              value: new Float32Array([1, 0, 0, 0, 1, 1, 0, 1])
            }
          }
        }),
        isInstanced: true,
        userData: {
          excludeAttributes: {indices: true}
        }
      });

      wireframeModel = new Model(this.context.device, {
        ...this.getShaders('side'),
        id: `${id}-wireframe`,
        bufferLayout,
        geometry: new Geometry({
          topology: 'line-strip',
          attributes: {
            // top right - top left - bottom left - bottom right
            positions: {
              size: 2,
              value: new Float32Array([1, 0, 0, 0, 0, 1, 1, 1])
            }
          }
        }),
        isInstanced: true,
        userData: {
          excludeAttributes: {indices: true}
        }
      });
    }

    return {
      models: [sideModel, wireframeModel, topModel].filter(Boolean),
      topModel,
      sideModel,
      wireframeModel
    };
  }

  protected calculateIndices(attribute) {
    const {polygonTesselator} = this.state;
    attribute.startIndices = polygonTesselator.indexStarts;
    attribute.value = polygonTesselator.get('indices');
  }

  protected calculatePositions(attribute) {
    const {polygonTesselator} = this.state;
    attribute.startIndices = polygonTesselator.vertexStarts;

    const binaryPositions = (this.props.data as any).attributes?.getPolygon;
    if (this.context.device.type === 'webgpu' && ArrayBuffer.isView(binaryPositions?.value)) {
      const {value, size = 3, offset = 0, stride} = binaryPositions;
      const elementOffset = offset / value.BYTES_PER_ELEMENT;
      const elementStride = stride ? stride / value.BYTES_PER_ELEMENT : size;
      const positions = new Float64Array(polygonTesselator.instanceCount * 3);

      for (let vertexIndex = 0; vertexIndex < polygonTesselator.instanceCount; vertexIndex++) {
        const sourceIndex = elementOffset + vertexIndex * elementStride;
        const targetIndex = vertexIndex * 3;
        positions[targetIndex] = value[sourceIndex];
        positions[targetIndex + 1] = value[sourceIndex + 1];
        positions[targetIndex + 2] = size > 2 ? value[sourceIndex + 2] : 0;
      }

      attribute.value = positions;
      return;
    }

    attribute.value = polygonTesselator.get('positions');
  }

  protected calculateVertexValid(attribute) {
    const binaryVertexValid = (this.props.data as any).attributes?.instanceVertexValid?.value;
    const vertexValid =
      this.context.device.type === 'webgpu' && binaryVertexValid
        ? binaryVertexValid
        : this.state.polygonTesselator.get('vertexValid');
    attribute.value =
      this.context.device.type === 'webgpu' && vertexValid
        ? Float32Array.from(vertexValid)
        : vertexValid;
  }

  protected calculateNextPositions(attribute) {
    const {polygonTesselator} = this.state;
    const attributes = this.getAttributeManager()!.getAttributes();
    const positions = attributes.vertexPositions.value;
    const vertexValid =
      (this.props.data as any).attributes?.instanceVertexValid?.value ||
      attributes.vertexValid?.value ||
      polygonTesselator.get('vertexValid');
    attribute.startIndices = polygonTesselator.vertexStarts;

    if (!positions) {
      attribute.value = positions;
      return;
    }

    const vertexCount = positions.length / 3;
    const nextPositions = new (positions.constructor as typeof Float32Array)(positions.length);
    for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
      const sourceIndex = vertexIndex * 3;
      const nextSourceIndex =
        vertexValid?.[vertexIndex] && vertexIndex + 1 < vertexCount ? sourceIndex + 3 : sourceIndex;
      for (let componentIndex = 0; componentIndex < 3; componentIndex++) {
        nextPositions[sourceIndex + componentIndex] = positions[nextSourceIndex + componentIndex];
      }
    }

    attribute.value = nextPositions;
  }
}
