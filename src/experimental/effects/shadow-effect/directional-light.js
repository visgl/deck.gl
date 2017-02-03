import {GL, Framebuffer, Texture2D} from 'luma.gl';
import {Viewport} from '../../../lib/viewports';

export default class DirectionalLight {
  /*
    constructor({
    gl,
    pos=vec3.create(),
    dir=vec3.fromValues(0, 0, 1),
    shadowCameraWidth=800,
    shadowCameraHeight=600,
    projectionMatrix = mat4.ortho(mat4.create(), -4000, 4000, -3000, 3000, -100000, 100000),
  }) {
    this.pos = pos;
    this.dir = dir;
    this.projectionMatrix = projectionMatrix;
    this.viewMatrix = mat4.create();
    this.viewProjectionMatrix = mat4.create();
    
    //this.updateMatrices();
    
    this.framebuffer = new Framebuffer(gl, {
      width: shadowCameraWidth,
      height: shadowCameraHeight
    });
    
    this.depthTexture = new Texture2D(gl, {
      width: shadowCameraWidth,
      height: shadowCameraHeight,
      format: gl.DEPTH_COMPONENT,
      type: gl.UNSIGNED_INT
    });
    this.framebuffer.attachTexture({
      texture: this.depthTexture,
      attachment: GL.DEPTH_ATTACHMENT
    });
  }*/
  constructor(options) {
    this.options = options
    this.gl = options.gl
    const shadowCameraWidth = options.shadowCameraWidth || 800;
    const shadowCameraHeight = options.shadowCameraHeight || 600;
    
    this.framebuffer = new Framebuffer(this.gl, {
      width: shadowCameraWidth,
      height: shadowCameraHeight
    });
    
    this.depthTexture = new Texture2D(this.gl, {
      width: shadowCameraWidth,
      height: shadowCameraHeight,
      format: GL.DEPTH_COMPONENT,
      type: GL.UNSIGNED_INT
    });
    this.framebuffer.attachTexture({
      texture: this.depthTexture,
      attachment: GL.DEPTH_ATTACHMENT
    });
  }
  
  getViewport() {
    // maybe cache this if it doesn't need to change?
    return new Viewport(this.options);
  }
  
  /*updateMatrices({layerManager}) {
    const worldPos = layerManager.context.viewport.project(this.pos);
    const worldTranslation =  vec3.fromValues(-worldPos[0], -worldPos[1], -worldPos[2]);
    var q = quat.create();
    // this does not force  the camera to remain oriented "up"
    // is that a problem?
    quat.rotationTo(q, vec3.fromValues(0, 0, -1), this.dir);
    mat4.fromRotationTranslation(this.viewMatrix, q, worldTranslation);
    mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    console.log(this.viewProjectionMatrix);
  }*/
  
  depthRender({gl, layerManager}) {
    const viewport = this.getViewport();
    const oldViewport = layerManager.context.viewport;
    this.framebuffer.bind();
    layerManager.context.viewport = viewport;
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    layerManager.drawLayers();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    layerManager.context.viewport = oldViewport;
  }
}
