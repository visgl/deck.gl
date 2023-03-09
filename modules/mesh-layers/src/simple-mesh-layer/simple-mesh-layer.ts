// Note: This file will either be moved back to deck.gl or reformatted to web-monorepo standards
// Disabling lint temporarily to facilitate copying code in and out of this repo
/* eslint-disable */

// Copyright (c) 2015 Uber Technologies, Inc.
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

import {
  Layer,
  project32,
  phongLighting,
  picking,
  DefaultProps,
  log,
  LayerContext,
  Material
} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, Geometry, Texture2D, isWebGL2} from '@luma.gl/core';
import {hasFeature, FEATURES} from '@luma.gl/webgl';

import {MATRIX_ATTRIBUTES, shouldComposeModelMatrix} from '../utils/matrix';

import vs from './simple-mesh-layer-vertex.glsl';
import fs from './simple-mesh-layer-fragment.glsl';

import type {
  LayerProps,
  LayerDataSource,
  UpdateParameters,
  Accessor,
  Position,
  Color,
  Texture
} from '@deck.gl/core';
import type {MeshAttribute, MeshAttributes} from '@loaders.gl/schema';
import type {Geometry as GeometryType} from '@luma.gl/engine';
import {GLTFMaterialParser} from '@luma.gl/experimental';
import {getMeshBoundingBox} from '@loaders.gl/schema';

function validateGeometryAttributes(attributes: Record<string, any>, useMeshColors: boolean): void {
  const hasColorAttribute = attributes.COLOR_0 || attributes.colors;
  const useColorAttribute = hasColorAttribute && useMeshColors;
  if (!useColorAttribute) {
    attributes.colors = {constant: true, value: new Float32Array([1, 1, 1])};
  }
  log.assert(
    attributes.positions || attributes.POSITION,
    'no "postions" or "POSITION" attribute in mesh'
  );
}

/*
 * Convert mesh data into geometry
 * @returns {Geometry} geometry
 */
function getGeometry(data: Mesh, useMeshColors: boolean): Geometry {
  if ((data as any).attributes) {
    validateGeometryAttributes((data as any).attributes, useMeshColors);
    if (data instanceof Geometry) {
      return data;
    } else {
      return new Geometry(data);
    }
  } else if ((data as MeshAttributes).positions || (data as MeshAttributes).POSITION) {
    validateGeometryAttributes(data, useMeshColors);
    return new Geometry({
      attributes: data
    });
  }
  throw Error('Invalid mesh');
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
  texture?: string | Texture | Promise<Texture>;
  /** Customize the [texture parameters](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter). */
  textureParameters?: Record<number, number> | null;

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
   * @deprecated Whether to color pixels using vertex colors supplied in the mesh (the `COLOR_0` or `colors` attribute).
   * If set to `false` vertex colors will be ignored.
   * This prop will be removed and set to always true in the next major release.
   * @default false
   */
  _useMeshColors?: boolean;

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

export type SimpleMeshLayerProps<DataT = any> = _SimpleMeshLayerProps<DataT> & LayerProps;

const defaultProps: DefaultProps<SimpleMeshLayerProps> = {
  mesh: {type: 'object', value: null, async: true},
  texture: {type: 'image', value: null, async: true},
  sizeScale: {type: 'number', value: 1, min: 0},
  // Whether the color attribute in a mesh will be used
  // This prop will be removed and set to true in next major release
  _useMeshColors: {type: 'boolean', value: false},

  // _instanced is a hack to use world position instead of meter offsets in mesh
  // TODO - formalize API
  _instanced: true,
  // NOTE(Tarek): Quick and dirty wireframe. Just draws
  // the same mesh with LINE_STRIPS. Won't follow edges
  // of the original mesh.
  wireframe: false,
  // Optional material for 'lighting' shader module
  material: true,
  getPosition: {type: 'accessor', value: x => x.position},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},

  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  // [pitch, yaw, roll]
  getOrientation: {type: 'accessor', value: [0, 0, 0]},
  getScale: {type: 'accessor', value: [1, 1, 1]},
  getTranslation: {type: 'accessor', value: [0, 0, 0]},
  // 4x4 matrix
  getTransformMatrix: {type: 'accessor', value: []},

  textureParameters: {type: 'object', ignore: true}
};

/** Render a number of instances of an arbitrary 3D geometry. */
export default class SimpleMeshLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_SimpleMeshLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName = 'SimpleMeshLayer';

  state!: {
    materialParser?: GLTFMaterialParser;
    model?: Model;
    emptyTexture: Texture2D;
    hasNormals?: boolean;
    positionBounds?: [number[], number[]] | null;
  };

  getShaders() {
    const transpileToGLSL100 = !isWebGL2(this.context.gl);

    const defines: any = {};

    if (hasFeature(this.context.gl, FEATURES.GLSL_DERIVATIVES)) {
      defines.DERIVATIVES_AVAILABLE = 1;
    }

    return super.getShaders({
      vs,
      fs,
      modules: [project32, phongLighting, picking],
      transpileToGLSL100,
      defines
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
      const {attributes} = getGeometry(mesh as Mesh, this.props._useMeshColors);
      attributes.POSITION = attributes.POSITION || attributes.positions;
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
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        size: 3,
        accessor: 'getPosition'
      },
      instanceColors: {
        type: GL.UNSIGNED_BYTE,
        transition: true,
        size: this.props.colorFormat.length,
        normalized: true,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceModelMatrix: MATRIX_ATTRIBUTES
    });

    this.setState({
      // Avoid luma.gl's missing uniform warning
      // TODO - add feature to luma.gl to specify ignored uniforms?
      emptyTexture: new Texture2D(this.context.gl, {
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
      this.state.model?.delete();
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

    if (props.texture !== oldProps.texture) {
      this.setTexture(props.texture);
    }

    if (this.state.model) {
      this.state.model.setDrawMode(this.props.wireframe ? GL.LINE_STRIP : GL.TRIANGLES);
    }
  }

  finalizeState(context: LayerContext) {
    super.finalizeState(context);

    this.state.emptyTexture.delete();
  }

  draw({uniforms}) {
    if (!this.state.model) {
      return;
    }

    const {viewport} = this.context;
    const {sizeScale, coordinateSystem, _instanced} = this.props;

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        sizeScale,
        composeModelMatrix: !_instanced || shouldComposeModelMatrix(viewport, coordinateSystem),
        flatShading: !this.state.hasNormals
      })
      .draw();
  }

  protected getModel(mesh: Mesh): Model {
    const model = new Model(this.context.gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: getGeometry(mesh, this.props._useMeshColors),
      isInstanced: true
    });

    const {texture} = this.props;
    const {emptyTexture} = this.state;
    model.setUniforms({
      sampler: texture || emptyTexture,
      hasTexture: Boolean(texture)
    });

    return model;
  }

  private setTexture(texture: Texture2D): void {
    const {emptyTexture, model} = this.state;

    // props.mesh may not be ready at this time.
    // The sampler will be set when `getModel` is called
    if (model) {
      model.setUniforms({
        sampler: texture || emptyTexture,
        hasTexture: Boolean(texture)
      });
    }
  }
}
