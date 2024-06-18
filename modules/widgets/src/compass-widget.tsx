/* global document */
import {FlyToInterpolator, WebMercatorViewport, _GlobeViewport} from '@deck.gl/core';
import type {Deck, Viewport, Widget, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';

interface PopupWidgetProps {
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
  /** 
   * Position at which to place popup
   */
  position: [number, number];
  /** 
   * Text of popup
   */
  text: string;
}

export class CompassWidget implements Widget<PopupWidgetProps> {
  id = 'compass';
  props: PopupWidgetProps;
  viewId?: string | null = null;
  viewport?: Viewport;
  deck?: Deck<any>;
  element?: HTMLDivElement;

  constructor(props: PopupWidgetProps) {
    this.id = props.id || 'compass';
    this.viewId = props.viewId || null;
    props.style = props.style || {};
    props.position = props.position || [0, 0];
    props.text = props.text || '';
    this.props = props;
  }

  setProps(props: Partial<PopupWidgetProps>) {
    Object.assign(this.props, props);
  }

  onViewportChange(viewport) {
    this.viewport = viewport;
    this.update();
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
    this.viewport = new WebMercatorViewport(deck.viewState['default-view']);
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
    const [longitude, latitude] = this.props.position;
    const [x, y] = this.viewport!.project([longitude, latitude]);
    const element = this.element;
    if (!element) {
      return;
    }
    const ui = (
      <div style={{width: '200px', background: 'white', perspective: 100, transform: `translate(${x}px, ${y}px)`}}>
        {this.props.text}
      </div>
    );
    render(ui, element);
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }
}
