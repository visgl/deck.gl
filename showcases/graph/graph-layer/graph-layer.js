// Copyright (c) 2016 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {CompositeLayer, IconLayer, LineLayer, ScatterplotLayer, COORDINATE_SYSTEM} from 'deck.gl';

const defaultProps = {
  offset: {x: 0, y: 0},
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,

  getLinkPosition: link => ({
    sourcePosition: [link.source.x, link.source.y],
    targetPosition: [link.target.x, link.target.y]
  }),
  getLinkWidth: link => 2,
  getLinkColor: link => [179, 173, 158, 255],

  getNodePosition: node => [node.x, node.y, 0],
  getNodeColor: node => node.color || [18, 147, 154, 255],
  getNodeSize: node => node.radius || 8,

  nodeIconAccessors: {}
};

/**
 * GraphLayer renders a collection of nodes and links between them,
 * for e.g. displaying a force-directed network graph.
 * As it only handles the rendering, the layout and data must be managed
 * by an adaptor component.
 *
 * It is a composite layer, comprising:
 * - a LineLayer for drawing links
 * - a ScatterplotLayer for drawing nodes, or node icon backgrounds if icons are specified
 * - an IconLayer for drawing node icons, if icons are specified
 */
export default class GraphLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      nodes: {},
      links: {}
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged) {
      const {data} = props;
      if (data) {
        this.state.nodes = data.nodes;
        this.state.links = data.links;
        this.state.layoutTime = props.layoutTime;
      }
    }
  }

  renderLayers() {
    const {id} = this.props;
    const {nodes, links, layoutTime} = this.state;

    // Accessor props for underlying layers
    const {
      getLinkPosition,
      getLinkColor,
      getLinkWidth,
      getNodePosition,
      getNodeColor,
      getNodeSize,
      nodeIconAccessors
    } = this.props;
    const {getIcon, iconAtlas, iconMapping, sizeScale} = nodeIconAccessors || {};

    // base layer props
    const {opacity, pickable, visible} = this.props;

    // viewport props
    const {coordinateSystem} = this.props;

    const drawLinks = links && links.length > 0;
    const drawNodes = nodes && nodes.length > 0;

    // only draw icons if all required accessors are present
    const drawIcons = drawNodes && getIcon && iconAtlas && iconMapping;

    const linksLayer =
      drawLinks &&
      new LineLayer({
        id: `${id}-link-layer`,
        data: links,
        getSourcePosition: d => getLinkPosition(d).sourcePosition,
        getTargetPosition: d => getLinkPosition(d).targetPosition,
        getColor: e => (e.highlighting ? [255, 0, 0, 200] : getLinkColor(e)),
        strokeWidth: getLinkWidth(),
        opacity,
        pickable,
        coordinateSystem,
        updateTriggers: {
          getSourcePosition: layoutTime,
          getTargetPosition: layoutTime,
          getColor: layoutTime
        }
      });

    const nodesLayer =
      drawNodes &&
      new ScatterplotLayer({
        id: `${id}-${drawIcons ? 'node-bg-layer' : 'node-layer'}`,
        data: nodes,
        getPosition: getNodePosition,
        getRadius: getNodeSize,
        getFillColor: n => (n.highlighting ? [255, 255, 0, 255] : getNodeColor(n)),
        opacity,
        pickable,
        coordinateSystem,
        updateTriggers: {
          getPosition: layoutTime,
          getFillColor: layoutTime
        },
        visible
      });

    const nodeIconsLayer =
      drawIcons &&
      new IconLayer({
        id: `${id}-node-icon-layer`,
        data: nodes,
        getColor: getNodeColor,
        getIcon,
        getPosition: getNodePosition,
        getSize: getNodeSize,
        iconAtlas,
        iconMapping,
        opacity,
        pickable,
        coordinateSystem,
        sizeScale,
        updateTriggers: {
          getPosition: layoutTime
        },
        visible
      });

    return [linksLayer, nodesLayer, nodeIconsLayer];
  }
}

GraphLayer.layerName = 'GraphLayer';
GraphLayer.defaultProps = defaultProps;
