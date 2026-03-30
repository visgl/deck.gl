// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer, color, project32, picking, COORDINATE_SYSTEM, createIterable} from '@deck.gl/core';
import {Model, Geometry} from '@luma.gl/engine';
import {gouraudMaterial} from '@luma.gl/shadertools';
import type {BufferLayout, Parameters} from '@luma.gl/core';

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

const APPLICATION_WGSL_BINDING_DECLARATIONS = [
  /@binding\(\s*(\d+)\s*\)\s*@group\(\s*(\d+)\s*\)\s*(var(?:<[^>]+>)?\s+([A-Za-z_][A-Za-z0-9_]*))/g,
  /@group\(\s*(\d+)\s*\)\s*@binding\(\s*(\d+)\s*\)\s*(var(?:<[^>]+>)?\s+([A-Za-z_][A-Za-z0-9_]*))/g
] as const;

const APPLICATION_WGSL_AUTO_BINDING_DECLARATIONS = [
  /@binding\(\s*auto\s*\)\s*@group\(\s*(\d+)\s*\)\s*(var(?:<[^>]+>)?\s+([A-Za-z_][A-Za-z0-9_]*))/g,
  /@group\(\s*(\d+)\s*\)\s*@binding\(\s*auto\s*\)\s*(var(?:<[^>]+>)?\s+([A-Za-z_][A-Za-z0-9_]*))/g
] as const;

