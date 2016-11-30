let counter = 0;

export default class Effect {

  constructor() {
    this.count = counter++;
    this.visible = true;
    this.priority = 0;
    this.needsRedraw = false;
  }

  /**
   * subclasses should override to set up any resources needed
   */
  initialize({gl, layerManager}) {
  }
  /**
   * and subclasses should free those resources here
   */
  finalize({gl, layerManager}) {
  }
  /**
   * override for a callback immediately before drawing each frame
   */
  preDraw({gl, layerManager}) {
  }
  /**
   * override for a callback immediately after drawing a frame's layers
   */
  draw({gl, layerManager}) {
  }

  setNeedsRedraw(redraw = true) {
    this.needsRedraw = redraw;
  }
}
