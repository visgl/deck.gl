// Note: This file will either be moved back to deck.gl or reformatted to web-monorepo standards
// Disabling lint temporarily to facilitate copying code in and out of this repo
/* eslint-disable */

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  _deepEqual as deepEqual,
  _LayerColumns as LayerColumns,
  _GPUVectorModel as GPUVectorModel,
  color,
  project32,
  picking,
  DefaultProps,
  log,
  LayerContext,
  Material,
  phongMaterial
} from '@deck.gl/core';
import {SamplerProps, Texture} from '@luma.gl/core';
import {
  type Model,
  Geometry,
  GPUVectorModel as ArrowModel,
  makeGPUVectorGeometry,
  GPUVectorGeometry
} from '@luma.gl/engine';
import {ParsedPBRMaterial} from '@luma.gl/engine/gltf';

import {MATRIX_ATTRIBUTES, shouldComposeModelMatrix} from '../utils/matrix';

import {simpleMeshUniforms, SimpleMeshProps} from './simple-mesh-layer-uniforms';
import vs from './simple-mesh-layer-vertex.glsl';
import fs from './simple-mesh-layer-fragment.glsl';
import source from './simple-mesh-layer.wgsl';

import type {
  LayerProps,
  LayerDataSource,
  UpdateParameters,
  Accessor,
  Position,
  Color,
  TextureSource
} from '@deck.gl/core';
import {
  MESH_COLUMN_DEFINITIONS as COLUMN_DEFINITIONS,
  prepareMeshColumnTransforms,
  TRANSFORM_ACCESSORS
} from '../utils/mesh-columns';
import type {ColumnSource} from '@deck.gl/core/arrow';
import type {MeshAttribute, MeshAttributes} from '@loaders.gl/core/schema';
import type {Geometry as GeometryType} from '@luma.gl/engine';
import {getMeshBoundingBox} from '@loaders.gl/core/schema';

function normalizeGeometryAttributes(attributes: MeshAttributes): MeshAttributes {
  const positionAttribute = attributes.positions || attributes.POSITION;
  log.assert(positionAttribute, 'no "postions" or "POSITION" attribute in mesh');

  const vertexCount = positionAttribute.value.length / positionAttribute.size;
  let colorAttribute = attributes.COLOR_0 || attributes.colors;
  if (!colorAttribute) {
    colorAttribute = {size: 3, value: new Float32Array(vertexCount * 3).fill(1)};
  }
  let normalAttribute = attributes.NORMAL || attributes.normals;
  if (!normalAttribute) {
    normalAttribute = {size: 3, value: new Float32Array(vertexCount * 3).fill(0)};
  }
  let texCoordAttribute = attributes.TEXCOORD_0 || attributes.texCoords;
  if (!texCoordAttribute) {
    texCoordAttribute = {size: 2, value: new Float32Array(vertexCount * 2).fill(0)};
  }

  return {
    positions: positionAttribute,
    colors: colorAttribute,
    normals: normalAttribute,
    texCoords: texCoordAttribute
  };
}

/*
 * Convert mesh data into geometry
 * @returns {Geometry} geometry
 */
function getGeometry(data: Exclude<Mesh, GPUVectorGeometry>): Geometry {
  if (data instanceof Geometry) {
    // @ts-expect-error data.attributes is readonly
    data.attributes = normalizeGeometryAttributes(data.attributes);
    return data;
  } else if ((data as any).attributes) {
    const {indices} = data as {indices?: MeshAttribute};
    // loaders.gl's Arrow mesh format uses signed indices; GPU index buffers require unsigned.
    const indexValues = indices?.value;
    const normalizedIndices =
      indexValues instanceof Int32Array
        ? {
            ...indices,
            value: new Uint32Array(indexValues.buffer, indexValues.byteOffset, indexValues.length)
          }
        : indices;
    return new Geometry({
      ...data,
      indices: normalizedIndices,
      topology: 'triangle-list',
      attributes: normalizeGeometryAttributes((data as any).attributes)
    });
  } else {
    return new Geometry({
      topology: 'triangle-list',
      attributes: normalizeGeometryAttributes(data as MeshAttributes)
    });
  }
}

