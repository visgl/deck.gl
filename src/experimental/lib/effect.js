let counter = 0;

export default class Effect {

  constructor() {
    this.count = counter++;
    this.visible = true;
    this.priority = 0;
    this.needsRedraw = false;
  }

  initialize() {
  }

  finalize() {
  }

  preDraw({gl, deckgl}) {
  }

  draw({gl, deckgl}) {
  }

  setNeedsRedraw(redraw = true) {
    this.needsRedraw = redraw;
  }
}
