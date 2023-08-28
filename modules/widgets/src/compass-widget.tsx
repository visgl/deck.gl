import {FlyToInterpolator, WebMercatorViewport} from '@deck.gl/core';
import type {Deck, Viewport, Widget, WidgetPlacement} from '@deck.gl/core';
import {h, render} from 'preact';

interface CompassWidgetProps {
  id: string;
  viewId?: string | null;
  placement?: WidgetPlacement;
  CompassLabel?: string;
  transitionDuration?: number;
  style?: Partial<CSSStyleDeclaration>;
}

const ICON_HEIGHT = 16;

class CompassWidget implements Widget<CompassWidgetProps> {
  id = 'Compass';
  props: CompassWidgetProps;
  placement: WidgetPlacement = 'top-left';
  viewId = null;
  viewport: Viewport;
  deck?: Deck;
  element?: HTMLDivElement;

  constructor(props: CompassWidgetProps) {
    this.id = props.id || 'Compass';
    this.viewId = props.viewId || null;
    this.placement = props.placement || 'top-left';
    props.transitionDuration = props.transitionDuration || 200;
    props.CompassLabel = props.CompassLabel || 'Compass';
    props.style = props.style || {};
    this.props = props;
  }

  setProps(props: CompassWidgetProps) {
    Object.assign(this.props, props);
  }

  onViewportChange(viewport) {
    this.viewport = viewport;
    this.update();
  }

  onAdd({deck}: {deck: Deck}): HTMLDivElement {
    const element = document.createElement('div');
    element.className = 'deckgl-widget deckgl-widget-Compass';
    Object.entries(this.props.style).map(([key, value]) => element.style.setProperty(key, value));
    this.deck = deck;
    this.element = element;
    this.update();

    return element;
  }

  getRotation() {
    if (this.viewport instanceof WebMercatorViewport) {
      return [-this.viewport.bearing, this.viewport.pitch];
    }
    return [0, 0];
  }

  update() {
    const [rz, rx] = this.getRotation();
    const ui = (
      <div className="deckgl-widget-button-group">
        <div className="deckgl-widget-button-border" style={{perspective: ICON_HEIGHT * 10}}>
          <button
            className="deckgl-widget-button"
            type="button"
            onClick={() => this.handleCompassReset()}
            label={this.props.CompassLabel}
            style={{transform: `rotateX(${rx}deg)`}}
          >
            <svg
              fill="none"
              width="100%"
              height="100%"
              viewBox={`0 0 ${ICON_HEIGHT} ${ICON_HEIGHT}`}
            >
              <g transform={`rotate(${rz},${ICON_HEIGHT / 2},${ICON_HEIGHT / 2})`}>
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
    render(ui, this.element);
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

export default CompassWidget;
