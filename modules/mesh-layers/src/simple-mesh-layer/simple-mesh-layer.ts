// Note: This file will either be moved back to deck.gl or reformatted to web-monorepo standards
// Disabling lint temporarily to facilitate copying code in and out of this repo
/* eslint-disable */

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer, project32, picking, DefaultProps, log, LayerContext, Material} from '@deck.gl/core';
import {SamplerProps, Texture} from '@luma.gl/core';
import {Model, Geometry} from '@luma.gl/engine';
import {ParsedPBRMaterial} from '@luma.gl/gltf';
import {phongMaterial} from '@luma.gl/shadertools';

import {MATRIX_ATTRIBUTES, shouldComposeModelMatrix} from '../utils/matrix';

import {simpleMeshUniforms, SimpleMeshProps} from './simple-mesh-layer-uniforms';
import vs from './simple-mesh-layer-vertex.glsl';
import fs from './simple-mesh-layer-fragment.glsl';

import type {
  LayerProps,
  LayerDataSource,
  UpdateParameters,
  Accessor,
  Position,
  Color,
  TextureSource
} from '@deck.gl/core';
import type {MeshAttribute, MeshAttributes} from '@loaders.gl/schema';
import type {Geometry as GeometryType} from '@luma.gl/engine';
import {getMeshBoundingBox} from '@loaders.gl/schema';

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
function getGeometry(data: Mesh): Geometry {
  if (data instanceof Geometry) {
    // @ts-expect-error data.attributes is readonly
    data.attributes = normalizeGeometryAttributes(data.attributes);
    return data;
  } else if ((data as any).attributes) {
    return new Geometry({
      ...data,
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

const DEFAULT_COLOR: [number, number, number, number] = [0, 0, 0, 255];

type Mesh =
  | GeometryType
  | {
      attributes: MeshAttributes;
      indices?: MeshAttribute;
    }
  | MeshAttributes;

type _SimpleMeshLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
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
  getOrientation?: Accessor<DataT, [number, number, number]>;
  /**
   * Scaling factor of the model along each axis.
   * @default [1, 1, 1]
   */
  getScale?: Accessor<DataT, [number, number, number]>;
  /**
   * Translation from the anchor point, [x, y, z] in meters.
   * @default [0, 0, 0]
   */
  getTranslation?: Accessor<DataT, [number, number, number]>;
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
  getPosition: {type: 'accessor', value: (x: any) => x.position},
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
    emptyTexture: Texture;
    hasNormals?: boolean;
    positionBounds?: [number[], number[]] | null;
  };

  getShaders() {
    return super.getShaders({
      vs,
      fs,
      modules: [project32, phongMaterial, picking, simpleMeshUniforms]
    });
  }

  getBounds(): [number[], number[]] | null {
    if (this.props._instanced) {
      return super.getBounds();
    }
    let result = this.state.positionBounds;
    if (result) {
      return result;
    }
    const {mesh} = this.props;
    if (!mesh) {
      return null;
    }
    // @ts-ignore Detect if mesh is generated by loaders.gl
    result = mesh.header?.boundingBox;

    if (!result) {
      // Otherwise, calculate bounding box from positions
      const {attributes} = getGeometry(mesh as Mesh);
      attributes.POSITION = attributes.POSITION || attributes.positions;

      //@ts-expect-error
      result = getMeshBoundingBox(attributes);
    }

    this.state.positionBounds = result;
    return result;
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    // attributeManager is always defined in a primitive layer
    attributeManager!.addInstanced({
      instancePositions: {
        transition: true,
        type: 'float64',
        fp64: this.use64bitPositions(),
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

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);

    const {props, oldProps, changeFlags} = params;
    if (props.mesh !== oldProps.mesh || changeFlags.extensionsChanged) {
      this.state.positionBounds = null;
      this.state.model?.destroy();
      if (props.mesh) {
        this.state.model = this.getModel(props.mesh as Mesh);

        const attributes = (props.mesh as any).attributes || props.mesh;
        this.setState({
          hasNormals: Boolean(attributes.NORMAL || attributes.normals)
        });
      }
      // attributeManager is always defined in a primitive layer
      this.getAttributeManager()!.invalidateAll();
    }

    if (props.texture !== oldProps.texture && props.texture instanceof Texture) {
      this.setTexture(props.texture);
    }

    if (this.state.model) {
      this.state.model.setTopology(this.props.wireframe ? 'line-strip' : 'triangle-list');
    }
  }

  finalizeState(context: LayerContext) {
    super.finalizeState(context);

    this.state.emptyTexture.delete();
  }

  draw({uniforms}) {
    const {model} = this.state;
    if (!model) {
      return;
    }

    const {viewport, renderPass} = this.context;
    const {sizeScale, coordinateSystem, _instanced} = this.props;

    const simpleMeshProps: SimpleMeshProps = {
      sizeScale,
      composeModelMatrix: !_instanced || shouldComposeModelMatrix(viewport, coordinateSystem),
      flatShading: !this.state.hasNormals
    };
    model.shaderInputs.setProps({simpleMesh: simpleMeshProps});
    model.draw(renderPass);
  }

  get isLoaded(): boolean {
    return Boolean(this.state?.model && super.isLoaded);
  }

  protected getModel(mesh: Mesh): Model {
    const model = new Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager()!.getBufferLayouts(),
      geometry: getGeometry(mesh),
      isInstanced: true
    });

    const {texture} = this.props;
    const {emptyTexture} = this.state;
    const simpleMeshProps: SimpleMeshProps = {
      sampler: (texture as Texture) || emptyTexture,
      hasTexture: Boolean(texture)
    };
    model.shaderInputs.setProps({simpleMesh: simpleMeshProps});
    return model;
  }

  private setTexture(texture: Texture): void {
    const {emptyTexture, model} = this.state;

    // props.mesh may not be ready at this time.
    // The sampler will be set when `getModel` is called
    if (model) {
      const simpleMeshProps: SimpleMeshProps = {
        sampler: texture || emptyTexture,
        hasTexture: Boolean(texture)
      };
      model.shaderInputs.setProps({simpleMesh: simpleMeshProps});
    }
  }
}