const defaultPosition = (object: any) => object.position;
const DEFAULT_COLOR = [0, 0, 0, 255] as const;

type Mesh =
  | GPUVectorGeometry
  | GeometryType
  | {
      attributes: MeshAttributes;
      indices?: MeshAttribute;
    }
  | MeshAttributes;

/** Rejects GPU meshes that would need multiple geometry bindings per draw. */
function validateMeshChunks(mesh: GPUVectorGeometry): void {
  if (
    (mesh.indices && mesh.indices.data.length > 1) ||
    Object.values(mesh.attributes).some(input => input && 'data' in input && input.data.length > 1)
  ) {
    throw new Error('SimpleMeshLayer GPU mesh attributes and indices must be single-chunk');
  }
}

/** Detects normal inputs, including those in an interleaved GPU buffer layout. */
function hasMeshNormals(mesh: Mesh): boolean {
  if (mesh instanceof GPUVectorGeometry) {
    return Boolean(
      mesh.attributes.normals ||
        mesh.bufferLayout?.some(layout =>
          layout.attributes?.some(input => input.attribute === 'normals')
        )
    );
  }
  const attributes = (mesh as any).attributes || mesh;
  return Boolean(attributes.NORMAL || attributes.normals);
}

type _SimpleMeshLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  /** Arrow XY or XYZ instance anchors. Overrides `getPosition`. */
  positions?: ColumnSource | null;
  /** Arrow RGB or RGBA instance colors. Overrides `getColor`. */
  colors?: ColumnSource | null;
  mesh: string | Mesh | Promise<Mesh> | null;
  texture?: string | TextureSource | Promise<TextureSource>;
  /** Customize the [texture parameters](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter). */
  textureParameters?: SamplerProps | null;

  /** Anchor position accessor. */
  getPosition?: Accessor<DataT, Position>;
  /** Color value or accessor.
   * If `mesh` does not contain vertex colors, use this color to render each object.
   * If `mesh` contains vertex colors, then the two colors are mixed together.
   * Use `[255, 255, 255]` to use the original mesh colors.
   * If `texture` is assigned, then both colors will be ignored.
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color>;
  /**
   * Orientation in [pitch, yaw, roll] in degrees.
   * @see https://en.wikipedia.org/wiki/Euler_angles
   * @default [0, 0, 0]
   */
  getOrientation?: Accessor<DataT, Readonly<[number, number, number]>>;
  /**
   * Scaling factor of the model along each axis.
   * @default [1, 1, 1]
   */
  getScale?: Accessor<DataT, Readonly<[number, number, number]>>;
  /**
   * Translation from the anchor point, [x, y, z] in meters.
   * @default [0, 0, 0]
   */
  getTranslation?: Accessor<DataT, Readonly<[number, number, number]>>;
  /**
   * TransformMatrix. If specified, `getOrientation`, `getScale` and `getTranslation` are ignored.
   */
  getTransformMatrix?: Accessor<DataT, number[]>;
  /**
   * Multiplier to scale each geometry by.
   * @default 1
   */
  sizeScale?: number;

  /**
   * (Experimental) If rendering only one instance of the mesh, set this to false to treat mesh positions
   * as deltas of the world coordinates of the anchor.
   * E.g. in LNGLAT coordinates, mesh positions are interpreted as meter offsets by default.
   * setting _instanced to false interpreted mesh positions as lnglat deltas.
   * @default true
   */
  _instanced?: boolean; // TODO - formalize API
  /**
   * Whether to render the mesh in wireframe mode.
   * @default false
   */
  wireframe?: boolean;
  /**
   * Material props for lighting effect.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting#constructing-a-material-instance
   */
  material?: Material;
};

