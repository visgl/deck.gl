// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {Widget, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './lib/components';

export type FullscreenWidgetProps = {
  id?: string;
  /**
   * Widget positioning within the view. Default 'top-left'.
   */
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
};

export class FullscreenWidget extends Widget<FullscreenWidgetProps> {
  static defaultProps: Required<FullscreenWidgetProps> = {
    id: 'fullscreen',
    placement: 'top-left',
    enterLabel: 'Enter Fullscreen',
    exitLabel: 'Exit Fullscreen',
    container: undefined!,
    className: '',
    style: {}
  };
  className = 'deck-widget-fullscreen';
  placement: WidgetPlacement = 'top-left';

  fullscreen: boolean = false;

  constructor(props: FullscreenWidgetProps = {}) {
    super(props, FullscreenWidget.defaultProps);
    this.placement = props.placement ?? this.placement;
  }

  onAdd(): void {
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
  }

  onRemove() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const {enterLabel, exitLabel} = this.props;
    const ui = (
      <IconButton
        onClick={this.handleClick.bind(this)}
        label={this.fullscreen ? exitLabel : enterLabel}
        className={this.fullscreen ? 'deck-widget-fullscreen-exit' : 'deck-widget-fullscreen-enter'}
      />
    );
    render(ui, rootElement);
  }

  setProps(props: Partial<FullscreenWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    super.setProps(props);
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
    this.updateHTML();
  }

  async handleClick() {
    if (this.fullscreen) {
      await this.exitFullscreen();
    } else {
      await this.requestFullscreen();
    }
    this.updateHTML();
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
