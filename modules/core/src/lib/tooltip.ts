// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
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
