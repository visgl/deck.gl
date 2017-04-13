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

import {
  CompositeLayer,
  IconLayer,
  LineLayer,
  ScatterplotLayer
} from 'deck.gl';

const noop = () => {};

const defaultProps = {
  offset: {x: 0, y: 0},

  getNodePosition: node => [node.x, node.y, 0],
  getNodeColor: node => node.color || [0, 128, 255, 255],
  getNodeIcon: node => null,
  getNodeSize: node => node.radius || 9,
  getLinkPosition: link => ({
    sourcePosition: [link.source.x, link.source.y],
    targetPosition: [link.target.x, link.target.y]
  }),
  getLinkWidth: link => 2,
  getLinkColor: link => [160, 160, 160],

  onClick: noop,
  onDoubleClick: noop,
  onDrag: noop,
  onHover: noop,
  onMouseMove: noop,
  onWheel: noop
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
        this.state.layoutAlpha = data.layoutAlpha;
      }
    }
  }

  getPickingInfo({info}) {
    if (this.state.nodes) {
      return Object.assign(info, this.state.nodes[info.index]);
    }
    return {info};
  }

  renderLayers() {
    const {nodes, links, layoutAlpha} = this.state;

    // Accessor props for underlying layers
    const {getLinkPosition, getLinkColor, getLinkWidth,
      getNodePosition, getNodeColor, getNodeIcon, getNodeSize} = this.props;
    const icon = getNodeIcon() || {};
    const {getIcon, iconAtlas, iconMapping, sizeScale} = icon;

    // base layer props
    const {opacity, pickable, visible} = this.props;

    // viewport props
    const {projectionMode} = this.props;

    const drawLinks = links && links.length > 0;
    const drawNodes = nodes && nodes.length > 0;
    const drawIcons = drawNodes && Boolean(getIcon);  // ensure a valid accessor

    const linksLayer = drawLinks && new LineLayer({
      id: 'link-layer',
      data: links,
      getSourcePosition: d => getLinkPosition(d).sourcePosition,
      getTargetPosition: d => getLinkPosition(d).targetPosition,
      getColor: e => e.highlighting ? [255, 0, 0, 200] : getLinkColor(e),
      strokeWidth: getLinkWidth(),
      opacity,
      pickable,
      projectionMode,
      updateTriggers: {
        getSourcePosition: layoutAlpha,
        getTargetPosition: layoutAlpha,
        getColor: layoutAlpha
      }
    });

    const nodesLayer = drawNodes && new ScatterplotLayer({
      id: icon ? 'node-bg-layer' : 'node-layer',
      data: nodes,
      getPosition: getNodePosition,
      getRadius: getNodeSize,
      getColor: n => n.highlighting ? [255, 255, 0, 255] : getNodeColor(n),
      opacity,
      pickable,
      projectionMode,
      updateTriggers: {
        getPosition: layoutAlpha,
        getColor: layoutAlpha
      },
      visible
    });

    const nodeIconsLayer = drawIcons && new IconLayer({
      id: 'node-icon-layer',
      data: nodes,
      getColor: getNodeColor,
      getIcon,
      getPosition: getNodePosition,
      getSize: getNodeSize,
      iconAtlas,
      iconMapping,
      opacity,
      pickable,
      projectionMode,
      sizeScale,
      updateTriggers: {
        getPosition: layoutAlpha
      },
      visible
    });

    return [
      linksLayer,
      nodesLayer,
      nodeIconsLayer
    ].filter(Boolean);
  }

}

GraphLayer.layerName = 'GraphLayer';
GraphLayer.defaultProps = defaultProps;
