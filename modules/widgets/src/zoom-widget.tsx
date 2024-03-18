/* global document */
import {FlyToInterpolator} from '@deck.gl/core';
import type {Deck, Viewport, Widget, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';

interface ZoomWidgetProps {
  id: string;
  viewId?: string | null;
  placement?: WidgetPlacement;
  orientation?: 'vertical' | 'horizontal';
  zoomInLabel?: string;
  zoomOutLabel?: string;
  transitionDuration?: number;
  style?: Partial<CSSStyleDeclaration>;
  className?: string;
}

export class ZoomWidget implements Widget<ZoomWidgetProps> {
  id = 'zoom';
  props: ZoomWidgetProps;
  placement: WidgetPlacement = 'top-left';
  orientation: 'vertical' | 'horizontal' = 'vertical';
  viewId?: string | null = null;
  viewport?: Viewport;
  deck?: Deck;
  element?: HTMLDivElement;

  constructor(props: ZoomWidgetProps) {
    this.id = props.id || 'zoom';
    this.viewId = props.viewId || null;
    this.placement = props.placement || 'top-left';
    this.orientation = props.orientation || 'vertical';
    props.transitionDuration = props.transitionDuration || 200;
    props.zoomInLabel = props.zoomInLabel || 'Zoom In';
    props.zoomOutLabel = props.zoomOutLabel || 'Zoom Out';
    props.style = props.style || {};
    this.props = props;
  }

  onAdd({deck}: {deck: Deck}): HTMLDivElement {
    const {style, className} = this.props;
    const element = document.createElement('div');
    element.classList.add('deck-widget', 'deck-widget-zoom');
    if (className) element.classList.add(className);
    if (style) {
      Object.entries(style).map(([key, value]) => element.style.setProperty(key, value as string));
    }
    const ui = (
      <div className={`deck-widget-button-group ${this.orientation}`}>
        <IconButton
          onClick={() => this.handleZoomIn()}
          label={this.props.zoomInLabel}
          className="deck-widget-zoom-in"
        />
        <IconButton
          onClick={() => this.handleZoomOut()}
          label={this.props.zoomOutLabel}
          className="deck-widget-zoom-out"
        />
      </div>
    );
    render(ui, element);

    this.deck = deck;
    this.element = element;

    return element;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  setProps(props: Partial<ZoomWidgetProps>) {
    Object.assign(this.props, props);
  }

  onViewportChange(viewport) {
    this.viewport = viewport;
  }

  handleZoom(nextZoom: number) {
    const viewId = this.viewId || 'default-view';
    const nextViewState = {
      ...this.viewport,
      zoom: nextZoom,
      transitionDuration: this.props.transitionDuration,
      transitionInterpolator: new FlyToInterpolator()
    };
    // @ts-ignore Using private method temporary until there's a public one
    this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
  }

  handleZoomIn() {
    this.viewport && this.handleZoom(this.viewport.zoom + 1);
  }

  handleZoomOut() {
    this.viewport && this.handleZoom(this.viewport.zoom - 1);
  }
}

const IconButton = props => {
  const {className, label, onClick} = props;
  return (
    <button
      className={`deck-widget-button ${className}`}
      type="button"
      onClick={onClick}
      title={label}
    >
      <div className="deck-widget-icon" />
    </button>
  );
};
