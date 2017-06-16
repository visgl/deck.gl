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

import {Layer, assembleShaders} from 'deck.gl';
import {GL, Model, Geometry, Texture2D, setParameters} from 'luma.gl';
import meshLayerVertex from './mesh-layer-vertex.glsl';
import meshLayerFragment from './mesh-layer-fragment.glsl';

// TODO - hack. Why is this here? remove.
let texture = null;

function degreeToRadian(degree) {
  return degree * (Math.PI / 180);
}

const defaultProps = {
  getPosition: x => x.position,
  getAngleDegreesCW: x => x.angle || 0,
  getColor: x => x.color || [0, 0, 255],
  mesh: null,
  textureUrl: null,
  meterScale: 1
};

export default class MeshLayer extends Layer {
  getShaders() {
    return {
      vs: meshLayerVertex,
      fs: meshLayerFragment
    };
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this.getModel(gl)});

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceAngles: {size: 1, update: this.calculateInstanceAngles}
    });
  }

  updateState({props}) {
    const {meterScale} = props;
    this.setUniforms({meterScale});
    if (texture) {
      this.setUniforms({sampler1: texture});
    }

    if (this.state.dataChanged && this.state.attributeManager) {
      this.state.attributeManager.invalidateAll();
    }
  }

  getModel(gl) {
    const shaders = assembleShaders(gl, this.getShaders());

    // TODO - this should not be done here
    setParameters(gl, {
      depthTest: true,
      depthFunc: gl.LEQUAL
    });

    const model = new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        indices: new Uint16Array(this.props.mesh.indices),
        positions: new Float32Array(this.props.mesh.vertices),
        normals: new Float32Array(this.props.mesh.vertexNormals),
        texCoords: new Float32Array(this.props.mesh.textures)
      }),
      isInstanced: true
    });

    /* global Image */
    const image = new Image();

    image.crossOrigin = 'Anonymous';
    image.src = this.props.textureUrl;
    image.onload = () => {
      texture = new Texture2D(gl).setImageData({data: image});
      model.setUniforms({sampler1: texture});
    };
    image.onerror = () => {
      throw new Error('Could not load texture.');
    };
    return model;
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i + 0] = position[0] || 0;
      value[i + 1] = position[1] || 0;
      value[i + 2] = position[2] || 0;
      i += size;
    }
  }

  calculateInstanceAngles(attribute) {
    const {data, getAngleDegreesCW} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const angle = getAngleDegreesCW(point);
      value[i] = -degreeToRadian(angle);
      i += size;
    }
  }
}

MeshLayer.layerName = 'MeshLayer';
MeshLayer.defaultProps = defaultProps;
