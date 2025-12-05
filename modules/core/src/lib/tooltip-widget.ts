// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget, WidgetProps} from './widget';
import type {WidgetPlacement} from './widget-manager';
import type {PickingInfo} from './picking/pick-info';
import type Viewport from '../viewports/viewport';

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

export type TooltipWidgetProps = WidgetProps;

export class TooltipWidget extends Widget<TooltipWidgetProps> {
  static defaultProps: Required<TooltipWidgetProps> = {
    ...Widget.defaultProps
  };

  id = 'default-tooltip';
  placement: WidgetPlacement = 'fill';
  className = 'deck-tooltip';

  isVisible: boolean = false;
  lastViewport?: Viewport;

  constructor(props: TooltipWidgetProps = {}) {
    super(props);
    this.setProps(props);
  }

  // TODO(ib) - does this really need to be overridden?
  onCreateRootElement() {
    const el = document.createElement('div');
    el.className = this.className;
    Object.assign(el.style, defaultStyle);
    return el;
  }

  onRenderHTML(rootElement: HTMLElement): void {}

  onViewportChange(viewport: Viewport) {
    if (
      this.isVisible &&
      viewport.id === this.lastViewport?.id &&
      !viewport.equals(this.lastViewport)
    ) {
      // Camera has moved, clear tooltip
      this.setTooltip(null);
    }
    // Always update lastViewport from the render loop to ensure consistent
    // viewport source for comparisons (avoids mismatches with picking viewports)
    this.lastViewport = viewport;
  }

  onHover(info: PickingInfo) {
    const {deck} = this;
    const getTooltip = deck && deck.props.getTooltip;
    if (!getTooltip) {
      return;
    }
    const displayInfo = getTooltip(info);
    this.setTooltip(displayInfo, info.x, info.y);
  }

  setTooltip(displayInfo: TooltipContent, x?: number, y?: number): void {
    const el = this.rootElement;
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
