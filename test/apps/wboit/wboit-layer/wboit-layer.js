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

import GL from '@luma.gl/constants';
import {Model, Framebuffer, Texture2D, withParameters, Buffer} from '@luma.gl/core';

// Polygon geometry generation is managed by the polygon tesselator
import {SolidPolygonLayer} from '@deck.gl/layers';

import vsTop from './wboit-layer-vertex-top.glsl';
import vsSide from './wboit-layer-vertex-side.glsl';
import fs from './wboit-layer-fragment.glsl';
import oitBlendVs from './oit-blend-vertex.glsl';
import oitBlendFs from './oit-blend-fragment.glsl';

export default class WBOITLayer extends SolidPolygonLayer {
  getShaders(vs) {
    const shaders = super.getShaders(vs);
    shaders.vs =
      vs.indexOf('SHADER_NAME solid-polygon-layer-vertex-shader-side') > 0 ? vsSide : vsTop;
    shaders.fs = fs;
    return shaders;
  }

  initializeState() {
    super.initializeState();

    const {gl} = this.context;

    const textureOpts = {
      type: gl.FLOAT,
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      mipmaps: false,
      parameters: {
        [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
        [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
      }
    };

    const accumulationTexture = new Texture2D(gl, {
      ...textureOpts,
      format: gl.RGBA32F
    });

    const revealageTexture = new Texture2D(gl, {
      ...textureOpts,
      format: gl.R32F
    });

    // This is the depthTexture from solid objects!
    // const accumulationDepthTexture = new Texture2D(gl, {
    //   ...textureOpts,
    //   format: GL.DEPTH_COMPONENT32F,
    //   dataFormat: GL.DEPTH_COMPONENT
    // });

    const accumulationFramebuffer = new Framebuffer(gl, {
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      attachments: {
        [GL.COLOR_ATTACHMENT0]: accumulationTexture,
        [GL.COLOR_ATTACHMENT1]: revealageTexture
        // [GL.DEPTH_ATTACHMENT]: accumulationDepthTexture
      }
    });

    this.setState({
      accumulationTexture,
      // accumulationDepthTexture,
      revealageTexture,
      accumulationFramebuffer
    });
  }

  finalizeState() {
    const {
      accumulationTexture,
      // accumulationDepthTexture,
      revealageTexture,
      accumulationFramebuffer
    } = this.state;

    accumulationFramebuffer.delete();
    accumulationTexture.delete();
    // accumulationDepthTexture.delete();
    revealageTexture.delete();
  }

  draw(opts) {
    const {gl} = this.context;

    this.state.accumulationFramebuffer.clear({color: [0, 0, 0, 1], depth: 1});

    withParameters(
      gl,
      {
        blendFunc: [gl.ONE, gl.ONE, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA],
        blend: true,
        depthMask: false,
        cull: false,
        framebuffer: this.state.accumulationFramebuffer
      },
      () => {
        // Draws sides and top
        super.draw(opts);

        // Draw bottom if needed
        const {topModel} = this.state;
        const {extruded, filled} = this.props;
        if (topModel && extruded && filled) {
          topModel.setUniforms({elevationScale: 0}).draw();
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

    withParameters(
      gl,
      {
        blend: false,
        depthTest: false,
        framebuffer: null
      },
      () => {
        // Draw wireframe on top
        // TODO: Update super.draw() to not draw wireframe
        const {sideModel} = this.state;
        const {wireframe} = this.props;
        if (sideModel && wireframe) {
          sideModel.setDrawMode(GL.LINE_STRIP);
          sideModel.setUniforms({isWireframe: true}).draw();
        }
      }
    );
  }

  _getModels(gl) {
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

    return super._getModels(gl);
  }
}

WBOITLayer.layerName = 'WBOITLayer';
