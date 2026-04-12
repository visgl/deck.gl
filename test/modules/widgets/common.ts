import {Deck} from '@deck.gl/core';
import type {DeckProps, View} from '@deck.gl/core';

const WIDTH = 600;
const HEIGHT = 400;

export class WidgetTester {
  private deck: Deck<any> | null;
  private container: HTMLDivElement | null;

  constructor(deckProps?: DeckProps<any>) {
    const container = document.createElement('div');
    container.id = 'deck-container';
    container.style.cssText = `position: absolute; left: 0; top: 0; width: ${WIDTH}px; height: ${HEIGHT}px;`;
    document.body.appendChild(container);

    this.container = container;
    this.deck = new Deck({
      id: 'widget-test-deck',
      ...deckProps,
      parent: container,
      debug: true
    });
  }

  setProps(deckProps: DeckProps) {
    this.deck?.setProps(deckProps);
  }

  idle(): Promise<void> {
    return new Promise<void>(res => {
      const timer = setInterval(() => {
        if (!this.deck?.needsRedraw({clearRedrawFlags: false})) {
          res();
          clearInterval(timer);
        }
      }, 100);
    });
  }

  findElements(selector: string): Element[] {
    if (!this.container) {
      throw new Error('Tester has been finalized');
    }
    return Array.from(this.container.querySelectorAll(`.deck-widget-container ${selector}`));
  }

  click(
    selector: string,
    opts: {
      offsetX?: number;
      offsetY?: number;
      button?: number;
    } = {}
  ) {
    if (!this.container) {
      throw new Error('Tester has been finalized');
    }
    const element = this.container.querySelector(`.deck-widget-container ${selector}`);
    if (!element) {
      throw new Error(`Element ${selector} is not found`);
    }
    const rect = element.getBoundingClientRect();
    const clientX = rect.left + (opts.offsetX ?? rect.width / 2);
    const clientY = rect.top + (opts.offsetY ?? rect.height / 2);
    const button = opts.button ?? 0;
    const eventInit = {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      button
    };

    element.dispatchEvent(new MouseEvent('mousedown', eventInit));
    element.dispatchEvent(new MouseEvent('mouseup', eventInit));
    element.dispatchEvent(new MouseEvent('click', eventInit));
  }

  destroy() {
    this.deck?.finalize();
    this.container?.remove();
    this.deck = null;
    this.container = null;
  }
}
