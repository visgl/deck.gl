import type {Deck, Widget} from '@deck.gl/core';

/* global document */
const defaultStyle: Partial<CSSStyleDeclaration> = {
  pointerEvents: 'auto',
  color: '#a0a7b4',
  backgroundColor: '#29323c',
  margin: '10px',
  height: '30px',
  width: '30px'
};

class FullscreenWidget implements Widget {
  isFullscreen: boolean = false;
  deck?: Deck;
  element?: HTMLDivElement;

  onAdd({deck}: {deck: Deck}): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'deck-fullscreen-widget';
    Object.assign(el.style, defaultStyle);
    el.addEventListener('click', () => this.handleClick());

    this.deck = deck;
    this.element = el;

    return el;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  handleClick() {
    if (!document.fullscreenElement) {
      this.requestFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  async requestFullscreen() {
    // @ts-ignore canvas is protected. Merge https://github.com/visgl/deck.gl/pull/7919?
    await this.deck?.canvas?.parentElement?.requestFullscreen({navigationUI: 'hide'});
    this.isFullscreen = true;
  }

  async exitFullscreen() {
    await document.exitFullscreen();
    this.isFullscreen = false;
  }
}

export default FullscreenWidget;
