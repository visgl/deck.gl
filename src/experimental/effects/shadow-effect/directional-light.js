import {vec3, vec4, mat4, quat} from 'gl-matrix';
import {GL, Framebuffer, Texture2D} from 'luma.gl';

export default class DirectionalLight {
  constructor({
		gl,
    pos=vec3.create(),
    dir=vec3.fromValues(0, 0, 1),
    shadowCameraWidth=800,
    shadowCameraHeight=600,
    projectionMatrix = mat4.ortho(mat4.create(), -400, 400, -300, 300, 0, 1000),
  }) {
    this.pos = pos;
    this.dir = dir;
    this.projectionMatrix = projectionMatrix;
    this.viewMatrix = mat4.create();
    this.viewProjectionMatrix = mat4.create();
    
    this.updateMatrices();
    
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
  }
  
  updateMatrices() {
    var q = quat.create();
    // this does not force  the camera to remain oriented "up"
    // is that a problem?
    quat.rotationTo(q, vec3.fromValues(0, 0, -1), this.dir);
    mat4.fromRotationTranslation(this.viewMatrix, q, this.pos);
    mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
  }
  
  depthRender({gl, layerManager}) {
    this.framebuffer.bind();
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    //change to depth rendering
    layerManager.drawLayers();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
