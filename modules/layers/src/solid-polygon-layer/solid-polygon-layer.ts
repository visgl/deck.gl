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

import {Layer, project32, gouraudLighting, picking, COORDINATE_SYSTEM} from '@deck.gl/core';
import {Model, Geometry} from '@luma.gl/engine';
import {GL} from '@luma.gl/constants';

// Polygon geometry generation is managed by the polygon tesselator
import PolygonTesselator from './polygon-tesselator';

import vsTop from './solid-polygon-layer-vertex-top.glsl';
import vsSide from './solid-polygon-layer-vertex-side.glsl';
import fs from './solid-polygon-layer-fragment.glsl';

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
export type SolidPolygonLayerProps<DataT = any> = _SolidPolygonLayerProps<DataT> & LayerProps;

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

const defaultProps: DefaultProps<SolidPolygonLayerProps> = {
  filled: true,
  extruded: false,
  wireframe: false,
  _normalize: true,
  _windingOrder: 'CW',
  _full3d: false,

  elevationScale: {type: 'number', min: 0, value: 1},

  getPolygon: {type: 'accessor', value: f => f.polygon},
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
    strokeModel?: Model;
    models?: Model[];
    numInstances: number;
    polygonTesselator: PolygonTesselator;
  };

  getShaders(type) {
    return super.getShaders({
      vs: type === 'top' ? vsTop : vsSide,
      fs,
      defines: {
        RING_WINDING_ORDER_CW: !this.props._normalize && this.props._windingOrder === 'CCW' ? 0 : 1
      },
      modules: [project32, gouraudLighting, picking]
    });
  }

  get wrapLongitude(): boolean {
    return false;
  }

  initializeState() {
    const {device, viewport} = this.context;
    let {coordinateSystem} = this.props;
    const {_full3d} = this.props;
    if (viewport.isGeospatial && coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
      coordinateSystem = COORDINATE_SYSTEM.LNGLAT;
    }

    let preproject: ((xy: number[]) => number[]) | undefined;

    if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
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
        IndexType: !device || device.features.has('index-uint32-webgl1') ? Uint32Array : Uint16Array
      })
    });

    const attributeManager = this.getAttributeManager()!;
    const noAlloc = true;

    attributeManager.remove(['instancePickingColors']);

    /* eslint-disable max-len */
    attributeManager.add({
      indices: {
        size: 1,
        isIndexed: true,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateIndices,
        noAlloc
      },
      positions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getPolygon',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculatePositions,
        noAlloc,
        shaderAttributes: {
          positions: {
            vertexOffset: 0,
            divisor: 0
          },
          instancePositions: {
            vertexOffset: 0,
            divisor: 1
          },
          instanceNextPositions: {
            vertexOffset: 1,
            divisor: 1
          }
        }
      },
      instanceVertexValid: {
        size: 1,
        divisor: 1,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateVertexValid,
        noAlloc
      },
      elevations: {
        size: 1,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getElevation',
        shaderAttributes: {
          elevations: {
            divisor: 0
          },
          instanceElevations: {
            divisor: 1
          }
        }
      },
      fillColors: {
        size: this.props.colorFormat.length,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getFillColor',
        defaultValue: DEFAULT_COLOR,
        shaderAttributes: {
          instanceFillColors: {
            divisor: 1
          }
        }
      },
      lineColors: {
        size: this.props.colorFormat.length,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getLineColor',
        defaultValue: DEFAULT_COLOR,
        shaderAttributes: {
          instanceLineColors: {
            divisor: 1
          }
        }
      },
      pickingColors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        accessor: (object, {index, target: value}) =>
          this.encodePickingColor(object && object.__source ? object.__source.index : index, value),
        shaderAttributes: {
          instancePickingColors: {
            divisor: 1
          }
        }
      }
    });
    /* eslint-enable max-len */
  }

  getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    const info = super.getPickingInfo(params);
    const {index} = info;
    const {data} = this.props;

    // Check if data comes from a composite layer, wrapped with getSubLayerRow
    if (data[0] && data[0].__source) {
      // index decoded from picking color refers to the source index
      info.object = (data as any[]).find(d => d.__source.index === index);
    }
    return info;
  }

  disablePickingIndex(objectIndex: number) {
    const {data} = this.props;

    // Check if data comes from a composite layer, wrapped with getSubLayerRow
    if (data[0] && data[0].__source) {
      // index decoded from picking color refers to the source index
      for (let i = 0; i < (data as any[]).length; i++) {
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
    const {topModel, sideModel, strokeModel, polygonTesselator} = this.state;

    const renderUniforms = {
      ...uniforms,
      extruded: Boolean(extruded),
      elevationScale
    };

    // Note - the order is important
    if (strokeModel && wireframe) {
      strokeModel.instanceCount = polygonTesselator.instanceCount - 1;
      strokeModel.setUniforms(renderUniforms);
      strokeModel.draw(this.context.renderPass);
    }

    if (sideModel && filled) {
      sideModel.instanceCount = polygonTesselator.instanceCount - 1;
      sideModel.setUniforms(renderUniforms);
      sideModel.draw(this.context.renderPass);
    }

    if (topModel && filled) {
      topModel.vertexCount = polygonTesselator.vertexCount;
      topModel.setUniforms(renderUniforms);
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
      attributeManager.invalidateAll();
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
        buffers,
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
    let strokeModel;

    const bufferLayout = this.getAttributeManager().getBufferLayouts();

    if (filled) {
      const shaders = this.getShaders('top');
      shaders.defines.NON_INSTANCED_MODEL = 1;

      topModel = new Model(this.context.device, {
        ...shaders,
        id: `${id}-top`,
        topology: 'triangle-list',
        uniforms: {
          isWireframe: false
        },
        bufferLayout,
        isIndexed: true,
        userData: {
          excludeAttributes: {instanceVertexValid: true}
        }
      });

      topModel.setConstantAttributes({
        vertexPositions: new Float32Array([0, 1])
      });
    }
    if (extruded) {
      sideModel = new Model(this.context.device, {
        ...this.getShaders('side'),
        id: `${id}-side`,
        bufferLayout,
        uniforms: {
          isWireframe: false
        },
        geometry: new Geometry({
          topology: 'triangle-strip',
          attributes: {
            // top right - top left - bottom right - bottom left
            vertexPositions: {
              size: 2,
              value: new Float32Array([1, 0, 0, 0, 1, 1, 0, 1])
            }
          }
        }),
        isInstanced: 1,
        userData: {
          excludeAttributes: {indices: true}
        }
      });

      strokeModel = new Model(this.context.device, {
        ...this.getShaders('side'),
        id: `${id}-stroke`,
        bufferLayout,
        uniforms: {
          isWireframe: true
        },
        geometry: new Geometry({
          topology: 'line-strip',
          attributes: {
            // top right - top left - bottom left - bottom right
            vertexPositions: {
              size: 2,
              value: new Float32Array([1, 0, 0, 0, 0, 1, 1, 1])
            }
          }
        }),
        isInstanced: 1,
        userData: {
          excludeAttributes: {indices: true}
        }
      });
    }

    return {
      models: [sideModel, strokeModel, topModel].filter(Boolean),
      topModel,
      sideModel,
      strokeModel
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
    attribute.value = polygonTesselator.get('positions');
  }

  protected calculateVertexValid(attribute) {
    attribute.value = this.state.polygonTesselator.get('vertexValid');
  }
}
