import {forceCenter, forceLink, forceManyBody, forceSimulation} from 'd3-force';

/**
 * GraphSimulation calculates a force-directed network graph.
 * It accepts a list of nodes and a list of links,
 * and returns {x,y} node locations and alpha (simulation "heat") on update().
 * It provides the graph data management and layout logic
 * using [d3-force](https://github.com/d3/d3-force).
 */
export default class GraphSimulation {
  constructor(props) {
    this.props = Object.assign({}, GraphSimulation.defaultProps, props);
  }

  /**
   * @param {data}   Data formatted as {nodes: [], links: []}
   * @param {layoutProps}  Any props relevant to this layout update
   */
  update(data, layoutProps) {
    const {alphaOnDataChange, alphaOnDrag} = this.props;
    if (this._simulation && data) {
      // If new data are passed, update the simulation with the new data
      this._simulation.nodes(data.nodes)
        .force('link', forceLink(data.links).id(n => n.id)
          .strength(this.props.linkStrength).distance(this.props.linkDistance))
        .alpha(alphaOnDataChange);
    } else if (!this._simulation) {
      if (data) {
        // Instantiate the simulation with the passed data
        const {nBodyStrength, nBodyDistanceMin, nBodyDistanceMax} = this.props;
        this._simulation = forceSimulation(data.nodes)
          .force('link', forceLink(data.links).id(n => n.id)
            .strength(this.props.linkStrength).distance(this.props.linkDistance))
          .force('charge', forceManyBody().strength(nBodyStrength)
            .distanceMin(nBodyDistanceMin).distanceMax(nBodyDistanceMax))
          .force('center', forceCenter())
          .stop();
      } else {
        // No data passed and simulation has not yet been instantiated,
        // so return empty object.
        return {
          nodes: [],
          isUpdating: false
        };
      }
    }

    const {fixedNodes, unfixedNodes} = layoutProps;
    if (fixedNodes) {
      fixedNodes.forEach(n => {
        n.node.fx = n.x;
        n.node.fy = n.y;
      });
      this._reheat(alphaOnDrag);
    }
    if (unfixedNodes) {
      unfixedNodes.forEach(n => {
        n.node.fx = null;
        n.node.fy = null;
      });
    }

    // Process one simulation tick and return results.
    this._simulation.tick();
    return {
      nodes: this._simulation.nodes(),
      isUpdating: this.isUpdating()
    };
  }

  isUpdating() {
    return this._simulation && this._simulation.alpha() > this._simulation.alphaMin();
  }

  dispose() {
    if (this._simulation) {
      this._simulation.stop();
      this._simulation.on('tick', null);
      this._simulation = null;
    }
  }

  /**
   * "Reheat" the simulation on interaction.
   */
  _reheat(alpha = 0.01, decay = 0.0228) {
    if (this._simulation.alpha() < alpha) {
      this._simulation.alpha(alpha).alphaDecay(decay);
    }
  }
}

GraphSimulation.defaultProps = {
  alphaOnDataChange: 0.25,
  alphaOnDrag: 0.3,
  linkDistance: 200,
  linkStrength: 0.5,
  nBodyStrength: -60,
  nBodyDistanceMin: 1,
  nBodyDistanceMax: 100
};
