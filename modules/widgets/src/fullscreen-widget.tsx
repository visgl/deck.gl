import type {Deck, Widget, WidgetPlacement} from '@deck.gl/core';
import {h, render} from 'preact';

/* global document */
const defaultStyle: Readonly<Partial<CSSStyleDeclaration>> = {
  pointerEvents: 'auto',
  color: '#a0a7b4',
  backgroundColor: '#29323c',
  margin: '10px',
  height: '30px',
  width: '30px'
};

interface FullscreenWidgetProps {
  id: string;
  viewId?: string | null;
  placement?: WidgetPlacement;
}

class FullscreenWidget implements Widget<FullscreenWidgetProps> {
  id = 'fullscreen';
  props: FullscreenWidgetProps;
  placement: WidgetPlacement = 'top-left';
  viewId = null;

  isFullscreen: boolean = false;
  deck?: Deck;
  element?: HTMLDivElement;

  constructor(props: FullscreenWidgetProps) {
    this.id = props.id || 'fullscreen';
    this.viewId = props.viewId || null;
    this.placement = props.placement || 'top-left';
    this.props = props;
  }

  onAdd({deck}: {deck: Deck}): HTMLDivElement {
    const widget = document.createElement('div');
    widget.className = 'deck-fullscreen-widget';
    // Object.assign(el.style, defaultStyle);
    // el.addEventListener('click', () => this.handleClick());
    const v = <div>Hello World</div>;
    // const vdom = h('h1', null, 'Hello World!');
    render(v, widget);

    this.deck = deck;
    this.element = widget;

    return widget;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  setProps(props: FullscreenWidgetProps) {
    Object.assign(this.props, props);
  }

  handleClick() {
    if (!document.fullscreenElement) {
      this.requestFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  async requestFullscreen() {
    // @ts-expect-error canvas is protected. Merge https://github.com/visgl/deck.gl/pull/7919?
    await this.deck?.canvas?.parentElement?.requestFullscreen({navigationUI: 'hide'});
    this.isFullscreen = true;
  }

  async exitFullscreen() {
    await document.exitFullscreen();
    this.isFullscreen = false;
  }
}

export default FullscreenWidget;
