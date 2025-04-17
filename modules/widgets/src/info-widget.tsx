/* global document */
import type {Deck, PickingInfo, Viewport, Widget} from '@deck.gl/core';
import {render} from 'preact';

export type InfoWidgetProps = {
  id: string;
  /**
   * View to attach to and interact with. Required when using multiple views.
   */
  viewId?: string | null;
  /**
   * CSS inline style overrides.
   */
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Additional CSS class.
   */
  className?: string;

  mode: 'click' | 'hover' | 'static';

  getTooltip?: (info: PickingInfo, widget: InfoWidget) => any;
  /**
   * Position at which to place popup (clicked point: [longitude, latitude]).
   */
  position: [number, number];
  /**
   * Text of popup
   */
  text?: string;
  /**
   * Visibility of info widget
   */
  visible?: boolean;
  /**
   * Minimum offset (in pixels) to keep the popup away from the canvas edges.
   */
  minOffset?: number;
  onClick?: (widget: InfoWidget, info: PickingInfo) => boolean;
};

export class InfoWidget implements Widget<InfoWidgetProps> {
  id = 'info';
  props: InfoWidgetProps;
  viewId?: string | null = null;
  viewport?: Viewport;
  deck?: Deck<any>;
  element?: HTMLDivElement;

  constructor(props: InfoWidgetProps) {
    this.id = props.id || 'info';
    this.viewId = props.viewId || null;
    props.style = props.style || {};
    props.position = props.position || [0, 0];
    props.text = props.text || '';
    props.visible = props.visible || false;
    // Set default minOffset if not provided
    props.minOffset = props.minOffset ?? 0;
    this.props = props;
  }

  setProps(props: Partial<InfoWidgetProps>) {
    Object.assign(this.props, props);
    this.update();
  }

  onViewportChange(viewport) {
    this.viewport = viewport;
    this.update();
  }

  onHover(info: PickingInfo): void {
    if (this.props.mode === 'hover' && this.props.getTooltip) {
      const tooltip = this.props.getTooltip(info, this);
      // hover tooltips should show over static and click infos
      this.setProps({
        visible: tooltip !== null,
        ...tooltip,
        style: {zIndex: 1, ...tooltip?.style}
      });
    }
  }

  onClick(info: PickingInfo): boolean {
    if (this.props.mode === 'click' && this.props.getTooltip) {
      const tooltip = this.props.getTooltip(info, this);
      this.setProps({
        visible: tooltip !== null,
        ...tooltip
      });
      return tooltip != null;
    }

    // Original behavior
    return this.props.onClick?.(this, info) || false;
  }

  onAdd({deck, viewId}: {deck: Deck<any>; viewId: string | null}): HTMLDivElement {
    const {className} = this.props;
    const element = document.createElement('div');
    element.classList.add('deck-widget', 'deck-widget-info');
    if (className) element.classList.add(className);
    // Ensure absolute positioning relative to the deck container
    const style = {margin: '0px', top: '0px', left: '0px', position: 'absolute'};
    Object.entries(style).forEach(([key, value]) => element.style.setProperty(key, value));
    this.deck = deck;
    if (!viewId) {
      this.viewport = deck.getViewports()[0];
    } else {
      this.viewport = deck.getViewports().find(viewport => viewport.id === viewId);
    }
    this.element = element;
    this.update();
    return element;
  }

