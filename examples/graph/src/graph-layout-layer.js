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
    const {data} = this.props;
    const optional = [
      'alphaOnDataChange',
      'alphaOnDrag',
      'alphaOnHover',
      'linkDistance',
      'linkStrength',
      'nBodyStrength',
      'nBodyDistanceMin',
      'nBodyDistanceMax'
    ].filter(key => Boolean(this.props[key]))
    .reduce((acc, key) => {
      acc[key] = this.props[key];
      return acc;
    }, {});

    const Layout = this.props.layout;
    this.state.layout = new Layout(Object.assign({data}, optional));
  }

  updateState({oldProps, props, changeFlags}) {
    const {layout} = this.state;
    const data = props.data ? props.data[props.data.length - 1] : null;
    let layoutData;

    // If the data have changed, send to layout;
    // else just update layout in its current state.
    if (changeFlags.dataChanged) {
      layoutData = data;
    }

    const {nodes, alpha} = layout.update(layoutData);
    if (alpha > 0) {
      // update state only if layout is still running
      this.state.nodes = nodes;
      this.state.links = data ? data.links : undefined;
      this.state.layoutAlpha = alpha;
    }
  }

  finalizeLayer() {
    if (this.state.layout) {
      this.state.layout.dispose();
    }
  }

  renderLayers() {
    const {id} = this.props;
    const {nodes, links, layoutAlpha} = this.state;

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
        layoutAlpha
      },
      opacity,
      pickable,
      visible,
      projectionMode
    }, optional));
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
