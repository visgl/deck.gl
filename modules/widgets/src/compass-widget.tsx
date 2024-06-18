/* global document */
import {FlyToInterpolator, WebMercatorViewport, _GlobeViewport} from '@deck.gl/core';
import type {Deck, Viewport, Widget, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';

interface CompassWidgetProps {
  id: string;
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
}

export class CompassWidget implements Widget<CompassWidgetProps> {
  id = 'compass';
  props: CompassWidgetProps;
  placement: WidgetPlacement = 'top-left';
  viewId?: string | null = null;
  viewport?: Viewport;
  deck?: Deck<any>;
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
    const [longitude, latitude] = [14.267484985407632, 50.10765117036714];
    const xy = viewport.project([longitude, latitude]);
    this.update(xy);
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const {style, className} = this.props;
    const element = document.createElement('div');
    element.classList.add('deck-widget', 'deck-widget-compass');
    if (className) element.classList.add(className);
    const override = {margin: '0px', top: '0', left: '0', position: 'absolute'};
    if (style) {
      Object.entries({...style, ...override}).map(([key, value]) => element.style.setProperty(key, value as string));
    }
    this.deck = deck;
    this.element = element;
    this.update([0, 0]);
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

  update(xy) {
    const [rz, rx] = this.getRotation();
    const [x, y] = xy;
    const element = this.element;
    if (!element) {
      return;
    }
    const ui = (
      <div style={{background: 'white', perspective: 100, transform: `translate(${x}px, ${y}px)`}}>
        Popup
      </div>
    );
    render(ui, element);
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  handleCompassReset() {
    const viewId = this.viewId || this.viewport?.id || 'default-view';
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
