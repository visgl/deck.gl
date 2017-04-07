import {forceCenter, forceLink, forceManyBody, forceSimulation} from 'd3-force';
import window from 'global/window';

import Graph from './graph';
import {LOGIC} from './constants';

/**
 * GraphSimulation calculates a force-directed network graph.
 * It accepts a list of nodes and a list of links,
 * and returns {x,y} node locations and alpha (simulation "heat") on update().
 * It provides the graph data management and layout logic
 * using [d3-force](https://github.com/d3/d3-force).
 */
export default class GraphSimulation {
  constructor(props) {
    this._strength = this._strength.bind(this);

    this.props = Object.assign({}, GraphSimulation.defaultProps, props);
    this._graph = null;

    const {data} = this.props;
    this._processGraphData(data);
  }

  update(data, anchor = false) {
    if (data) {
      // if data passed, update graph and simulation
      this._processGraphData(data, anchor);
    }

    // process one simulation tick
    this._simulation.tick();
    const {nodes, links} = this._graph;
    const alpha = this._simulation.alpha();
    return {
      nodes,
      links,
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

  //
  // D3 forceSimulation management
  //
  /**
   * "Reheat" the simulation on interaction.
   */
  _reheat(alpha = 0.01, decay = 0.0228) {
    if (this._simulation.alpha() < alpha) {
      this._simulation.alpha(alpha).alphaDecay(decay);
      // this._simulation.alpha(alpha).alphaDecay(decay).restart();
    }
  }

  /**
   * Accessor for strength of each link in d3.forceLink().
   */
  _strength(link) {
    if (link.alpha) {
      const {linkStrength} = this.props;
      return linkStrength;
    }

    const sourceDegree = this._graph.getDegree(link.source.id);
    const targetDegree = this._graph.getDegree(link.target.id);
    return 1 / Math.min(sourceDegree, targetDegree);
  }

  /**
   * Manage graph data (add/remove nodes, etc) with logical operators
   * and initialize / restart simulation as necessary.
   * TODO (@gnavvy) move to util?
   */
  _processGraphData(data, anchor = false) {
    if (!data || data.length < 1) {
      return;
    }

    this._graph = this._graph || new Graph();
    const g = this._graph;

    data.forEach(graph => {
      const {logic} = graph;
      // if the incoming graph is new, remove previous ones
      if (!logic || logic === LOGIC.NEW) {
        g.reset();
      }

      if (logic === LOGIC.NOT) {
        graph.nodes.forEach(node => {
          if (g.findNode(node.id)) {
            g.removeNode(node.id);
          }
        });
        graph.links.forEach(link => {
          if (g.findLink(link.id)) {
            g.removeLink(link.id);
          }
        });
      } else {
        graph.nodes.forEach(node => {
          let _node = g.findNode(node.id);
          if (_node) {
            // reuse the current position from _node and new props from node
            if (anchor) {
              _node = Object.assign(_node, node, {
                fx: _node.x,
                fy: _node.y
              });
              window.setTimeout(() => {
                _node.fx = null;
                _node.fy = null;
              }, 250);
            } else {
              _node = Object.assign(_node, node);
            }
          } else {
            g.addNode(node);
          }
        });

        graph.links.forEach(link => {
          let _link = g.findLink(link.id);
          if (_link) {
            _link = Object.assign(_link, link);
          } else {
            g.addLink(link);
          }
        });
      }
    });

    if (this._simulation) {
      // If the simulation has already been instantiated, update and restart it.
      const {alphaOnDataChange} = this.props;
      this._simulation.nodes(g.nodes)
        .force('link', forceLink(g.links).id(n => n.id).strength(this._strength))
        .alpha(alphaOnDataChange);
        // .alpha(alphaOnDataChange).restart();
    } else {
      // If the simulation has not yet been instantiated, set it up and start it.
      const {nBodyStrength, nBodyDistanceMin, nBodyDistanceMax} = this.props;
      this._simulation = forceSimulation(g.nodes)
        .force('link', forceLink(g.links).id(n => n.id).strength(this._strength))
        .force('charge', forceManyBody().strength(nBodyStrength)
          .distanceMin(nBodyDistanceMin).distanceMax(nBodyDistanceMax))
        .force('center', forceCenter())
        .stop();
    }
  }
}

GraphSimulation.defaultProps = {
  alphaOnDataChange: 0.25,
  alphaOnDrag: 0.1,
  alphaOnHover: 0.01,
  linkStrength: 3,
  nBodyStrength: -120,
  nBodyDistanceMin: 1,
  nBodyDistanceMax: 200
};
