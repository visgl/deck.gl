import {GL, Framebuffer, Texture2D} from 'luma.gl';
import {Effect} from '../../lib';
import assert from 'assert';

/*
 * This should be made a subclass of a more general effect class once other
 * effects are implemented.
*/

export default class ReflectionEffect extends Effect{
  constructor(height=0) {
    super();
    this.height = height;
    this.framebuffer = null;
    this.setNeedsRedraw()
  }
  
  preDraw({gl, deckgl}) {
  }


  draw({gl, deckgl}) {
    const viewport = deckgl.layerManager.context.viewport;
    const top_left = viewport.unproject([0, 0]);
    const bottom_right = viewport.unproject([viewport.width, viewport.height]);
  }


  setNeedsRedraw(redraw = true) {
    this.needsRedraw = redraw;
  }
}
