/* eslint-disable no-invalid-this */

import {initializeResources, render, finalizeResources} from './commons';

export default function createDeckRenderer(DeckProps, externalRenderers) {
  class DeckRenderer {
    constructor(view, props) {
      this.view = view;
      this.deck = new DeckProps(props);
    }

    setup(context) {
      const gl = context.gl;
      initializeResources.call(this, gl);

      this.deck.on('change', props => this.deckInstance.setProps(props));

      this.deckInstance.setProps(this.deck.toJSON());
    }

    dispose() {
      finalizeResources.call(this);
    }

    redraw() {
      externalRenderers.requestRender(this.view);
    }

    render(context) {
      const [width, height] = this.view.size;

      render.call(this, {
        gl: context.gl,
        width,
        height,
        viewState: {
          latitude: this.view.center.latitude,
          longitude: this.view.center.longitude,
          zoom: this.view.zoom,
          bearing: this.view.camera.heading,
          pitch: this.view.camera.tilt
        }
      });
    }
  }

  return DeckRenderer;
}
