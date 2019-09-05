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

import {Layer} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {
  Model,
  Geometry,
  hasFeature,
  FEATURES,
  PhongMaterial,
  Framebuffer,
  Texture2D,
  withParameters,
  Buffer
} from '@luma.gl/core';

// Polygon geometry generation is managed by the polygon tesselator
import PolygonTesselator from './polygon-tesselator';

import vsTop from './solid-polygon-layer-vertex-top.glsl';
import vsSide from './solid-polygon-layer-vertex-side.glsl';
import fs from './solid-polygon-layer-fragment.glsl';

const DEFAULT_COLOR = [0, 0, 0, 255];
const defaultMaterial = new PhongMaterial();

const defaultProps = {
  filled: true,
  // Whether to extrude
  extruded: false,
  // Whether to draw a GL.LINES wireframe of the polygon
  wireframe: false,

  // elevation multiplier
  elevationScale: {type: 'number', min: 0, value: 1},

  // Accessor for polygon geometry
  getPolygon: {type: 'accessor', value: f => f.polygon},
  // Accessor for extrusion height
  getElevation: {type: 'accessor', value: 1000},
  // Accessor for colors
  getFillColor: {type: 'accessor', value: DEFAULT_COLOR},
  getLineColor: {type: 'accessor', value: DEFAULT_COLOR},

  // Optional settings for 'lighting' shader module
  material: defaultMaterial
};

