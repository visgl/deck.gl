import {Layer, GraphLayer} from 'deck.gl';
import GraphSimulation from './graph-simulation';

/**
 * GraphLayoutLayer displays a force-directed network graph in deck.gl.
 * It accepts a list of nodes and a list of links,
 * processes them with a graph layout engine (default: GraphSimulation),
 * and passes props and transformed data on to GraphLayer for rendering.
 */
export default class GraphLayoutLayer extends Layer {
  initializeState() {
    // TODO: validate this.props.layout with duck-typing(?):
    // should have:
    // - a constructor
    // - update() method that returns {nodes, links, alpha}.
    // - dispose() method.
    // write tests for this too.

    const {data} = this.props;
    const Layout = this.props.layout;
    this.state.layout = new Layout({data});
  }

  updateState({oldProps, props, changeFlags}) {
    const {layout} = this.state;
    let data = null;
    let anchor = false;
    if (changeFlags.dataChanged) {
      // if the data have changed, send to layout;
      // else just update layout in its current state.
      data = props.data;

      // TODO: @gnavvy revisit the anchoring logic
      anchor = !oldProps.data || !data || oldProps.data.length !== props.data.length;
    }

    const {nodes, links, alpha} = layout.update(data, anchor);
    if (alpha > 0) {
      // update state only if layout is still running
      this.state.nodes = nodes;
      this.state.links = links;
      this.state.alpha = alpha;
    }
  }

  finalizeState() {
    if (this.state.simulation) {
      this.state.layout.dispose();
    }
  }

  /*
  getPickingInfo({info}) {
    return Object.assign(info, {
      // override object with picked feature
      object: (info.object && info.object.feature) || info.object
    });
  }
  */

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

GraphLayoutLayer.layerName = 'GraphLayoutLayer';
GraphLayoutLayer.defaultProps = {
  width: 640,
  height: 640,
  data: null,
  onHover: () => {},
  onClick: () => {},
  onDoubleClick: () => {},
  layout: GraphSimulation
};
