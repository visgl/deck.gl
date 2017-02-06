import {GL, Framebuffer, Model, Geometry, Texture2D} from 'luma.gl';
import {vec3, mat4} from 'gl-matrix';
import {Effect} from '../../lib';
import {assembleShaders} from '../../../shader-utils';
import {readFileSync} from 'fs';
import {join} from 'path';
import DirectionalLight from './directional-light';
import { getUniformsFromViewport } from '../../../lib/viewport-uniforms';


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
    
    
    const shaders = assembleShaders(gl, this.getShaders());
    
    //this is a bit of a hack in order to cover the entire map
    const max_lat = 89.99;
    const max_lon = 179.99;
    
    this.model = new Model({
      gl,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertices: new Float32Array([max_lon, max_lat, 0, -max_lon, max_lat, 0, -max_lon, -max_lat, 0, max_lon, -max_lat, 0])
      }),
    });

    this.lights = [new DirectionalLight({
      gl,
      width: 800,
      height: 600,
    })];
  }

  preDraw({gl, layerManager}) {
    for (const light of this.lights) {
      //TODO - in reality we only need to do this on scene updates.
      light.depthRender({gl, layerManager});
    }
    Object.assign(layerManager.context.uniforms, this._getUniforms({layerManager}));
    //layerManager.context.uniforms = {...layerManager.context.uniforms, ...this._getUniforms({layerManager})};
  }
  
  _getUniforms({layerManager}) {
    let uniforms = {};
    const iden = mat4.create();
    for (let i = 0; i < 5; ++i) {
      //luma.gl doesn't seem to support array uniforms at the moment;
      //if this is changed, an array would make much more sense than
      //named uniforms like this
      if (i < this.lights.length) {
        uniforms["shadowSampler_" + i] = this.lights[i].depthTexture;
        let lightViewport = this.lights[i].getViewport(layerManager.context.viewport);
        let matrix = lightViewport.viewProjectionMatrix;
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
    const uniforms = Object.assign({}, layerManager.context.uniforms, getUniformsFromViewport(layerManager.context.viewport));
    this.model.render(uniforms);
  }
  
  
}

