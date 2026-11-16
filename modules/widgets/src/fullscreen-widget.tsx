// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {log, Widget, type WidgetProps, type WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';
import {IconButton} from './lib/components/icon-button';

const FALLBACK_CLASS = 'deck-pseudo-fullscreen';
const SCROLL_LOCK = 'deck-fullscreen-scroll-lock';
const fallbackOwners = new WeakMap<Document, FullscreenWidget>();
const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex]';

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
  private root: HTMLElement | null = null;
  private ownerDocument: Document | null = null;
  private generation = 0;
  private pending = false;
  private nativeTarget: HTMLElement | null = null;
  private restoreFallback: (() => void) | null = null;

  constructor(props: FullscreenWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  onRemove() {
    ++this.generation;
    this.ownerDocument?.removeEventListener('fullscreenchange', this.handleNativeChange);
    this.ownerDocument = null;
    const native = this.nativeTarget;
    this.nativeTarget = null;
    if (native && native.ownerDocument.fullscreenElement === native) {
      void native.ownerDocument.exitFullscreen().catch(() => {});
    }
    this.restoreFallback?.();
    this.restoreFallback = null;
    this.fullscreen = false;
    if (this.root) render(null, this.root);
    this.root = null;
  }

  onRenderHTML(rootElement: HTMLElement): void {
    this.root = rootElement;
    if (this.ownerDocument !== rootElement.ownerDocument) {
      this.ownerDocument?.removeEventListener('fullscreenchange', this.handleNativeChange);
      this.ownerDocument = rootElement.ownerDocument;
      this.ownerDocument.addEventListener('fullscreenchange', this.handleNativeChange);
    }
    const isFullscreen = this.getFullscreen();
    render(
      <IconButton
        onClick={() => {
          this.handleClick().catch(err => log.error(err)());
        }}
        label={isFullscreen ? this.props.exitLabel : this.props.enterLabel}
        tooltip={isFullscreen ? this.props.exitTooltip : this.props.enterTooltip}
        className={isFullscreen ? 'deck-widget-fullscreen-exit' : 'deck-widget-fullscreen-enter'}
      />,
      rootElement
    );
  }

  setProps(props: Partial<FullscreenWidgetProps>) {
    if ('container' in props && props.container !== this.props.container) {
      void this.exitFullscreen().catch(err => log.error(err)());
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

  private handleNativeChange = () => this.onFullscreenChange();

  onFullscreenChange() {
    const container = this.getContainer();
    const native = Boolean(container && container.ownerDocument.fullscreenElement === container);
    if (this.restoreFallback) {
      if (!container?.ownerDocument.fullscreenElement) return;
      this.closeFallback();
    }
    if (!native) this.nativeTarget = null;
    this.setFullscreen(native);
  }

  private setFullscreen(fullscreen: boolean) {
    if (fullscreen !== this.fullscreen) {
      this.fullscreen = fullscreen;
      this.props.onFullscreenChange?.(fullscreen);
      this.updateHTML();
    }
  }

  async handleClick() {
    if (this.fullscreen || this.pending) await this.exitFullscreen();
    else await this.requestFullscreen();
  }

  async requestFullscreen() {
    const container = this.getContainer();
    if (!container?.isConnected || this.fullscreen || this.pending) return;

    const doc = container.ownerDocument;
    fallbackOwners.get(doc)?.closeFallback();
    const generation = ++this.generation;
    this.pending = true;
    try {
      if (container.requestFullscreen) {
        try {
          await container.requestFullscreen({navigationUI: 'hide'});
        } catch {
          // A browser can expose the API but deny fullscreen for this element.
        }
        if (generation !== this.generation) {
          if (doc.fullscreenElement === container) await doc.exitFullscreen();
          return;
        }
        if (doc.fullscreenElement === container) {
          this.nativeTarget = container;
          this.setFullscreen(true);
          return;
        }
      }
      if (container.isConnected && !doc.fullscreenElement) this.openFallback(container);
    } finally {
      this.pending = false;
    }
  }

  async exitFullscreen() {
    ++this.generation;
    if (this.restoreFallback) {
      this.closeFallback();
      return;
    }

    const target = this.nativeTarget || this.getContainer();
    if (target && target.ownerDocument.fullscreenElement === target) {
      await target.ownerDocument.exitFullscreen();
    }
    this.nativeTarget = null;
    this.setFullscreen(false);
  }

  togglePseudoFullscreen() {
    if (this.restoreFallback) {
      this.closeFallback();
    } else {
      const container = this.getContainer();
      if (container && !container.ownerDocument.fullscreenElement) this.openFallback(container);
    }
  }

  private closeFallback() {
    const restore = this.restoreFallback;
    this.restoreFallback = null;
    restore?.();
    this.setFullscreen(false);
  }

  private openFallback(container: HTMLElement) {
    const doc = container.ownerDocument;
    const view = doc.defaultView;
    fallbackOwners.get(doc)?.closeFallback();
    fallbackOwners.set(doc, this);

    const previousFocus = doc.activeElement as HTMLElement | null;
    const scrollX = view?.scrollX ?? 0;
    const scrollY = view?.scrollY ?? 0;
    const hadClass = container.classList.contains(FALLBACK_CLASS);
    const locks = [doc.documentElement, doc.body].filter(el => !el.classList.contains(SCROLL_LOCK));
    const attributes = new Map<string, string | null>();
    const setAttribute = (name: string, value: string) => {
      attributes.set(name, container.getAttribute(name));
      container.setAttribute(name, value);
    };

    for (const element of locks) element.classList.add(SCROLL_LOCK);
    container.classList.add(FALLBACK_CLASS);
    setAttribute('role', 'dialog');
    setAttribute('aria-modal', 'true');
    setAttribute('tabindex', '-1');
    if (!container.hasAttribute('aria-label') && !container.hasAttribute('aria-labelledby')) {
      setAttribute('aria-label', 'Fullscreen view');
    }

    let popover = false;
    if (typeof container.showPopover === 'function' && !container.hasAttribute('popover')) {
      setAttribute('popover', 'manual');
      try {
        container.showPopover();
        popover = true;
      } catch {
        container.removeAttribute('popover');
      }
    }

    const focusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        element =>
          element.tabIndex >= 0 &&
          !element.matches(':disabled') &&
          !element.closest('[inert]') &&
          element.getClientRects().length > 0 &&
          view?.getComputedStyle(element).visibility === 'visible'
      );
    const focusInside = () => (focusable()[0] || container).focus({preventScroll: true});
    const onFocus = (event: FocusEvent) => {
      if (!container.contains(event.target as Node)) focusInside();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeFallback();
      } else if (event.key === 'Tab') {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (
          !first ||
          doc.activeElement === container ||
          doc.activeElement === (event.shiftKey ? first : last)
        ) {
          event.preventDefault();
          ((event.shiftKey ? last : first) || container).focus({preventScroll: true});
        }
      }
    };
    const onToggle = (event: Event) => {
      if (
        popover &&
        (event as Event & {newState?: string}).newState === 'closed' &&
        !container.matches(':popover-open')
      )
        this.closeFallback();
    };

    doc.addEventListener('keydown', onKey);
    doc.addEventListener('focusin', onFocus);
    container.addEventListener('toggle', onToggle);
    this.restoreFallback = () => {
      doc.removeEventListener('keydown', onKey);
      doc.removeEventListener('focusin', onFocus);
      container.removeEventListener('toggle', onToggle);
      if (popover && container.matches(':popover-open')) container.hidePopover();
      if (!hadClass) container.classList.remove(FALLBACK_CLASS);
      for (const element of locks) element.classList.remove(SCROLL_LOCK);
      for (const [name, value] of attributes) {
        if (value === null) container.removeAttribute(name);
        else container.setAttribute(name, value);
      }
      fallbackOwners.delete(doc);
      if (container.isConnected) {
        view?.scrollTo({left: scrollX, top: scrollY, behavior: 'instant'});
        if (previousFocus?.isConnected) previousFocus.focus?.({preventScroll: true});
      }
    };
    this.setFullscreen(true);
    if (fallbackOwners.get(doc) === this) {
      const button = this.root?.querySelector('button');
      if (button && container.contains(button)) button.focus({preventScroll: true});
      else focusInside();
    }
  }
}
