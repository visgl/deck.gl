import {CompositeLayer, COORDINATE_SYSTEM} from 'deck.gl';
import GraphLayer from './graph-layer';

import LayoutD3 from './layout/layout-d3';

const defaultProps = {
  width: 640,
  height: 640,
  data: null,
  opacity: 1.0,
  layout: LayoutD3,
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  nodeIconAccessors: {}
};

/**
 * GraphLayoutLayer displays a force-directed network graph in deck.gl.
 * It accepts a list of nodes and a list of links,
 * processes them with a graph layout engine (default: LayoutD3),
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

    const {layoutProps} = this.props;
    const {nodes, isUpdating} = layout.update(layoutData, layoutProps);
    if (isUpdating) {
      // update state only if layout is still running
      this.state.nodes = nodes;
      this.state.links = data ? data.links : undefined;
      // update timestamp for updateTriggers diff
      this.state.layoutTime = Date.now();
    }
  }

  getPickingInfo({info}) {
    const pickingInfo = ['index', 'layer', 'object', 'picked', 'x', 'y'].reduce((acc, k) => {
      acc[k] = info[k];
      return acc;
    }, {});

    // determine object type (node or link) via duck-typing
    const {object} = pickingInfo;
    if (!object) {
      pickingInfo.objectType = '';
    } else if (info.object.source) {
      pickingInfo.objectType = 'link';
    } else {
      pickingInfo.objectType = 'node';
    }

    // find "related objects":
    // nodes at either end of picked link,
    // or all links and nodes connected to picked node
    const {nodes, links} = this.state;
    let relatedObjects = [];
    if (object) {
      if (pickingInfo.objectType === 'link') {
        relatedObjects = nodes.filter(n => n.id === object.source.id || n.id === object.target.id);
      } else if (pickingInfo.objectType === 'node') {
        relatedObjects = links.filter(l => l.source.id === object.id || l.target.id === object.id);
        const oneDegreeNodes = relatedObjects.map(related => {
          return related.source === object ? related.target : related.source;
        });
        relatedObjects = relatedObjects.concat(oneDegreeNodes);
      }
    }
    pickingInfo.relatedObjects = relatedObjects;

    return pickingInfo;
  }

  finalizeLayer() {
    if (this.state.layout) {
      this.state.layout.dispose();
    }
  }

  renderLayers() {
    const {id} = this.props;
    const {nodes, links, layoutTime} = this.state;

    // base layer props
    const {opacity, visible} = this.props;

    // base layer handlers
    const {onHover, onClick} = this.props;
    const pickable = Boolean(this.props.onHover || this.props.onClick);

    // viewport props
    const {coordinateSystem} = this.props;

    // base layer accessors
    const {linkAccessors, nodeAccessors, nodeIconAccessors} = this.props;

    return new GraphLayer(
      Object.assign(
        {
          id: `${id}-graph`,
          data: {
            nodes,
            links
          },
          layoutTime,

          opacity,
          pickable,
          visible,
          coordinateSystem,

          onHover,
          onClick
        },

        // deconstruct these
        linkAccessors,
        nodeAccessors,

        // leave these accessors bundled in an object
        {nodeIconAccessors}
      )
    );
  }
}

GraphLayoutLayer.layerName = 'GraphLayoutLayer';
GraphLayoutLayer.defaultProps = defaultProps;
