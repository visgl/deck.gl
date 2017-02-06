import {GL, Framebuffer, Texture2D} from 'luma.gl';
import {PerspectiveViewport} from '../../../lib/viewports';
import {WebMercatorViewport} from '../../../lib/viewports';

export default class DirectionalLight {
  constructor(options) {
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
  
  getViewport(oldViewport) {
    //todo: maybe cache this?
    return new WebMercatorViewport({
      width: this.framebuffer.width,
      height: this.framebuffer.height,
      //latitude: 37.7749,
      //longitude: -122.4194,
      latitude: oldViewport.latitude,
      longitude: oldViewport.longitude,
      zoom: oldViewport.zoom,
      pitch: 0
    });
    
  }

  depthRender({gl, layerManager}) {
    const oldViewport = layerManager.context.viewport;
    const viewport = this.getViewport(oldViewport);
    this.framebuffer.bind();
    layerManager.setViewport(viewport);
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    layerManager.drawLayers({pass: 'shadow'});
    layerManager.setViewport(oldViewport);
    this.framebuffer.unbind();
  }
}
