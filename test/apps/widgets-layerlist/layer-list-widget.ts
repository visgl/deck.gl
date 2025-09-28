import type {Viewport, WidgetPlacement, Layer} from '@deck.gl/core';
import {Widget} from '@deck.gl/core';
import {WidgetImplProps} from '@deck.gl/widgets';
import {h, Fragment, render} from 'preact';

type LayerListWidgetProps = {
  id?: string;
  /**
   * Widget positioning within the view. Default: 'top-left'.
   */
  placement?: WidgetPlacement;
  /**
   * View to attach to and interact with. Required when using multiple views. Default: null
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
};

export class LayerListWidget extends Widget<LayerListWidgetProps> {
  static defaultProps: Required<LayerListWidgetProps> = {
    ...Widget.defaultProps,
    id: 'layer-list',
    placement: 'top-left'
  };

  // WidgetImpl
  className = 'deck-widget-layer-list';
  // IWidget
  placement: WidgetPlacement = 'top-left';
  viewId?: string | null = null;
  // Custom
  viewports: {[id: string]: Viewport} = {};
  layers: Layer[] = [];

  constructor(props: LayerListWidgetProps = {}) {
    super({...LayerListWidget.defaultProps, ...props});
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
  }

  setProps(props: Partial<LayerListWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRedraw({layers}: {layers: Layer[]}) {
    this.layers = layers;
    this.onRenderHTML();
  }

  onViewportChange(viewport) {
    this.viewports[viewport.id] = viewport;
  }

  onRenderHTML() {
    const element = this.element;
    if (!element) return;
    const layers = this.layers;
    if (this.deck?.props.layerFilter) {
      const ui = h(
        Fragment,
        null,
        Object.values(this.viewports).map(viewport =>
          h(
            Fragment,
            null,
            (h('h4', null, `Layers in ${viewport.id}`),
            h(
              'ul',
              null,
              layers
                .filter(layer =>
                  this.deck?.props.layerFilter?.({
                    layer,
                    viewport,
                    isPicking: false,
                    renderPass: 'widget'
                  })
                )
                .map(layer => h('li', {key: layer.id}, layer.id))
            ))
          )
        )
      );
      render(ui, element);
    } else {
      const viewportNames = Object.keys(this.viewports).join(', ');
      const ui = h(
        Fragment,
        null,
        h('h4', null, `Layers in ${viewportNames} view`),
        h(
          'ul',
          null,
          layers.map(layer => h('li', {key: layer.id}, layer.id))
        )
      );
      render(ui, element);
    }
  }
}
