import {CompositeLayer, GraphLayer, GRAPH_LAYER_IDS} from 'deck.gl';
import GraphSimulation from './graph-simulation';

/**
 * GraphLayoutLayer displays a force-directed network graph in deck.gl.
 * It accepts a list of nodes and a list of links,
 * processes them with a graph layout engine (default: GraphSimulation),
 * and passes props and transformed data on to GraphLayer for rendering.
 */
export default class GraphLayoutLayer extends CompositeLayer {
  initializeState() {
    const {data, layoutAccessors} = this.props;
    const Layout = this.props.layout;
    this.state.layout = new Layout(Object.assign({data}, layoutAccessors));
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

  getPickingInfo({info}) {
    const pickingInfo = [
      'index',
      'layer',
      'object',
      'picked',
      'x',
      'y'
    ].reduce((acc, k) => {
      acc[k] = info[k];
      return acc;
    }, {});

    // determine object type (node or link) based on picked layer
    if (!info.layer.context.lastPickedInfo) {
      pickingInfo.objectType = '';
    } else {
      const {id} = this.props;
      if (info.layer.context.lastPickedInfo.layerId === `${id}-graph-${GRAPH_LAYER_IDS.LINK}`) {
        pickingInfo.objectType = 'link';
      } else {
        pickingInfo.objectType = 'node';
      }
    }

    // find all links connected to picked node, or vice-versa
    const {nodes, links} = this.state;
    const {object} = pickingInfo;
    if (object) {
      if (pickingInfo.objectType === 'link') {
        pickingInfo.relatedObjects = nodes.filter(n =>
          n.id === object.source.id || n.id === object.target.id);
      } else if (pickingInfo.objectType === 'node') {
        pickingInfo.relatedObjects = links.filter(l =>
          l.source.id === object.id || l.target.id === object.id);
      }
    } else {
      pickingInfo.relatedObjects = [];
    }

    return pickingInfo;
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