function resolveApplicationWGSLBindings(source: string): string {
  const usedBindingsByGroup = new Map<number, Set<number>>();

  for (const regex of APPLICATION_WGSL_BINDING_DECLARATIONS) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(source))) {
      const isBindingFirst = regex === APPLICATION_WGSL_BINDING_DECLARATIONS[0];
      const group = Number(match[isBindingFirst ? 2 : 1]);
      const location = Number(match[isBindingFirst ? 1 : 2]);
      let usedBindings = usedBindingsByGroup.get(group);
      if (!usedBindings) {
        usedBindings = new Set();
        usedBindingsByGroup.set(group, usedBindings);
      }
      usedBindings.add(location);
    }
  }

  for (const regex of APPLICATION_WGSL_AUTO_BINDING_DECLARATIONS) {
    source = source.replace(regex, (...replaceArgs) => {
      const match = replaceArgs[0] as string;
      const isBindingFirst = regex === APPLICATION_WGSL_AUTO_BINDING_DECLARATIONS[0];
      const group = Number(replaceArgs[isBindingFirst ? 1 : 2] as string);
      let usedBindings = usedBindingsByGroup.get(group);
      if (!usedBindings) {
        usedBindings = new Set();
        usedBindingsByGroup.set(group, usedBindings);
      }

      let location = group === 0 ? 0 : usedBindings.size > 0 ? Math.max(...usedBindings) + 1 : 0;
      while (usedBindings.has(location)) {
        location++;
      }
      usedBindings.add(location);

      return match.replace(/@binding\(\s*auto\s*\)/, `@binding(${location})`);
    });
  }

  return source;
}

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
    const isWebGPU = this.context.device.type === 'webgpu';

    return super.getShaders({
      vs: type === 'top' ? vsTop : vsSide,
      fs,
      source: isWebGPU
        ? resolveApplicationWGSLBindings(
            getSolidPolygonShaderWGSL(type, Boolean(ringWindingOrderCW))
          )
        : undefined,
      ...(isWebGPU
        ? {}
        : {
            defines: {
              RING_WINDING_ORDER_CW: ringWindingOrderCW
            }
          }),
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
        IndexType: Uint32Array
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
      vertexPositions: {
        size: 3,
        type: 'float64',
        stepMode: 'dynamic',
        fp64: this.use64bitPositions(),
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getPolygon',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculatePositions,
        noAlloc
      },
      nextVertexPositions: {
        size: 3,
        type: 'float64',
        stepMode: 'dynamic',
        fp64: this.use64bitPositions(),
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getPolygon',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateNextPositions,
        noAlloc
      },
      instanceVertexValid: {
        size: 1,
        stepMode: 'instance',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateVertexValid,
        noAlloc
      },
      elevations: {
        size: 1,
        stepMode: 'dynamic',
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getElevation'
      },
      fillColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        stepMode: 'dynamic',
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getFillColor',
        defaultValue: DEFAULT_COLOR
      },
      lineColors: {
        size: this.props.colorFormat.length,
        type: 'unorm8',
        stepMode: 'dynamic',
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getLineColor',
        defaultValue: DEFAULT_COLOR
      },
      pickingColors: {
        size: 4,
        type: 'uint8',
        stepMode: 'dynamic',
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculatePickingColors
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
    const parameters =
      this.context.device.type === 'webgpu'
        ? ({
            depthWriteEnabled: true,
            depthCompare: 'less-equal'
          } satisfies Parameters)
        : undefined;

    let topModel;
    let sideModel;
    let wireframeModel;

    if (filled) {
      const shaders = this.getShaders('top');
      shaders.defines = {...shaders.defines, NON_INSTANCED_MODEL: 1};
      let bufferLayout = this.getAttributeManager()!.getBufferLayouts({isInstanced: false});
      if (this.context.device.type === 'webgpu') {
        bufferLayout = filterBufferLayout(bufferLayout, new Set([
          'vertexPositions',
          'vertexPositions64Low',
          'elevations',
          'fillColors',
          'pickingColors'
        ]));
      }

      topModel = new Model(this.context.device, {
        ...shaders,
        id: `${id}-top`,
        topology: 'triangle-list',
        bufferLayout,
        isIndexed: true,
        parameters,
        userData: {
          excludeAttributes: {instanceVertexValid: true}
        }
      });
    }
    if (extruded) {
      let bufferLayout = this.getAttributeManager()!.getBufferLayouts({isInstanced: true});
      if (this.context.device.type === 'webgpu') {
        bufferLayout = filterBufferLayout(bufferLayout, new Set([
          'vertexPositions',
          'vertexPositions64Low',
          'nextVertexPositions',
          'nextVertexPositions64Low',
          'instanceVertexValid',
          'elevations',
          'fillColors',
          'lineColors',
          'pickingColors'
        ]));
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
        parameters,
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
        parameters,
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
    attribute.value = polygonTesselator.get('positions');
  }

  protected calculateVertexValid(attribute) {
    const vertexValid = this.state.polygonTesselator.get('vertexValid');
    attribute.value = vertexValid ? Float32Array.from(vertexValid) : vertexValid;
  }

  protected calculateNextPositions(attribute) {
    const {polygonTesselator} = this.state;
    const positions = polygonTesselator.get('positions');
    attribute.startIndices = polygonTesselator.vertexStarts;

    if (!positions) {
      attribute.value = positions;
      return;
    }

    const ArrayType = positions.constructor as typeof Float32Array;
    const nextPositions = new ArrayType(positions.length);

    for (let i = 0; i < positions.length; i += 3) {
      const nextIndex = i + 3 < positions.length ? i + 3 : i;
      nextPositions[i] = positions[nextIndex];
      nextPositions[i + 1] = positions[nextIndex + 1];
      nextPositions[i + 2] = positions[nextIndex + 2];
    }

    attribute.value = nextPositions;
  }

  protected calculatePickingColors(
    attribute,
    {data, startRow, endRow, numInstances}: {data: any; startRow: number; endRow: number; numInstances: number}
  ) {
    const {polygonTesselator} = this.state;
    const startIndices = polygonTesselator.vertexStarts;
    const value = attribute.value as Uint8ClampedArray;
    const pickingColor: [number, number, number] = [0, 0, 0];
    const pickable = Boolean(this.internalState?.hasPickingBuffer);

    const {iterable, objectInfo} = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      const encodedIndex = object && object.__source ? object.__source.index : objectInfo.index;
      if (pickable) {
        this.encodePickingColor(encodedIndex, pickingColor);
      } else {
        pickingColor[0] = 0;
        pickingColor[1] = 0;
        pickingColor[2] = 0;
      }

      const vertexStart = startIndices[objectInfo.index];
      const vertexEnd =
        objectInfo.index < startIndices.length - 1 ? startIndices[objectInfo.index + 1] : numInstances;

      for (let i = vertexStart; i < vertexEnd; i++) {
        const offset = i * 4;
        value[offset + 0] = pickingColor[0];
        value[offset + 1] = pickingColor[1];
        value[offset + 2] = pickingColor[2];
        value[offset + 3] = 0;
      }
    }
  }
}

function filterBufferLayout(bufferLayout: BufferLayout[], allowedAttributes: Set<string>): BufferLayout[] {
  const filteredLayouts: BufferLayout[] = [];

  for (const layout of bufferLayout) {
    if (layout.attributes) {
      const attributes = layout.attributes.filter(attribute =>
        allowedAttributes.has(attribute.attribute)
      );
      if (attributes.length) {
        filteredLayouts.push({...layout, attributes});
      }
    } else if (allowedAttributes.has(layout.name)) {
      filteredLayouts.push(layout);
    }
  }

  return filteredLayouts;
}
