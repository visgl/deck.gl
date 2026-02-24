// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Widget} from '@deck.gl/core';
import type {Deck, PickingInfo, Viewport, WidgetProps} from '@deck.gl/core';
import {render, JSX} from 'preact';
import {Popover, type PopoverProps} from './lib/components/popover';
import {UserContent} from './lib/components/user-content';

export type TooltipContent = {
  /** Anchor of the popup in world coordinates, e.g. [longitude, latitude].
   * If not supplied, default to the mouse position where the popup was triggered.
   */
  position?: number[];
  /** Text content to display in the popup */
  text?: string;
  /** HTML content to display in the popup. If supplied, `text` is ignored. */
  html?: string;
  /** HTML element to attach inside the popup. */
  element?: HTMLElement | null;
  /** Custom class name to add to the popup */
  className?: string;
  /** CSS style overrides of the popup */
  style?: Partial<CSSStyleDeclaration>;
};

export type InfoWidgetProps = WidgetProps & {
  /** View to attach to and interact with. Required when using multiple views */
  viewId?: string | null;
  /** Determines the interaction mode of the widget */
  mode: 'click' | 'hover';
  /** Function to generate the popup contents from the selected element */
  getTooltip?: (
    info: PickingInfo,
    widget: InfoWidget
  ) => TooltipContent | string | null | undefined;
  /** Position popup relative to the anchor.
   * @default 'right'
   */
  placement?: PopoverProps['placement'];
  /** Pixel offset
   * @default 10
   */
  offset?: PopoverProps['offset'];
  /**
   * Show an arrow pointing at the anchor. Optionally accepts a pixel size.
   * @default 10
   */
  arrow?: PopoverProps['arrow'];
};

export class InfoWidget extends Widget<InfoWidgetProps> {
  static defaultProps: Required<InfoWidgetProps> = {
    ...Widget.defaultProps,
    id: 'info',
    viewId: null,
    mode: 'hover',
    getTooltip: undefined!,
    placement: 'right',
    offset: 10,
    arrow: 10
  };

  className = 'deck-widget-info';
  placement = 'fill' as const;
  viewport?: Viewport;
  tooltip: Required<TooltipContent> | null = null;

  constructor(props: InfoWidgetProps) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<InfoWidgetProps>) {
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onAdd({deck}: {deck: Deck<any>; viewId: string | null}) {
    this.deck = deck;
  }

  onViewportChange(viewport) {
    this.viewport = viewport;
    this.updateHTML();
  }

  onHover(info: PickingInfo): void {
    if (this.props.mode === 'hover') {
      this.tooltip = this._getTooltip(info);
    }
  }

  onClick(info: PickingInfo): void {
    if (this.props.mode === 'click') {
      this.tooltip = this._getTooltip(info);
    }
  }

  protected _getTooltip(info: PickingInfo): Required<TooltipContent> | null {
    if (!this.props.getTooltip) return null;

    const content = this.props.getTooltip(info, this) ?? null;
    if (content === null) return null;
    const normalizedTooltip: TooltipContent =
      typeof content === 'string' ? {text: content} : content;

    const position = normalizedTooltip.position || info.coordinate;
    if (!position) return null;

    return {
      position,
      text: '',
      html: '',
      element: null,
      className: '',
      style: {},
      ...normalizedTooltip
    };
  }

  onRenderHTML(rootElement: HTMLElement): void {
    if (!this.viewport || this.tooltip === null) {
      render(null, rootElement);
      return;
    }
    const style: Partial<CSSStyleDeclaration> = {
      ...this.props.style,
      ...this.tooltip.style
    };
    // Project the clicked geographic coordinate to canvas (x, y)
    const [x, y] = this.viewport.project(this.tooltip.position);
    const background = style.backgroundColor || style.background || 'white';

    // Render the popup container with a content box and a placeholder for the arrow.
    // The container is positioned absolutely (initially at 0,0) and will be repositioned after measuring.
    const ui = (
      <Popover
        x={x}
        y={y}
        placement={this.props.placement}
        arrow={this.props.arrow}
        arrowColor={background}
        offset={this.props.offset}
      >
        <UserContent
          className={`deck-widget-popup-content ${this.tooltip.className} ${this.props.className}`}
          style={{
            background,
            padding: '10px',
            boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.15)',
            ...(style as JSX.CSSProperties)
          }}
          html={this.tooltip.html}
          text={this.tooltip.text}
          element={this.tooltip.element}
        />
      </Popover>
    );
    render(ui, rootElement);
  }
}
