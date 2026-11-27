// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {log, Widget, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './lib/components/icon-button';

/* eslint-enable max-len */

/** Class that expands the existing container to the viewport. */
const FALLBACK_CLASS = 'deck-pseudo-fullscreen';

export type FullscreenWidgetProps = WidgetProps & {
  id?: string;
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. */
  viewId?: string | null;
  /** Tooltip message when out of fullscreen. */
  enterLabel?: string;
  /** Tooltip message when fullscreen. */
  exitLabel?: string;
  /** Custom tooltip content when out of fullscreen. Overrides enterLabel for tooltip display. */
  enterTooltip?: string | HTMLElement | false;
  /** Custom tooltip content when fullscreen. Overrides exitLabel for tooltip display. */
  exitTooltip?: string | HTMLElement | false;
  /**
   * A compatible DOM element which should be made full screen. By default, the map container element will be made full screen.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements
   */
  container?: HTMLElement;
  /**
   * Callback when fullscreen state changes (via user click or browser fullscreen events).
   */
  onFullscreenChange?: (fullscreen: boolean) => void;
};

export class FullscreenWidget extends Widget<FullscreenWidgetProps> {
  static defaultProps: Required<FullscreenWidgetProps> = {
    ...Widget.defaultProps,
    id: 'fullscreen',
    placement: 'top-left',
    viewId: null,
    enterLabel: 'Enter Fullscreen',
    exitLabel: 'Exit Fullscreen',
    enterTooltip: undefined!,
    exitTooltip: undefined!,
    container: undefined!,
    onFullscreenChange: () => {}
  };

  className = 'deck-widget-fullscreen';
  placement: WidgetPlacement = 'top-left';
  fullscreen: boolean = false;
  private restoreFallback: (() => void) | null = null;
  private fallbackRevision = 0;
  private handleNativeChange = () => this.onFullscreenChange();

  constructor(props: FullscreenWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  onAdd(): void {
    document.addEventListener('fullscreenchange', this.handleNativeChange);
  }

  onRemove() {
    document.removeEventListener('fullscreenchange', this.handleNativeChange);
    this.fallbackRevision++;
    if (this.restoreFallback) {
      this.restoreFallback();
      this.restoreFallback = null;
      this.fullscreen = false;
    }
  }

  onRenderHTML(rootElement: HTMLElement): void {
    const isFullscreen = this.getFullscreen();
    render(
      <IconButton
        onClick={async () => {
          try {
            await this.handleClick();
          } catch (error) {
            log.error(String(error))();
          }
        }}
        label={isFullscreen ? this.props.exitLabel : this.props.enterLabel}
        tooltip={isFullscreen ? this.props.exitTooltip : this.props.enterTooltip}
        className={isFullscreen ? 'deck-widget-fullscreen-exit' : 'deck-widget-fullscreen-enter'}
      />,
      rootElement
    );
  }

  setProps(props: Partial<FullscreenWidgetProps>) {
    if (this.restoreFallback && 'container' in props && props.container !== this.props.container) {
      this.togglePseudoFullscreen();
    }
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  getContainer() {
    return this.props.container || this.deck?.props.parent || this.deck?.getCanvas()?.parentElement;
  }

  getFullscreen(): boolean {
    return this.fullscreen;
  }

  onFullscreenChange() {
    const fullscreen =
      Boolean(this.restoreFallback) || document.fullscreenElement === this.getContainer();
    if (fullscreen !== this.fullscreen) {
      this.fullscreen = fullscreen;
      this.props.onFullscreenChange?.(fullscreen);
      this.updateHTML();
    }
  }

  async handleClick() {
    const isFullscreen = this.getFullscreen();
    if (isFullscreen) {
      await this.exitFullscreen();
    } else {
      await this.requestFullscreen();
    }
    // Note: updateHTML is called by onFullscreenChange event handler
  }

  async requestFullscreen() {
    const container = this.getContainer();
    const revision = this.fallbackRevision;
    if (container?.requestFullscreen) {
      try {
        await container.requestFullscreen({navigationUI: 'hide'});
        return;
      } catch {
        // The browser exposes the API but does not allow this element to enter fullscreen.
      }
    }
    if (
      container?.isConnected &&
      container === this.getContainer() &&
      revision === this.fallbackRevision &&
      !this.restoreFallback &&
      !document.fullscreenElement
    ) {
      this.togglePseudoFullscreen();
    }
  }

  async exitFullscreen() {
    if (this.restoreFallback) {
      this.togglePseudoFullscreen();
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  }

  togglePseudoFullscreen() {
    if (this.restoreFallback) {
      this.restoreFallback();
      this.restoreFallback = null;
    } else {
      const container = this.getContainer();
      if (!container) return;
      this.openFallback(container);
    }
    this.onFullscreenChange();
  }

  /** Expand the existing container, using the top layer to escape clipping ancestors. */
  private openFallback(container: HTMLElement) {
    container.classList.add(FALLBACK_CLASS);
    let popover = false;
    if (typeof container.showPopover === 'function' && !container.hasAttribute('popover')) {
      container.setAttribute('popover', 'manual');
      try {
        container.showPopover();
        popover = true;
      } catch {
        container.removeAttribute('popover');
      }
    }

    this.restoreFallback = () => {
      if (popover) {
        container.hidePopover();
        container.removeAttribute('popover');
      }
      container.classList.remove(FALLBACK_CLASS);
    };
  }
}
