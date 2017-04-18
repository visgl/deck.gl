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
   * @param {data}  Data formatted as {nodes: [], links: []}
   */
  update(data) {
    if (this._simulation && data) {
      // If new data are passed, update the simulation with the new data
      const {alphaOnDataChange} = this.props;
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
          alpha: 0
        };
      }
    }

    // Process one simulation tick and return results.
    this._simulation.tick();
    const alpha = this._simulation.alpha();
    return {
      nodes: this._simulation.nodes(),
      alpha: alpha > this._simulation.alphaMin() ? alpha : 0
    };
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
  linkDistance: 200,
  linkStrength: 0.5,
  nBodyStrength: -60,
  nBodyDistanceMin: 1,
  nBodyDistanceMax: 100
};