export type SimpleMeshLayerProps<DataT = unknown> = _SimpleMeshLayerProps<DataT> & LayerProps;

const defaultProps: DefaultProps<SimpleMeshLayerProps> = {
  mesh: {type: 'object', value: null, async: true},
  texture: {type: 'image', value: null, async: true},
  positions: {type: 'object', value: null, optional: true},
  colors: {type: 'object', value: null, optional: true},
  sizeScale: {type: 'number', value: 1, min: 0},

  // _instanced is a hack to use world position instead of meter offsets in mesh
  // TODO - formalize API
  _instanced: true,
  // NOTE(Tarek): Quick and dirty wireframe. Just draws
  // the same mesh with LINE_STRIPS. Won't follow edges
  // of the original mesh.
  wireframe: false,
  // Optional material for 'lighting' shader module
  material: true,
  getPosition: {type: 'accessor', value: defaultPosition},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},

  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  // [pitch, yaw, roll]
  getOrientation: {type: 'accessor', value: [0, 0, 0]},
  getScale: {type: 'accessor', value: [1, 1, 1]},
  getTranslation: {type: 'accessor', value: [0, 0, 0]},
  // 4x4 matrix
  getTransformMatrix: {type: 'accessor', value: []},

  textureParameters: {type: 'object', ignore: true, value: null}
};

