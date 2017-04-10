import {Layer, GraphLayer} from 'deck.gl';
import GraphSimulation from './graph-simulation';

/**
 * GraphConductorLayer is a convenience layer that orchestrates
 * data management, layout, and rendering of a force-directed network graph in deck.gl.
 * It accepts lists of network nodes and links with associated operations (add, remove, etc),
 * manages the resulting data structure,
 * passes that structure to a graph layout engine (default: GraphSimulation),
 * and passes props and transformed data on to GraphLayer for rendering.
 */
export default class GraphConductorLayer extends Layer {
  initializeState() {
    const {data} = this.props;
    const Layout = this.props.layout;
    this.state.layout = new Layout({data});
  }

  updateState({oldProps, props, changeFlags}) {
    const {layout} = this.state;
    let data = null;

    // If the data have changed, send to layout;
    // else just update layout in its current state.
    if (changeFlags.dataChanged) {
      data = props.data;
    }

    const {nodes, alpha} = layout.update(data);
    if (alpha > 0) {
      // update state only if layout is still running
      this.state.nodes = nodes;
      this.state.links = props.data ? props.data.links : undefined;
      this.state.alpha = alpha;
    }
  }

  finalizeLayer() {
    if (this.state.layout) {
      this.state.layout.dispose();
    }
  }

  renderLayers() {
    const {id} = this.props;
    const {nodes, links, alpha} = this.state;

    // base layer props
    const {opacity, visible} = this.props;
    const pickable = Boolean(this.props.onHover || this.props.onClick || this.props.onDoubleClick);

    // viewport props
    const {projectionMode} = this.props;

    // optional handlers and accessors
    const optional = [
      'onHover',
      'onClick',
      'onDoubleClick',
      'getNodePosition',
      'getNodeColor',
      'getNodeIcon',
      'getNodeSize',
      'getLinkPosition',
      'getLinkWidth',
      'getLinkColor'
    ].filter(key => Boolean(this.props[key]))
    .reduce((acc, key) => {
      acc[key] = this.props[key];
      return acc;
    }, {});

    // accessors
    const {
    } = this.props;

    return new GraphLayer(Object.assign({
      id: `${id}-graph`,
      data: {
        nodes,
        links,
        alpha
      },
      opacity,
      pickable,
      visible,
      projectionMode
    }, optional));
  }
}

GraphConductorLayer.layerName = 'GraphConductorLayer';
GraphConductorLayer.defaultProps = {
  width: 640,
  height: 640,
  data: null,
  onHover: () => {},
  onClick: () => {},
  onDoubleClick: () => {},
  layout: GraphSimulation
};
