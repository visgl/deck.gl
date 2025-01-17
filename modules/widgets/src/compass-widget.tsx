// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import {
  FlyToInterpolator,
  WebMercatorViewport,
  _GlobeViewport,
  _deepEqual as deepEqual,
  _applyStyles as applyStyles,
  _removeStyles as removeStyles
} from '@deck.gl/core';
import type {Deck, Viewport, Widget, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';

export type CompassWidgetProps = {
  id?: string;
  /**
   * Widget positioning within the view. Default 'top-left'.
   */
  placement?: WidgetPlacement;
  /**
   * View to attach to and interact with. Required when using multiple views.
   */
  viewId?: string | null;
  /**
   * Tooltip message.
   */
  label?: string;
  /**
   * Bearing and pitch reset transition duration in ms.
   */
  transitionDuration?: number;
  /**
   * CSS inline style overrides.
   */
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Additional CSS class.
   */
  className?: string;
};

export class CompassWidget implements Widget<CompassWidgetProps> {
  id = 'compass';
  props: CompassWidgetProps;
  placement: WidgetPlacement = 'top-left';
  viewId?: string | null = null;
  viewports: {[id: string]: Viewport} = {};
  deck?: Deck<any>;
  element?: HTMLDivElement;

  constructor(props: CompassWidgetProps) {
    this.id = props.id ?? this.id;
    this.viewId = props.viewId ?? this.viewId;
    this.placement = props.placement ?? this.placement;

    this.props = {
      ...props,
      transitionDuration: props.transitionDuration ?? 200,
      label: props.label ?? 'Reset Compass',
      style: props.style ?? {}
    };
  }

  setProps(props: Partial<CompassWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    const oldProps = this.props;
    const el = this.element;
    if (el) {
      if (oldProps.className !== props.className) {
        if (oldProps.className) el.classList.remove(oldProps.className);
        if (props.className) el.classList.add(props.className);
      }

      if (!deepEqual(oldProps.style, props.style, 1)) {
        removeStyles(el, oldProps.style);
        applyStyles(el, props.style);
      }
    }

    Object.assign(this.props, props);
    this.update();
  }

  onViewportChange(viewport: Viewport) {
    // no need to update if viewport is the same
    if (!viewport.equals(this.viewports[viewport.id])) {
      this.viewports[viewport.id] = viewport;
      this.update();
    }
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const {style, className} = this.props;
    const element = document.createElement('div');
    element.classList.add('deck-widget', 'deck-widget-compass');
    if (className) element.classList.add(className);
    applyStyles(element, style);
    this.deck = deck;
    this.element = element;
    this.update();
    return element;
  }

  getRotation(viewport?: Viewport) {
    if (viewport instanceof WebMercatorViewport) {
      return [-viewport.bearing, viewport.pitch];
    } else if (viewport instanceof _GlobeViewport) {
      return [0, Math.max(-80, Math.min(80, viewport.latitude))];
    }
    return [0, 0];
  }

  private update() {
    const viewId = this.viewId || Object.values(this.viewports)[0]?.id || 'default-view';
    const viewport = this.viewports[viewId];
    const [rz, rx] = this.getRotation(viewport);
    const element = this.element;
    if (!element) {
      return;
    }
    const ui = (
      <div className="deck-widget-button" style={{perspective: 100}}>
        <button
          type="button"
          onClick={() => {
            for (const viewport of Object.values(this.viewports)) {
              this.handleCompassReset(viewport);
            }
          }}
          title={this.props.label}
          style={{transform: `rotateX(${rx}deg)`}}
        >
          <svg fill="none" width="100%" height="100%" viewBox="0 0 26 26">
            <g transform={`rotate(${rz},13,13)`}>
              <path
                d="M10 13.0001L12.9999 5L15.9997 13.0001H10Z"
                fill="var(--icon-compass-north-color, #F05C44)"
              />
              <path
                d="M16.0002 12.9999L13.0004 21L10.0005 12.9999H16.0002Z"
                fill="var(--icon-compass-south-color, #C2C2CC)"
              />
            </g>
          </svg>
        </button>
      </div>
    );
    render(ui, element);
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  handleCompassReset(viewport: Viewport) {
    const viewId = this.viewId || viewport.id || 'default-view';
    if (viewport instanceof WebMercatorViewport) {
      const nextViewState = {
        ...viewport,
        bearing: 0,
        ...(this.getRotation(viewport)[0] === 0 ? {pitch: 0} : {}),
        transitionDuration: this.props.transitionDuration,
        transitionInterpolator: new FlyToInterpolator()
      };
      // @ts-ignore Using private method temporary until there's a public one
      this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
    }
  }
}
