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

export default class LightSource {
  /**
   * @classdesc
   * LightingEffect
   *
   * @class
   * @param color {array} - emitted light color from this source
   * @param intensity {float} - strength of emitted light, in the range of [0, 1]
   */

  constructor(color = [0, 0, 0], intensity = 0) {
    this.color = color;
    this.intensity = intensity;
  }

  getShaders() {
    return {
      vs: reflectionVertex,
      fs: reflectionFragment,
      modules: [],
      shaderCache: this.context.shaderCache
    };
  }

  initialize({gl, layerManager}) {
    this.unitQuad = new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: 'reflection-effect',
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
        })
      })
    );
    this.framebuffer = new Framebuffer(gl, {depth: true});
  }

  preDraw({gl, layerManager}) {
    const {viewport} = layerManager.context;
    /*
     * the renderer already has a reference to this, but we don't have a reference to the renderer.
     * when we refactor the camera code, we should make sure we get a reference to the renderer so
     * that we can keep this in one place.
     */
    const dpi = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    this.framebuffer.resize({width: dpi * viewport.width, height: dpi * viewport.height});
    const pitch = viewport.pitch;
    this.framebuffer.bind();
    /* this is a huge hack around the existing viewport class.
     * TODO in the future, once we implement bona-fide cameras, we really need to fix this.
     */
    layerManager.setViewport(
      new WebMercatorViewport(Object.assign({}, viewport, {pitch: -180 - pitch}))
    );
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    layerManager.drawLayers({pass: 'reflection'});
    layerManager.setViewport(viewport);
    this.framebuffer.unbind();
  }

  draw({gl, layerManager}) {
    /*
     * Render our unit quad.
     * This will cover the entire screen, but will lie behind all other geometry.
     * This quad will sample the previously generated reflection texture
     * in order to create the reflection effect
     */
    this.unitQuad.render({
      reflectionTexture: this.framebuffer.texture,
      reflectionTextureWidth: this.framebuffer.width,
      reflectionTextureHeight: this.framebuffer.height,
      reflectivity: this.reflectivity,
      blur: this.blur
    });
  }

  finalize({gl, layerManager}) {
    /* TODO: Free resources? */
  }
}
export default {
  name: 'lighting',
  vs: lightingShader,
  getUniforms
};

const INITIAL_MODULE_OPTIONS = {};

const DEFAULT_AMBIENT_LIGHT = {color: [0, 0, 0], intensity: 0};
const DEFAULT_POINT_LIGHT = {color: [0, 0, 0], intensity: 0, position: [0, 0, 0]};
const DEFAULT_DIRECTINAL_LIGHT = {color: [0, 0, 0], intensity: 0, direction: [0, 0, 0]};
const DEFAULT_POINT_LIGHT_NUMBER = 0;
const DEFAULT_DIRECTIONAL_LIGHT_NUMBER = 0;


// TODO: support partial update, e.g.
// `lightedModel.setModuleParameters({diffuseRatio: 0.3});`
function getUniforms(opts = INITIAL_MODULE_OPTIONS) {
  if (!opts.lightSettings) {
    return {};
  }

  const {
    numberOfLights = 1,

    lightsPosition = DEFAULT_LIGHTS_POSITION,
    lightsStrength = DEFAULT_LIGHTS_STRENGTH,
    coordinateSystem = COORDINATE_SYSTEM.LNGLAT,
    coordinateOrigin = DEFAULT_COORDINATE_ORIGIN,
    modelMatrix = null,

    ambientRatio = DEFAULT_AMBIENT_RATIO,
    diffuseRatio = DEFAULT_DIFFUSE_RATIO,
    specularRatio = DEFAULT_SPECULAR_RATIO
  } = opts.lightSettings;

  // Pre-project light positions
  const lightsPositionWorld = getMemoizedLightPositions({
    lightsPosition,
    numberOfLights,
    viewport: opts.viewport,
    modelMatrix,
    coordinateSystem: opts.coordinateSystem,
    coordinateOrigin: opts.coordinateOrigin,
    fromCoordinateSystem: coordinateSystem,
    fromCoordinateOrigin: coordinateOrigin
  });

  return {
    lighting_lightPositions: lightsPositionWorld,
    lighting_lightStrengths: lightsStrength,
    lighting_ambientRatio: ambientRatio,
    lighting_diffuseRatio: diffuseRatio,
    lighting_specularRatio: specularRatio,
    lighting_numberOfLights: numberOfLights
  };
}

// Pre-project light positions
function preprojectLightPositions({
  lightsPosition,
  numberOfLights,
  viewport,
  modelMatrix,
  coordinateSystem,
  coordinateOrigin,
  fromCoordinateSystem,
  fromCoordinateOrigin
}) {
  const projectionParameters = {
    viewport,
    modelMatrix,
    coordinateSystem,
    coordinateOrigin,
    fromCoordinateSystem,
    fromCoordinateOrigin
  };

  const lightsPositionWorld = [];
  for (let i = 0; i < numberOfLights; i++) {
    const position = projectPosition(lightsPosition.slice(i * 3, i * 3 + 3), projectionParameters);

    lightsPositionWorld[i * 3] = position[0];
    lightsPositionWorld[i * 3 + 1] = position[1];
    lightsPositionWorld[i * 3 + 2] = position[2];
  }

  return lightsPositionWorld;
}
