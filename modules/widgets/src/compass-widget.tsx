/* global document */
import {FlyToInterpolator, WebMercatorViewport, _GlobeViewport} from '@deck.gl/core';
import type {Deck, Viewport, Widget, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';

interface CompassWidgetProps {
  id: string;
  viewId?: string | null;
  placement?: WidgetPlacement;
  label?: string;
  transitionDuration?: number;
  style?: Partial<CSSStyleDeclaration>;
  className?: string;
}

export class CompassWidget implements Widget<CompassWidgetProps> {
  id = 'compass';
  props: CompassWidgetProps;
  placement: WidgetPlacement = 'top-left';
  viewId?: string | null = null;
  viewport?: Viewport;
  deck?: Deck;
  element?: HTMLDivElement;

  constructor(props: CompassWidgetProps) {
    this.id = props.id || 'compass';
    this.viewId = props.viewId || null;
    this.placement = props.placement || 'top-left';
    props.transitionDuration = props.transitionDuration || 200;
    props.label = props.label || 'Compass';
    props.style = props.style || {};
    this.props = props;
  }

  setProps(props: Partial<CompassWidgetProps>) {
    Object.assign(this.props, props);
  }

  onViewportChange(viewport) {
    this.viewport = viewport;
    this.update();
  }

  onAdd({deck}: {deck: Deck}): HTMLDivElement {
    const {style, className} = this.props;
    const element = document.createElement('div');
    element.classList.add('deck-widget', 'deck-widget-compass');
    if (className) element.classList.add(className);
    if (style) {
      Object.entries(style).map(([key, value]) => element.style.setProperty(key, value as string));
    }
    this.deck = deck;
    this.element = element;
    this.update();
    return element;
  }

  getRotation() {
    if (this.viewport instanceof WebMercatorViewport) {
      return [-this.viewport.bearing, this.viewport.pitch];
    } else if (this.viewport instanceof _GlobeViewport) {
      return [0, Math.max(-80, Math.min(80, this.viewport.latitude))];
    }
    return [0, 0];
  }

  update() {
    const [rz, rx] = this.getRotation();
    const element = this.element;
    if (!element) {
      return;
    }
    const ui = (
      <div className="deck-widget-button">
        <div className="deck-widget-button-border" style={{perspective: 100}}>
          <button
            type="button"
            onClick={() => this.handleCompassReset()}
            label={this.props.label}
            style={{transform: `rotateX(${rx}deg)`}}
          >
            <svg fill="none" width="100%" height="100%" viewBox={'0 0 16 16'}>
              <g transform={`rotate(${rz},8,8)`}>
                <path d="M5 8.00006L7.99987 0L10.9997 8.00006H5Z" fill="#F05C44" />
                <path
                  d="M11.0002 7.99994L8.00038 16L5.00051 7.99994L11.0002 7.99994Z"
                  fill="#ccc"
                />
              </g>
            </svg>
          </button>
        </div>
      </div>
    );
    render(ui, element);
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  handleCompassReset() {
    const viewId = this.viewId || 'default-view';
    if (this.viewport instanceof WebMercatorViewport) {
      const nextViewState = {
        ...this.viewport,
        bearing: 0,
        ...(this.getRotation()[0] === 0 ? {pitch: 0} : {}),
        transitionDuration: this.props.transitionDuration,
        transitionInterpolator: new FlyToInterpolator()
      };
      // @ts-ignore Using private method temporary until there's a public one
      this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
    }
  }
}
