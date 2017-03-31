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

import {CompositeLayer, COORDINATE_SYSTEM} from '../../../lib';

/*
// import {OrthographicViewport} from '../../../lib/viewports';
// TODO: where to specify viewport? Orthographic as default, but should be overridable.
    const {width, height} = this.props;
    const left = -width / 2;
    const top = -height / 2;
    const glViewport = new OrthographicViewport({width, height, left, top});
*/

import IconLayer from '../icon-layer/icon-layer';
import LineLayer from '../line-layer/line-layer';
import ScatterplotLayer from '../scatterplot-layer/scatterplot-layer';

import GraphSimulation from './graph-simulation';

const noop = () => {};

const defaultProps = {
  offset: {x: 0, y: 0},
  alpha: 0,

  getNodePosition: node => [node.x, node.y, 0],
  getNodeColor: node => node.color || [0, 128, 255, 255],
  getNodeIcon: node => null,
  getNodeSize: node => node.radius || 9,
  getLinkPosition: link => ({
    sourcePosition: [link.source.x, link.source.y],
    targetPosition: [link.target.x, link.target.y]
  }),
  getLinkWidth: link => 4,
  getLinkColor: link => [160, 160, 160],

  onClick: noop,
  onDoubleClick: noop,
  onDrag: noop,
  onHover: noop,
  onMouseMove: noop,
  onWheel: noop
};

/**
 * GraphLayer displays a force-directed network graph
 * using [d3-force](https://github.com/d3/d3-force).
 * It is a composite layer, comprising:
 * - a LineLayer for drawing links
 * - a ScatterplotLayer for drawing nodes, or node icon backgrounds if icons are specified
 * - an IconLayer for drawing node icons, if icons are specified
 *
 * GraphLayer comprises the following components:
 * - graph-layer.js:        entry point, as deck.gl composite Layer implementation
 * - graph-simulation.js:   manages the `d3-forceSimulation` driving the network graph
 * - graph.js:              manages the graph data (nodes and links)
 */
export default class GraphLayer extends CompositeLayer {
  initializeState() {
    this.simulation = GraphSimulation();
    this.state = {
      nodes: {},
      links: {}
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged) {
      const {data} = props;
      const {nodes, links} = this.simulation.update(data, data.length !== oldProps.data.length);
      this.state = Object.assign({},
        this.state,
        nodes,
        links
      );
    }
  }

  finalizeState() {
    if (this.simulation) {
      this.simulation.remove();
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
    const {nodes, links} = this.state;

    // Layer composition props
    // TODO: is this needed?
    // const {id} = this.props;

    // Rendering props underlying layer
    // const {lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels,
    //   lineJointRounded, lineMiterLimit, fp64} = this.props;

    // Accessor props for underlying layers
    const {alpha, getLinkPosition, getLinkColor, getLinkWidth,
      getNodePosition, getNodeColor, getNodeIcon, getNodeSize} = this.props;
    const icon = getNodeIcon();
    const {getIcon, iconAtlas, iconMapping, sizeScale} = icon;

    // base layer props
    const {opacity, pickable, visible} = this.props;

    // viewport props
    const {positionOrigin, projectionMode, modelMatrix} = this.props;

    const drawLinks = links && links.length > 0;
    const drawNodes = nodes && nodes.length > 0;

    const linksLayer = drawLinks && new LineLayer({
      id: 'link-layer',
      data: links,
      getSourcePosition: d => getLinkPosition(d).sourcePosition,
      getTargetPosition: d => getLinkPosition(d).targetPosition,
      getColor: e => e.highlighting ? [255, 0, 0, 200] : getLinkColor(e),
      strokeWidth: getLinkWidth(),
      opacity,
      pickable,
      positionOrigin,
      projectionMode: COORDINATE_SYSTEM.IDENTITY,
      modelMatrix,
      updateTriggers: {
        getSourcePosition: alpha,
        getTargetPosition: alpha,
        getColor: alpha
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
      positionOrigin,
      projectionMode: projectionMode || COORDINATE_SYSTEM.IDENTITY,
      modelMatrix,
      updateTriggers: {
        // TODO: do we also need to update on manual changes to fixed node positions (fx/fy),
        // to enable e.g. programmatic graph updates that don't reheat/run the simulation,
        // or for manually running the simulation via sim.tick()?
        getPosition: alpha,
        getColor: alpha
      },
      visible
    });

    const nodeIconsLayer = drawNodes && new IconLayer({
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
      positionOrigin,
      projectionMode: projectionMode || COORDINATE_SYSTEM.IDENTITY,
      modelMatrix,
      sizeScale,
      updateTriggers: {
        // TODO: do we also need to update on manual changes to fixed node positions (fx/fy),
        // to enable e.g. programmatic graph updates that don't reheat/run the simulation,
        // or for manually running the simulation via sim.tick()?
        getPosition: alpha
      },
      visible
    });

    return [
      linksLayer,
      nodesLayer,
      nodeIconsLayer
    ].filter(Boolean);
  }

  /*
  // TODO: not sure yet what to do with these:
  _handleClick(e) {
    this.props.onClick(this._getRelPosition(e));
  }

  _handleDoubleClick(e) {
    this.props.onDoubleClick(this._getRelPosition(e));
  }

  _handleDragStart(e) {
    this.props.onDrag({...this._getRelPosition(e), dragging: true});
  }

  _handleDragEnd(e) {
    this.props.onDrag({...this._getRelPosition(e), dragging: false});
  }

  _handleMouseMove(e) {
    this.props.onMouseMove(this._getRelPosition(e));
  }

  _handleWheel(e) {
    // TODO implement zooming logic
    this.props.onWheel(e);
  }

  _handleContextMenu(e) {
    e.preventDefault();
    this.props.onClick({...this._getRelPosition(e), rightClick: true});
  }

  _getRelPosition(e) {
    if (!this._container) {
      return {x: 0, y: 0};
    }
    const {pageX, pageY} = e;
    const {width, height} = this.props;
    const {left, top} = this._container.getBoundingClientRect();
    return {x: pageX - left - width / 2, y: pageY - top - height / 2};
  }

  _renderInteractionLayer() {
    const {width, height} = this.props;

    return (
      <rect ref={interactionLayer => {
        this._container = interactionLayer;
      }}
        style={{pointerEvents: 'all'}}
        width={width}
        height={height}
        fill="none"
        onClick={this._handleClick}
        onContextMenu={this._handleContextMenu}
        onDoubleClick={this._handleDoubleClick}
        onMouseDown={this._handleDragStart}
        onMouseUp={this._handleDragEnd}
        onMouseOut={this._handleDragEnd}
        onMouseMove={this._handleMouseMove}
        onWheel={this._handleWheel}
      />
    );
  }
  */

}

GraphLayer.layerName = 'GraphLayer';
GraphLayer.defaultProps = defaultProps;
