/* global document */
import {_deepEqual as deepEqual} from '@deck.gl/core';
import type {Deck, Widget, WidgetPlacement} from '@deck.gl/core';
import {h, render} from 'preact';

interface FullscreenWidgetProps {
  id: string;
  viewId?: string | null;
  placement?: WidgetPlacement;
  /**
   * A [compatible DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements) which should be made full screen.
   * By default, the map container element will be made full screen.
   */
  /* eslint-enable max-len */
  container?: HTMLElement;
  label?: string;
  style?: Partial<CSSStyleDeclaration>;
  className?: string;
}

export class FullscreenWidget implements Widget<FullscreenWidgetProps> {
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
    props.label = props.label || 'Toggle Fullscreen';
    props.style = props.style || {};
    this.props = props;
  }

  onAdd({deck}: {deck: Deck}): HTMLDivElement {
    const {label, style, className} = this.props;
    const el = document.createElement('div');
    el.classList.add('deckgl-widget', 'deckgl-widget-fullscreen');
    if (className) el.classList.add(className);
    Object.entries(style).map(([key, value]) => el.style.setProperty(key, value));
    const ui = <Button onClick={() => this.handleClick()} label={label} />;
    render(ui, el);

    this.deck = deck;
    this.element = el;

    return el;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  setProps(props: FullscreenWidgetProps) {
    const oldProps = this.props;
    const el = this.element;
    if (oldProps.className !== props.className) {
      if (oldProps.className) el.classList.remove(oldProps.className);
      if (props.className) el.classList.add(props.className);
    }

    if (!deepEqual(oldProps.style, props.style, 1)) {
      Object.entries(oldProps.style).map(([key]) => el.style.removeProperty(key));
      Object.entries(props.style).map(([key, value]) => el.style.setProperty(key, value));
    }

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
    const container = this.props.container || this.deck?.canvas?.parentElement;
    await container.requestFullscreen({navigationUI: 'hide'});
    this.isFullscreen = true;
  }

  async exitFullscreen() {
    await document.exitFullscreen();
    this.isFullscreen = false;
  }
}

const Button = props => {
  const {label, onClick} = props;
  return (
    <div className="deckgl-widget-button-border">
      <button className="deckgl-widget-button" type="button" onClick={onClick} title={label}>
        {props.children}
      </button>
    </div>
  );
};

