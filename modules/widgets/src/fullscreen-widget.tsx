/* global document */
import {_deepEqual as deepEqual} from '@deck.gl/core';
import type {Deck, Widget, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './components';

interface FullscreenWidgetProps {
  id: string;
  placement?: WidgetPlacement;
  /**
   * A [compatible DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements) which should be made full screen.
   * By default, the map container element will be made full screen.
   */
  /* eslint-enable max-len */
  container?: HTMLElement;
  /**
   * Tooltip message when out of fullscreen.
   */
  enterLabel?: string;
  /**
   * Tooltip message when fullscreen.
   */
  exitLabel?: string;
  /**
   * CSS inline style overrides.
   */
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Additional CSS class.
   */
  className?: string;
}

export class FullscreenWidget implements Widget<FullscreenWidgetProps> {
  id = 'fullscreen';
  props: FullscreenWidgetProps;
  placement: WidgetPlacement = 'top-left';

  deck?: Deck<any>;
  element?: HTMLDivElement;

  fullscreen: boolean = false;

  constructor(props: FullscreenWidgetProps) {
    this.id = props.id || 'fullscreen';
    this.placement = props.placement || 'top-left';
    props.enterLabel = props.enterLabel || 'Enter Fullscreen';
    props.exitLabel = props.exitLabel || 'Exit Fullscreen';
    props.style = props.style || {};
    this.props = props;
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const {style, className} = this.props;
    const el = document.createElement('div');
    el.classList.add('deck-widget', 'deck-widget-fullscreen');
    if (className) el.classList.add(className);
    if (style) {
      Object.entries(style).map(([key, value]) => el.style.setProperty(key, value as string));
    }
    this.deck = deck;
    this.element = el;
    this.update();
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    return el;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
  }

  private update() {
    const {enterLabel, exitLabel} = this.props;
    const el = this.element;
    if (!el) {
      return;
    }

    const ui = (
      <IconButton
        onClick={this.handleClick.bind(this)}
        label={this.fullscreen ? exitLabel : enterLabel}
        className={this.fullscreen ? 'deck-widget-fullscreen-exit' : 'deck-widget-fullscreen-enter'}
      />
    );
    render(ui, el);
  }

  setProps(props: Partial<FullscreenWidgetProps>) {
    const oldProps = this.props;
    const el = this.element;
    if (el) {
      if (oldProps.className !== props.className) {
        if (oldProps.className) el.classList.remove(oldProps.className);
        if (props.className) el.classList.add(props.className);
      }

      if (!deepEqual(oldProps.style, props.style, 1)) {
        if (oldProps.style) {
          Object.entries(oldProps.style).map(([key]) => el.style.removeProperty(key));
        }
        if (props.style) {
          Object.entries(props.style).map(([key, value]) =>
            el.style.setProperty(key, value as string)
          );
        }
      }
    }

    Object.assign(this.props, props);
  }

  getContainer() {
    return this.props.container || this.deck?.getCanvas()?.parentElement;
  }

  onFullscreenChange() {
    const prevFullscreen = this.fullscreen;
    const fullscreen = document.fullscreenElement === this.getContainer();
    if (prevFullscreen !== fullscreen) {
      this.fullscreen = !this.fullscreen;
    }
    this.update();
  }

  async handleClick() {
    if (this.fullscreen) {
      await this.exitFullscreen();
    } else {
      await this.requestFullscreen();
    }
    this.update();
  }

  async requestFullscreen() {
    const container = this.getContainer();
    if (container?.requestFullscreen) {
      await container.requestFullscreen({navigationUI: 'hide'});
    } else {
      this.togglePseudoFullscreen();
    }
  }

  async exitFullscreen() {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else {
      this.togglePseudoFullscreen();
    }
  }

  togglePseudoFullscreen() {
    this.getContainer()?.classList.toggle('deck-pseudo-fullscreen');
  }
}