  update() {
    const element = this.element;
    if (!element || !this.viewport) {
      return;
    }
    const [longitude, latitude] = this.props.position;
    // Project the clicked geographic coordinate to canvas (x, y)
    const [x, y] = this.viewport.project([longitude, latitude]);

    const minOffset = this.props.minOffset || 0;
    const gap = 10; // gap between clicked point and popup box
    const arrowHeight = 8; // height of the triangle arrow
    const arrowWidth = 16; // full width of the arrow

    // Decide vertical orientation.
    // If the clicked point is in the bottom half, place the popup above the point.
    const isAbove = y > this.viewport.height / 2;
    const background = (this.props.style && this.props.style.background) || 'rgba(255,255,255,0.9)';

    // Render the popup container with a content box and a placeholder for the arrow.
    // The container is positioned absolutely (initially at 0,0) and will be repositioned after measuring.
    const ui = this.props.visible ? (
      <div className="popup-container" style={{position: 'absolute', left: 0, top: 0}}>
        <div
          className="popup-content"
          style={{
            background,
            padding: '10px',
            position: 'relative',
            // Include any additional styles
            ...(this.props.style as React.CSSProperties)
          }}
        >
          {this.props.text}
        </div>
        <div className="popup-arrow" style={{position: 'absolute', width: '0px', height: '0px'}} />
      </div>
    ) : null;
    render(ui, element);

    // After rendering, measure the content and adjust positioning so that:
    // - The popup (with its arrow) does not cover the clicked point.
    // - The arrow's tip points to the clicked point.
    // - The popup remains within the canvas bounds, with minOffset.
    requestAnimationFrame(() => {
      if (!this.props.visible || !element.firstChild || !this.viewport) return;

      const container = element.firstChild as HTMLElement;
      const contentEl = container.querySelector('.popup-content') as HTMLElement;
      const arrowEl = container.querySelector('.popup-arrow') as HTMLElement;
      if (!contentEl || !arrowEl) return;
      const contentRect = contentEl.getBoundingClientRect();
      const popupWidth = contentRect.width;
      const popupHeight = contentRect.height;

      // Compute ideal horizontal position: center the popup on the clicked x
      let computedLeft = x - popupWidth / 2;
      // Compute vertical position based on orientation:
      // If the popup is above, position its bottom edge (minus arrow & gap) at the clicked y.
      // Otherwise, position its top edge (plus arrow & gap) at the clicked y.
      let computedTop;
      if (isAbove) {
        computedTop = y - gap - arrowHeight - popupHeight;
      } else {
        computedTop = y + gap + arrowHeight;
      }

      // Ensure the popup (content) stays within horizontal bounds of the canvas
      if (computedLeft < minOffset) {
        computedLeft = minOffset;
      }
      if (computedLeft + popupWidth > this.viewport.width - minOffset) {
        computedLeft = this.viewport.width - minOffset - popupWidth;
      }

      // Ensure the vertical position (including the arrow) stays within canvas bounds.
      if (isAbove) {
        if (computedTop < minOffset) {
          computedTop = minOffset;
        }
      } else if (computedTop + popupHeight + arrowHeight > this.viewport.height - minOffset) {
        computedTop = this.viewport.height - minOffset - popupHeight - arrowHeight;
      }

      // Update container position (remove any transform and set left/top explicitly)
      container.style.left = `${computedLeft}px`;
      container.style.top = `${computedTop}px`;
      container.style.transform = '';

      // Compute arrow's horizontal offset relative to the container.
      // We want the arrow's tip to align with the clicked point.
      let arrowLeft = x - computedLeft - arrowWidth / 2;
      // Optionally constrain arrowLeft so it stays within the popup's width.
      arrowLeft = Math.max(arrowLeft, 0);
      arrowLeft = Math.min(arrowLeft, popupWidth - arrowWidth);

      // Update arrow element's style based on orientation.
      if (isAbove) {
        // Popup is above the clicked point so arrow appears at the bottom of the popup.
        arrowEl.style.left = `${arrowLeft}px`;
        arrowEl.style.bottom = `-${arrowHeight}px`;
        arrowEl.style.top = '';
        arrowEl.style.borderLeft = `${arrowWidth / 2}px solid transparent`;
        arrowEl.style.borderRight = `${arrowWidth / 2}px solid transparent`;
        arrowEl.style.borderTop = `${arrowHeight}px solid ${background}`;
        arrowEl.style.borderBottom = '';
      } else {
        // Popup is below the clicked point so arrow appears at the top.
        arrowEl.style.left = `${arrowLeft}px`;
        arrowEl.style.top = `-${arrowHeight}px`;
        arrowEl.style.bottom = '';
        arrowEl.style.borderLeft = `${arrowWidth / 2}px solid transparent`;
        arrowEl.style.borderRight = `${arrowWidth / 2}px solid transparent`;
        arrowEl.style.borderBottom = `${arrowHeight}px solid ${background}`;
        arrowEl.style.borderTop = '';
      }
    });
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }
}
