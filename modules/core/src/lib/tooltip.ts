// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Widget, WidgetPlacement} from './widget-manager';
import type {PickingInfo} from './picking/pick-info';
import type Viewport from '../viewports/viewport';
import type Deck from './deck';

/* global document */
const defaultStyle: Partial<CSSStyleDeclaration> = {
  zIndex: '1',
  position: 'absolute',
  pointerEvents: 'none',
  color: '#a0a7b4',
  backgroundColor: '#29323c',
  padding: '10px',
  top: '0',
  left: '0',
  display: 'none'
};

export type TooltipContent =
  | null
  | string
  | {
      text?: string;
      html?: string;
      className?: string;
      style?: Partial<CSSStyleDeclaration>;
    };

export default class Tooltip implements Widget {
  id = 'default-tooltip';
  placement: WidgetPlacement = 'fill';
  props = {};
  isVisible: boolean = false;
  deck?: Deck<any>;
  element?: HTMLDivElement;
  lastViewport?: Viewport;

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'deck-tooltip';
    Object.assign(el.style, defaultStyle);

    this.deck = deck;
    this.element = el;

    return el;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  setProps() {}

  onViewportChange(viewport: Viewport) {
    if (this.isVisible && viewport.id === this.lastViewport?.id && viewport !== this.lastViewport) {
      // Camera has moved, clear tooltip
      this.setTooltip(null);
    }
  }

  onHover(info: PickingInfo) {
    const {deck} = this;
    const getTooltip = deck && deck.props.getTooltip;
    if (!getTooltip) {
      return;
    }
    const displayInfo = getTooltip(info);
    this.lastViewport = info.viewport;
    this.setTooltip(displayInfo, info.x, info.y);
  }

  setTooltip(displayInfo: TooltipContent, x?: number, y?: number): void {
    const el = this.element;
    if (!el) {
      return;
    }

    if (typeof displayInfo === 'string') {
      el.innerText = displayInfo;
    } else if (!displayInfo) {
      this.isVisible = false;
      el.style.display = 'none';
      return;
    } else {
      if (displayInfo.text) {
        el.innerText = displayInfo.text;
      }
      if (displayInfo.html) {
        el.innerHTML = displayInfo.html;
      }
      if (displayInfo.className) {
        el.className = displayInfo.className;
      }
    }
    this.isVisible = true;
    el.style.display = 'block';
    el.style.transform = `translate(${x}px, ${y}px)`;

    if (displayInfo && typeof displayInfo === 'object' && 'style' in displayInfo) {
      Object.assign(el.style, displayInfo.style);
    }
  }
}
