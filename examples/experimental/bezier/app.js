/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, ScatterplotLayer, OrthographicView} from 'deck.gl';
import {BezierCurveLayer} from '@deck.gl/experimental-layers';

import SAMPLE_GRAPH from './sample-graph';

/**
 * A helper function to compute the control point of a quadratic bezier curve
 * @param  {number[]} source  - the coordinates of source point, ex: [x, y, z]
 * @param  {number[]} target  - the coordinates of target point, ex: [x, y, z]
 * @param  {number} direction - the direction of the curve, 1 or -1
 * @param  {number} offset    - offset from the midpoint
 * @return {number[]}         - the coordinates of the control point
 */
function computeControlPoint(source, target, direction, offset) {
  const midPoint = [(source[0] + target[0]) / 2, (source[1] + target[1]) / 2];
  const dx = target[0] - source[0];
  const dy = target[1] - source[1];
  const normal = [dy, -dx];
  const length = Math.sqrt(Math.pow(normal[0], 2.0) + Math.pow(normal[1], 2.0));
  const normalized = [normal[0] / length, normal[1] / length];
  return [
    midPoint[0] + normalized[0] * offset * direction,
    midPoint[1] + normalized[1] * offset * direction
  ];
}

/**
 * A helper function to generate a graph with curved edges.
 * @param  {Object} graph - {nodes: [], edges: []}
 * expected input format: {
 *   nodes: [{id: 'a', position: [0, -100]}, {id: 'b', position: [0, 100]}, ...],
 *   edges: [{id: '1', sourceId: 'a',, targetId: 'b',}, ...]
 * }
 * @return {Object} Return new graph with curved edges.
 * expected output format: {
 *   nodes: [{id: 'a', position: [0, -100]}, {id: 'b', position: [0, 100]}, ...],
 *   edges: [{id: '1', sourceId: 'a', source: [0, -100], targetId: 'b', target: [0, 100], controlPoint: [50, 0]}, ...]
  }
 */
function layoutGraph(graph) {
  // create a map for referencing node position by node id.
  const nodePositionMap = graph.nodes.reduce((res, node) => {
    res[node.id] = node.position;
    return res;
  }, {});
  // bucket edges between the same source/target node pairs.
  const nodePairs = graph.edges.reduce((res, edge) => {
    const nodes = [edge.sourceId, edge.targetId];
    // sort the node ids to count the edges with the same pair
    // but different direction (a -> b or b -> a)
    const pairId = nodes.sort().toString();
    // push this edge into the bucket
    if (!res[pairId]) {
      res[pairId] = [edge];
    } else {
      res[pairId].push(edge);
    }
    return res;
  }, {});
  // start to create curved edges
  const unitOffset = 30;
  const layoutEdges = Object.keys(nodePairs).reduce((res, pairId) => {
    const edges = nodePairs[pairId];
    const curved = edges.length > 1;
    // curve line is directional, pairId is a list of sorted node ids.
    const nodeIds = pairId.split(',');
    const curveSourceId = nodeIds[0];
    const curveTargetId = nodeIds[1];
    // generate new edges with layout information
    const newEdges = edges.map((e, idx) => {
      // curve direction (1 or -1)
      const direction = idx % 2 ? 1 : -1;
      // straight line if there's only one edge between this two nodes.
      const offset = curved ? (1 + Math.floor(idx / 2)) * unitOffset : 0;
      return {
        ...e,
        source: nodePositionMap[e.sourceId],
        target: nodePositionMap[e.targetId],
        controlPoint: computeControlPoint(
          nodePositionMap[curveSourceId],
          nodePositionMap[curveTargetId],
          direction,
          offset
        )
      };
    });
    return res.concat(newEdges);
  }, []);
  return {
    nodes: graph.nodes,
    edges: layoutEdges
  };
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        width: 500,
        height: 500
      }
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this.setState({
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  render() {
    const {viewport} = this.state;
    const {width, height} = viewport;

    const {data = layoutGraph(SAMPLE_GRAPH)} = this.props;

    const view = new OrthographicView({
      left: -width / 2,
      top: -height / 2,
      right: width / 2,
      bottom: height / 2,
      near: 0,
      far: 100
    });

    const layers = [
      new BezierCurveLayer({
        id: 'curve-layer',
        data: data.edges,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getSourcePosition: e => e.source,
        getTargetPosition: e => e.target,
        getControlPoint: e => e.controlPoint,
        getColor: e => [150, 150, 150, 255],
        strokeWidth: 5,
        // interaction:
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 0, 0, 255]
      }),
      new ScatterplotLayer({
        id: 'node-layer',
        data: data.nodes,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d.position,
        getRadius: d => 5,
        getColor: d => [0, 0, 150, 255],
        // interaction:
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 0, 0, 255]
      })
    ];

    return (
      <div style={{pointerEvents: 'all'}}>
        <DeckGL width="100%" height="100%" views={view} layers={layers} />
      </div>
    );
  }
}

render(<App />, document.body.appendChild(document.createElement('div')));