const ATTRIBUTE_TRANSITION = {
  enter: (value, chunk) => {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};

const oitBlendVs = `\
#version 300 es
in vec4 positions;

void main() {
    gl_Position = positions;
}
`;

const oitBlendFs = `\
#version 300 es
precision highp float;
uniform sampler2D uAccumulate;
uniform sampler2D uAccumulateAlpha;
out vec4 fragColor;
void main() {
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec4 accum = texelFetch(uAccumulate, fragCoord, 0);
    float a = 1.0 - accum.a;
    accum.a = texelFetch(uAccumulateAlpha, fragCoord, 0).r;
    fragColor = vec4(a * accum.rgb / clamp(accum.a, 0.001, 50000.0), a);
}
`;
export default class SolidPolygonLayer extends Layer {
  getShaders(vs) {
    return super.getShaders({
      vs,
      fs,
      defines: {},
      modules: ['project32', 'gouraud-lighting', 'picking']
    });
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({
      numInstances: 0,
      polygonTesselator: new PolygonTesselator({
        fp64: this.use64bitPositions(),
        IndexType: !gl || hasFeature(gl, FEATURES.ELEMENT_INDEX_UINT32) ? Uint32Array : Uint16Array
      })
    });

    const attributeManager = this.getAttributeManager();
    const noAlloc = true;

    attributeManager.remove(['instancePickingColors']);

    /* eslint-disable max-len */
    attributeManager.add({
      indices: {size: 1, isIndexed: true, update: this.calculateIndices, noAlloc},
      positions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getPolygon',
        update: this.calculatePositions,
        noAlloc,
        shaderAttributes: {
          positions: {
            offset: 0,
            divisor: 0
          },
          instancePositions: {
            offset: 0,
            divisor: 1
          },
          nextPositions: {
            offset: 12,
            divisor: 1
          }
        }
      },
      vertexValid: {
        size: 1,
        divisor: 1,
        type: GL.UNSIGNED_BYTE,
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
        alias: 'colors',
        size: this.props.colorFormat.length,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getFillColor',
        defaultValue: DEFAULT_COLOR,
        shaderAttributes: {
          fillColors: {
            divisor: 0
          },
          instanceFillColors: {
            divisor: 1
          }
        }
      },
      lineColors: {
        alias: 'colors',
        size: this.props.colorFormat.length,
        type: GL.UNSIGNED_BYTE,
        normalized: true,
        transition: ATTRIBUTE_TRANSITION,
        accessor: 'getLineColor',
        defaultValue: DEFAULT_COLOR,
        shaderAttributes: {
          lineColors: {
            divisor: 0
          },
          instanceLineColors: {
            divisor: 1
          }
        }
      },
      pickingColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
        accessor: (object, {index, target: value}) => this.encodePickingColor(index, value),
        shaderAttributes: {
          pickingColors: {
            divisor: 0
          },
          instancePickingColors: {
            divisor: 1
          }
        }
      }
    });

    const accumulationTexture = new Texture2D(gl, {
      type: gl.FLOAT,
      format: gl.RGBA32F,
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      mipmaps: false,
      parameters: {
        [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
        [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
      }
    });

    const revealageTexture = new Texture2D(gl, {
      type: gl.FLOAT,
      format: gl.R32F,
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      mipmaps: false,
      parameters: {
        [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
        [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
      }
    });

    const accumulationFramebuffer = new Framebuffer(gl, {
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      attachments: {
        [GL.COLOR_ATTACHMENT0]: accumulationTexture,
        [GL.COLOR_ATTACHMENT1]: revealageTexture
      }
    });

    this.setState({
      accumulationTexture,
      revealageTexture,
      accumulationFramebuffer
    });

    /* eslint-enable max-len */
  }

  draw({uniforms}) {
    const {gl} = this.context;
    const {extruded, filled, wireframe, elevationScale} = this.props;
    const {topModel, sideModel, polygonTesselator} = this.state;

    const renderUniforms = Object.assign({}, uniforms, {
      extruded: Boolean(extruded),
      elevationScale
    });

    this.state.accumulationFramebuffer.clear({color: [0, 0, 0, 1], depth: 1});

    withParameters(
      gl,
      {
        blendFunc: [gl.ONE, gl.ONE, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA],
        blend: true,
        depthMask: false,
        framebuffer: this.state.accumulationFramebuffer
      },
      () => {
        // Note: the order is important
        if (sideModel) {
          sideModel.setInstanceCount(polygonTesselator.instanceCount - 1);
          sideModel.setUniforms(renderUniforms);
          if (wireframe) {
            sideModel.setDrawMode(GL.LINE_STRIP);
            sideModel.setUniforms({isWireframe: true}).draw();
          }
          if (filled) {
            sideModel.setDrawMode(GL.TRIANGLE_FAN);
            sideModel.setUniforms({isWireframe: false}).draw();
          }
        }

        if (topModel) {
          topModel.setVertexCount(polygonTesselator.get('indices').length);
          topModel.setUniforms(renderUniforms).draw();
        }
      }
    );

    withParameters(
      gl,
      {
        blendFunc: [gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
        blend: true,
        depthTest: false,
        framebuffer: null
      },
      () => {
        this.state.oitModel.draw();
      }
    );
  }

  updateState(updateParams) {
    super.updateState(updateParams);

    this.updateGeometry(updateParams);

    const {props, oldProps, changeFlags} = updateParams;
    const attributeManager = this.getAttributeManager();

    const regenerateModels =
      changeFlags.extensionsChanged ||
      props.filled !== oldProps.filled ||
      props.extruded !== oldProps.extruded;

    if (regenerateModels) {
      if (this.state.models) {
        this.state.models.forEach(model => model.delete());
      }

      this.setState(this._getModels(this.context.gl));
      attributeManager.invalidateAll();
    }
  }

  updateGeometry({props, oldProps, changeFlags}) {
    const geometryConfigChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon));

    // When the geometry config  or the data is changed,
    // tessellator needs to be invoked
    if (geometryConfigChanged) {
      const {polygonTesselator} = this.state;
      polygonTesselator.updateGeometry({
        data: props.data,
        getGeometry: props.getPolygon,
        positionFormat: props.positionFormat,
        fp64: this.use64bitPositions(),
        dataChanged: changeFlags.dataChanged
      });

      this.setState({
        numInstances: polygonTesselator.instanceCount,
        bufferLayout: polygonTesselator.bufferLayout
      });

      if (!changeFlags.dataChanged) {
        // Base `layer.updateState` only invalidates all attributes on data change
        // Cover the rest of the scenarios here
        this.getAttributeManager().invalidateAll();
      }
    }
  }

  _getModels(gl) {
    const {id, filled, extruded} = this.props;

    let topModel;
    let sideModel;

    if (filled) {
      const shaders = this.getShaders(vsTop);
      shaders.defines.NON_INSTANCED_MODEL = 1;

      topModel = new Model(
        gl,
        Object.assign({}, shaders, {
          id: `${id}-top`,
          drawMode: GL.TRIANGLES,
          attributes: {
            vertexPositions: new Float32Array([0, 1])
          },
          uniforms: {
            isWireframe: false,
            isSideVertex: false
          },
          vertexCount: 0,
          isIndexed: true
        })
      );
    }
    if (extruded) {
      sideModel = new Model(
        gl,
        Object.assign({}, this.getShaders(vsSide), {
          id: `${id}-side`,
          geometry: new Geometry({
            drawMode: GL.LINES,
            vertexCount: 4,
            attributes: {
              // top right - top left - bootom left - bottom right
              vertexPositions: {
                size: 2,
                value: new Float32Array([1, 1, 0, 1, 0, 0, 1, 0])
              }
            }
          }),
          instanceCount: 0,
          isInstanced: 1
        })
      );

      sideModel.userData.excludeAttributes = {indices: true};
    }

    const oitModel = new Model(gl, {
      vs: oitBlendVs,
      fs: oitBlendFs,
      drawMode: GL.TRIANGLE_STRIP,
      attributes: {
        positions: [new Buffer(gl, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1])), {size: 2}]
      },
      vertexCount: 4,
      uniforms: {
        uAccumulate: this.state.accumulationTexture,
        uAccumulateAlpha: this.state.revealageTexture
      }
    });

    this.setState({oitModel});

    return {
      models: [sideModel, topModel].filter(Boolean),
      topModel,
      sideModel
    };
  }

  calculateIndices(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.indexLayout;
    attribute.value = polygonTesselator.get('indices');
  }

  calculatePositions(attribute) {
    const {polygonTesselator} = this.state;
    attribute.bufferLayout = polygonTesselator.bufferLayout;
    attribute.value = polygonTesselator.get('positions');
  }

  calculateVertexValid(attribute) {
    attribute.value = this.state.polygonTesselator.get('vertexValid');
  }
}

SolidPolygonLayer.layerName = 'SolidPolygonLayer';
SolidPolygonLayer.defaultProps = defaultProps;