/** Render a number of instances of an arbitrary 3D geometry. */
export default class SimpleMeshLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_SimpleMeshLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName = 'SimpleMeshLayer';

  state!: {
    parsedPBRMaterial?: ParsedPBRMaterial;
    model?: Model;
    arrowModel?: ArrowModel;
    ownedArrowGeometry?: GPUVectorGeometry;
    columns?: LayerColumns;
    emptyTexture: Texture;
    hasNormals?: boolean;
    positionBounds?: [number[], number[]] | null;
  } & Layer['state'];

  getShaders() {
    return super.getShaders({
      vs,
      fs,
      source,
      modules: [project32, color, phongMaterial, picking, simpleMeshUniforms]
    });
  }

  getBounds(): [number[], number[]] | null {
    if (this.props._instanced) {
      return this.state.columns ? this.state.columns.getBounds() : super.getBounds();
    }
    let result = this.state.positionBounds;
    if (result) {
      return result;
    }
    const {mesh} = this.props;
    if (!mesh || mesh instanceof GPUVectorGeometry) {
      return null;
    }
    // @ts-ignore Detect if mesh is generated by loaders.gl
    result = mesh.header?.boundingBox;

    if (!result) {
      // Otherwise, calculate bounding box from positions
      const {attributes} = getGeometry(mesh as Exclude<Mesh, GPUVectorGeometry>);
      attributes.POSITION = attributes.POSITION || attributes.positions;

      //@ts-expect-error
      result = getMeshBoundingBox(attributes);
    }

    this.state.positionBounds = result;
    return result;
  }

  initializeState() {
    this.initializeAccessorAttributes();
    this.setState({
      // Avoid luma.gl's missing uniform warning
      // TODO - add feature to luma.gl to specify ignored uniforms?
      emptyTexture: this.context.device.createTexture({
        data: new Uint8Array(4),
        width: 1,
        height: 1
      })
    });
  }

  /** Registers the attributes used by the ordinary accessor path. */
  private initializeAccessorAttributes(): void {
    const attributeManager = this.getAttributeManager();
    // attributeManager is always defined in a primitive layer
    attributeManager!.addInstanced({
      instancePositions: {
        transition: true,
        type: 'float64',
        fp64: this.use64bitPositions(),
        ...this.usePositionTransforms(),
        size: 3,
        accessor: 'getPosition'
      },
      instanceColors: {
        type: 'unorm8',
        transition: true,
        size: this.props.colorFormat.length,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceModelMatrix: MATRIX_ATTRIBUTES
    });
  }

  updateState(params: UpdateParameters<this>) {
    const {mesh} = params.props;
    if (mesh instanceof GPUVectorGeometry && mesh !== params.oldProps.mesh) {
      validateMeshChunks(mesh);
    }
    if (params.props.positions || params.props.colors) {
      this.updateColumnState(params);
      return;
    }
    const restored = this.restoreAccessorState();
    super.updateState(params);

    const {props, oldProps, changeFlags} = params;
    if (restored || props.mesh !== oldProps.mesh || changeFlags.extensionsChanged) {
      this.state.positionBounds = null;
      this.state.model?.destroy();
      this.state.model = undefined;
      if (props.mesh) {
        this.state.model = this.getModel(props.mesh as Mesh);

        this.setState({hasNormals: hasMeshNormals(props.mesh as Mesh)});
      }
      // attributeManager is always defined in a primitive layer
      this.getAttributeManager()!.invalidateAll();
    }

    if (props.texture !== oldProps.texture && props.texture instanceof Texture) {
      this.setTexture(props.texture);
    }

    if (this.state.model) {
      this.state.model.setTopology(this.getMeshTopology());
    }
  }

  /** Updates instance columns independently of the mesh and texture lifecycle. */
  private updateColumnState(params: UpdateParameters<this>): void {
    const {props, oldProps, changeFlags} = params;
    if (props.extensions.length || Object.keys(props.transitions || {}).length) {
      throw new Error('SimpleMesh Arrow columns do not support extensions or transitions');
    }
    const entering = !this.state.columns;
    if (entering) {
      this.state.model?.destroy();
      this.state.model = undefined;
      this.internalState!.attributeManager?.finalize();
      this.internalState!.attributeManager = null;
      this.state.columns = new LayerColumns(this.context.device, COLUMN_DEFINITIONS, 'SimpleMesh');
    }
    if (entering || props.mesh !== oldProps.mesh) {
      this.updateColumnModel(props.mesh as Mesh | null);
    }
    const model = this.state.arrowModel;
    if (model) {
      model.setTopology(this.getMeshTopology());
      model.shaderInputs.setProps({simpleMesh: this.getTextureProps(props.texture as Texture)});
    }
    this.updateInstanceColumns(params);
  }

  /** Keeps the topology declared by a caller-provided GPU mesh. */
  private getMeshTopology() {
    const {mesh, wireframe} = this.props;
    return wireframe
      ? 'line-strip'
      : mesh instanceof GPUVectorGeometry
        ? mesh.topology
        : 'triangle-list';
  }

  /** Uploads the current mesh for the Arrow model, including any index buffer. */
  private updateColumnModel(mesh: Mesh | null): void {
    this.state.arrowModel?.destroy();
    this.state.ownedArrowGeometry?.destroy();
    this.state.arrowModel = undefined;
    this.state.ownedArrowGeometry = undefined;
    this.state.positionBounds = null;
    if (!mesh) return;
    const geometry =
      mesh instanceof GPUVectorGeometry
        ? mesh
        : makeGPUVectorGeometry(this.context.device, getGeometry(mesh));
    if (geometry !== mesh) this.state.ownedArrowGeometry = geometry;
    this.state.hasNormals = hasMeshNormals(mesh);
    this.state.arrowModel = new ArrowModel(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      geometry,
      bufferLayout: this.state.columns!.getBufferLayouts(),
      isInstanced: true,
      inferDrawCount: 'instance'
    });
  }

  /** Supplies mesh transform accessors as the four instance vectors expected by the shaders. */
  private updateInstanceColumns({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    // Function-valued transforms follow updateTriggers, like ordinary mesh accessors.
    const transformsChanged = TRANSFORM_ACCESSORS.some(name => {
      const value = props[name];
      const oldValue = oldProps[name];
      return (
        (typeof value !== 'function' || typeof oldValue !== 'function') &&
        !deepEqual(value, oldValue, 1)
      );
    });
    void this.state.columns!.updateIfNeeded(
      {
        props,
        oldProps,
        changeFlags: {
          ...changeFlags,
          dataChanged:
            changeFlags.dataChanged || (transformsChanged ? 'mesh transforms changed' : false)
        }
      },
      {
        dataLoading: this.internalState!.isAsyncPropLoading('data'),
        changed: () => {
          this.setState({});
          this.setNeedsUpdate();
        },
        failed: error => this.raiseError(error, 'converting Arrow columns'),
        prepareFallbacks: (rows, length, own) =>
          prepareMeshColumnTransforms(this.context.device, props, rows, length, own),
        positionOptions: {
          transform: this.usePositionTransforms().transform?.bind(this),
          fp64: this.use64bitPositions(),
          requireRows:
            !props.positions &&
            props.getPosition === defaultPosition &&
            !(props.data as any)?.attributes?.getPosition
        }
      }
    );
  }

  /** Releases the Arrow path and reinstates the regular attribute manager. */
  private restoreAccessorState(): boolean {
    if (!this.state.columns) return false;
    this.state.columns.destroy();
    this.state.columns = undefined;
    this.updateColumnModel(null);
    this.internalState!.attributeManager = super._getAttributeManager();
    this.initializeAccessorAttributes();
    return true;
  }

  getModels(): ArrowModel[] {
    return this.state?.arrowModel ? [this.state.arrowModel] : super.getModels();
  }

  getNumInstances(): number {
    return this.state?.columns && !Number.isFinite(this.props.numInstances)
      ? this.state.columns.length
      : super.getNumInstances();
  }

  finalizeState(context: LayerContext) {
    super.finalizeState(context);
    this.state.columns?.destroy();
    this.state.ownedArrowGeometry?.destroy();

    this.state.emptyTexture.delete();
  }

  draw({uniforms}) {
    const {columns} = this.state;
    const model = this.state.arrowModel ?? this.state.model;
    if (!model) {
      return;
    }

    const {viewport, renderPass} = this.context;
    const {sizeScale, coordinateSystem, _instanced} = this.props;

    const simpleMeshProps: SimpleMeshProps = {
      sizeScale,
      rowIndexOffset: 0,
      composeModelMatrix:
        !_instanced ||
        shouldComposeModelMatrix(
          viewport,
          this.state.sourceCrs?.signature || coordinateSystem,
          Boolean(this.state.preproject)
        ),
      flatShading: !this.state.hasNormals
    };
    model.shaderInputs.setProps({simpleMesh: simpleMeshProps});
    if (columns) {
      columns.draw(model, renderPass, rowIndexOffset => {
        model.setInstanceCount(
          Math.min(model.instanceCount, Math.max(0, this.getNumInstances() - rowIndexOffset))
        );
        model.shaderInputs.setProps({simpleMesh: {rowIndexOffset}});
      });
    } else {
      model.draw(renderPass);
    }
  }

  get isLoaded(): boolean {
    return Boolean(
      (this.state?.model || this.state?.arrowModel) &&
        !this.state.columns?.loading &&
        super.isLoaded
    );
  }

  protected getModel(mesh: Mesh): Model {
    const model = new GPUVectorModel(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      geometry: mesh instanceof GPUVectorGeometry ? mesh : getGeometry(mesh),
      isInstanced: true
    });

    model.shaderInputs.setProps({
      simpleMesh: this.getTextureProps(this.props.texture as Texture)
    });
    return model;
  }

  private setTexture(texture: Texture): void {
    const {model} = this.state;

    // props.mesh may not be ready at this time.
    // The sampler will be set when `getModel` is called
    if (model) {
      model.shaderInputs.setProps({simpleMesh: this.getTextureProps(texture)});
    }
  }

  private getTextureProps(texture?: Texture | null): SimpleMeshProps {
    const meshTexture = texture || this.state.emptyTexture;
    return {
      ...(this.context.device.type === 'webgpu'
        ? {simpleMeshTexture: meshTexture}
        : {sampler: meshTexture}),
      hasTexture: Boolean(texture)
    };
  }
}
