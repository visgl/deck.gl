import {GL, Framebuffer, Model, Geometry, Texture2D} from 'luma.gl';
import {vec3, mat4} from 'gl-matrix';
import {Effect} from '../../lib';
import {assembleShaders} from '../../../shader-utils';
import {readFileSync} from 'fs';
import {join} from 'path';
import DirectionalLight from './directional-light';

export default class ShadowEffect extends Effect {
  constructor({
      lights=[],
      maxLights=5, // make sure this number matches the array size in shaders
    }) {
    super();
    this.setNeedsRedraw();
    this.maxLights = maxLights;
    this.lights = lights;
  }

  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './shadow-effect-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './shadow-effect-fragment.glsl'), 'utf8')
    };
  }

  initialize({gl, layerManager}) {
    //we'll need a framebuffer for each lightsource;
    //do this once depth rendering works
    this.depthTextureExtension = gl.getExtension('WEBGL_depth_texture');
    if (!this.depthTextureExtension) {
      this.enabled = false;
      return;
    }
    // Keep a dummy depth texture around to act as
    // a placeholder in our uniforms.
    this.dummyDepthTexture = new Texture2D(gl, {
      width: 1,
      height: 1,
      format: gl.DEPTH_COMPONENT,
      type: gl.UNSIGNED_INT
    });
    
    
    //this is a bit of a hack in order to cover the entire map
    const max_lat = 89.99;
    const max_lon = 179.99;
    
    this.model = new Model({
      gl,
      ...assembleShaders(gl, this.getShaders()),
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertices: new Float32Array([max_lon, max_lat, 0, -max_lon, max_lat, 0, -max_lon, -max_lat, 0, max_lon, -max_lat, 0])
      })
    });
    /*
    this.lights = [new DirectionalLight({
      gl,
      width: 800,
      height: 600,
      latitude: 37.70882935609515,
      longitude: -122.41451343553304,
      zoom: 10.34018170187848,
      pitch: 60,
      bearing: 1.4845360824741647,
      tileSize:512
    })];
    */
    
    //should correspond to a viewport looking at SF from an angle
    
    this.lights = [new DirectionalLight({
      gl,
      width: 800,
      height: 600,
      latitude: 37.760714962131146,
      longitude: -122.42737519179084,
      zoom: 12.1434015457921,
      pitch: 48.761939607621386,
      bearing: 74.2268041237113,
      tileSize: 512
    })];
  }

  preDraw({gl, layerManager}) {
    for (const light of this.lights) {
      //TODO - in reality we only need to do this on scene updates.
      light.options.zoom = layerManager.context.viewport.zoom;
      light.depthRender({gl, layerManager});
    }
    layerManager.context.uniforms = {...layerManager.context.uniforms, ...this._getUniforms({layerManager})};
  }
  
  _getUniforms({layerManager}) {
    let uniforms = {};
    const iden = mat4.create();
    for (let i = 0; i < 5; ++i) {
      //luma.gl doesn't seem to support array uniforms at the moment;
      //if this is changed, an array would make much more sense than
      //named uniforms like this
      if (i < this.lights.length) {
        this.lights[i].options.zoom = layerManager.context.viewport.zoom;
        uniforms["shadowSampler_" + i] = this.lights[i].depthTexture;
        let lightViewport = this.lights[i].getViewport();
        let matrix = lightViewport.glProjectionMatrix;
        uniforms["shadowMatrix_" + i] = matrix;
      } else {
        uniforms["shadowSampler_" + i] = this.dummyDepthTexture
        uniforms["shadowMatrix_" + i] = iden;
      }
    }
    uniforms['numShadows'] = Math.min(5, this.lights.length);
    return uniforms;
  }

  
  draw({gl, layerManager}) {
    const uniforms = {...layerManager.context.uniforms, ...layerManager.context.viewport.getUniforms({layerManager})};
    this.model.render(uniforms);
  }
  
  
}

