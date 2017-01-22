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
    
    this.lights = [new DirectionalLight({
      gl,
      pos: vec3.create(0, 100, 0),
      dir: vec3.create(0, -1, 0)
    })];
    
  }

  preDraw({gl, layerManager}) {
    for (const light of this.lights) {
      //TODO - in reality we only need to do this on scene updates.
      light.depthRender({gl, layerManager});
    }
    layerManager.context.uniforms = {...layerManager.context.uniforms, ...this._getUniforms()};
  }
  
  _getUniforms() {
    let uniforms = {};
    const iden = mat4.create();
    for (let i = 0; i < 5; ++i) {
      //luma.gl doesn't seem to support array uniforms at the moment;
      //if this is changed, an array would make much more sense than
      //named uniforms like this
      if (i < this.lights.length) {
        uniforms["shadowSampler_" + i] = this.lights[i].depthTexture;
        uniforms["shadowMatrix_" + i] = this.lights[i].viewProjectionMatrix;
      } else {
        uniforms["shadowSampler_" + i] = this.dummyDepthTexture
        uniforms["shadowMatrix_" + i] = iden;
      }
    }
    uniforms['numShadows'] = Math.min(5, this.lights.length);
    return uniforms;
  }

  
  draw({gl, layerManager}) {
    const uniforms = {...layerManager.context.uniforms, ...layerManager.context.viewport.getUniforms()};
    this.model.render(uniforms);
  }
  
  
}

