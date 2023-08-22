import type {Deck, Viewport, Widget, WidgetPlacement} from '@deck.gl/core';
import {h, render} from 'preact';

interface ZoomWidgetProps {
  id: string;
  viewId?: string | null;
  placement?: WidgetPlacement;
  /**
   * A [compatible DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements) which should be made full screen.
   * By default, the map container element will be made full screen.
   */
  /* eslint-enable max-len */
  container?: HTMLElement;
  label?: string;
  style?: Partial<CSSStyleDeclaration>;
}

class ZoomWidget implements Widget<ZoomWidgetProps> {
  id = 'zoom';
  props: ZoomWidgetProps;
  placement: WidgetPlacement = 'top-left';
  viewId = null;
  viewport: Viewport;

  isZoom: boolean = false;
  deck?: Deck;
  element?: HTMLDivElement;

  constructor(props: ZoomWidgetProps) {
    this.id = props.id || 'zoom';
    this.viewId = props.viewId || null;
    this.placement = props.placement || 'top-left';
    props.label = props.label || 'Toggle Zoom';
    props.style = props.style || {};
    this.props = props;
  }

  onAdd({deck}: {deck: Deck}): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'deckgl-widget deckgl-widget-zoom';
    Object.entries(this.props.style).map(([key, value]) => el.style.setProperty(key, value));
    const ui = (
      <div style="display:flex; flex-direction:column;">
        <Button onClick={() => this.handleZoomIn()} label={this.props.label}>
          <path d="M12 4.5v15m7.5-7.5h-15" />
        </Button>
        <Button onClick={() => this.handleZoomOut()} label={this.props.label}>
          <path d="M19.5 12h-15" />
        </Button>
      </div>
    );
    render(ui, el);

    this.deck = deck;
    this.element = el;

    return el;
  }

  onRemove() {
    this.deck = undefined;
    this.element = undefined;
  }

  setProps(props: ZoomWidgetProps) {
    Object.assign(this.props, props);
  }

  onViewportChange(viewport) {
    this.viewport = viewport;
  }

  handleZoom(nextZoom: number) {
    const viewId = this.viewId || 'default-view';
    const nextViewState = {...this.viewport, zoom: nextZoom};
    // @ts-ignore Using private method temporary until there's a public one
    this.deck._onViewStateChange({viewId, viewState: nextViewState, interactionState: {}});
  }

  handleZoomIn() {
    this.handleZoom(this.viewport.zoom + 1);
  }

  handleZoomOut() {
    this.handleZoom(this.viewport.zoom - 1);
  }
}

const Button = props => {
  const {label, onClick} = props;
  return (
    <div className="deckgl-widget-button-border">
      <button className="deckgl-widget-button" type="button" onClick={onClick} title={label}>
        <svg
          fill="none"
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          style="stroke-width: 2px"
          stroke="currentColor"
        >
          {props.children}
        </svg>
      </button>
    </div>
  );
};

export default ZoomWidget;
