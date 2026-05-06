// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

const TOOLTIP_ATTR = 'data-deck-widget-tooltip';
const OFFSET = 8;
const widgetTooltips = new WeakMap<HTMLElement, WidgetTooltip>();

/** Updates delegated tooltip handling after a widget renders its HTML. */
export function updateWidgetTooltip(rootElement: HTMLElement): void {
  for (const target of rootElement.querySelectorAll(`[${TOOLTIP_ATTR}][title]`)) {
    target.removeAttribute('title');
  }

  let tooltip = widgetTooltips.get(rootElement);
  if (!tooltip) {
    tooltip = new WidgetTooltip();
    widgetTooltips.set(rootElement, tooltip);
  }
  tooltip.update(rootElement);
}

class WidgetTooltip {
  private element: HTMLDivElement | null = null;
  private listenerRoot: HTMLElement | null = null;

  update(root: HTMLElement): void {
    this.hide();
    if (this.listenerRoot === root) return;

    this.listenerRoot = root;
    root.addEventListener('pointerover', this.onPointerOver);
    root.addEventListener('pointerout', this.onPointerOut);
    root.addEventListener('focusin', this.onFocusIn);
    root.addEventListener('focusout', this.onFocusOut);
    root.addEventListener('keydown', this.onKeyDown);
  }

  private hide(): void {
    this.element?.remove();
    this.element = null;
  }

  private onPointerOver = (event: PointerEvent): void => {
    const target = this.getTarget(event.target);
    if (target) this.show(target);
  };

  private onPointerOut = (event: PointerEvent): void => {
    const target = this.getTarget(event.target);
    if (target && !(event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) {
      this.hide();
    }
  };

  private onFocusIn = (event: FocusEvent): void => {
    const target = this.getTarget(event.target);
    if (target?.matches(':focus-visible')) this.show(target);
  };

  private onFocusOut = (): void => this.hide();

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') this.hide();
  };

  private getTarget(target: EventTarget | null): HTMLElement | null {
    const anchor = target instanceof Element ? target.closest(`[${TOOLTIP_ATTR}]`) : null;
    return anchor instanceof HTMLElement ? anchor : null;
  }

  private show(anchor: HTMLElement): void {
    const text = anchor.getAttribute(TOOLTIP_ATTR);
    const root = this.listenerRoot;
    if (!text || !root) return;

    this.hide();
    const tooltip = document.createElement('div');
    tooltip.className = 'deck-widget-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.append(document.createTextNode(text));

    root.append(tooltip);
    this.element = tooltip;
    this.position(anchor, tooltip, root);
  }

  private position(anchor: HTMLElement, tooltip: HTMLDivElement, root: HTMLElement): void {
    const anchorRect = anchor.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const right = anchorRect.right + OFFSET;
    const left =
      right + tooltipRect.width <= window.innerWidth
        ? right
        : anchorRect.left - tooltipRect.width - OFFSET;

    tooltip.style.left = `${left - rootRect.left}px`;
    tooltip.style.top = `${
      anchorRect.top - rootRect.top + (anchorRect.height - tooltipRect.height) / 2
    }px`;
  }
}
