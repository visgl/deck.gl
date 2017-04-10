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
    // TODO: validate this.props.layout with duck-typing(?):
    // should have:
    // - a constructor
    // - update() method that returns {nodes, alpha}.
    // - dispose() method.

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

  getPickingInfo({info}) {
    return Object.assign(info, this.state.layout.getItemAt(info.index));
  }

  renderLayers() {
    const {id} = this.props;
    const {nodes, links, alpha} = this.state;

    // base layer props
    const {opacity, pickable, visible} = this.props;

    // viewport props
    const {projectionMode} = this.props;

    return new GraphLayer({
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
      // TODO: pass interaction handlers too?
      // or can we handle that here and let GraphLayer do nothing but render sublayers?
    });
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
