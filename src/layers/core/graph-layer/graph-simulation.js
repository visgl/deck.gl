import {forceCenter, forceLink, forceManyBody, forceSimulation} from 'd3-force';
import Graph from './graph';
import {LOGIC} from './constants';

const DEFAULT_OPTIONS = {
  alphaOnDataChange: 0.25,
  alphaOnDrag: 0.1,
  alphaOnHover: 0.01,
  linkStrength: 3,
  nBodyStrength: -120,
  nBodyDistanceMin: 1,
  nBodyDistanceMax: 200
};

export default class GraphSimulation {

  constructor(options, data) {
    /*
    // TODO
    this._onClick = this._onClick.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
    this._onDrag = this._onDrag.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    */
    this._simulation = null;

    this._strength = this._strength.bind(this);
    this._onSimulationTick = this._onSimulationTick.bind(this);

    this._options = Object.assign({}, DEFAULT_OPTIONS, options);
    this._processGraphData(data);
  }

  _onSimulationTick() {
    if (this._neighborNodes) {
      this._neighborNodes.forEach(node => {
        if (node.collapsing) {
          node.alpha = Math.max(0, node.alpha * 0.9);
        } else {
          node.alpha = Math.min(1, node.alpha / 0.9);
        }
      });
    }

    if (this._neighborLinks) {
      this._neighborLinks.forEach(link => {
        if (link.collapsing) {
          link.alpha = Math.max(0, link.alpha * 0.9);
        } else {
          link.alpha = Math.min(1, link.alpha / 0.9);
        }
      });
    }

    // TODO: verify this is not needed in the context of graph-layer / deck.gl,
    // since graph-simulation is no longer a React component
    // and the values flushed by render() previously are here already available to graph-layer.
    // this.forceUpdate();
  }

  /**
   * "Reheat" the simulation on interaction.
   */
  _reheat(alpha = 0.01, decay = 0.0228) {
    if (this._simulation.alpha() < alpha) {
      this._simulation.alpha(alpha).alphaDecay(decay).restart();
    }
  }

  /**
   * Accessor for strength of each link in d3.forceLink().
   */
  _strength(link) {
    if (link.alpha) {
      const {options: {linkStrength}} = this.props;
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
              // TODO: uncomment this once i have an answer on `window` in deck.gl
              // just commenting out for now to push a WIP that lints properly
              /*
              window.setTimeout(() => {
                _node.fx = null;
                _node.fy = null;
              }, 250);
              */
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
      const {alphaOnDataChange} = this._options;
      this._simulation.nodes(g.nodes)
        .force('link', forceLink(g.links).id(n => n.id).strength(this._strength))
        .alpha(alphaOnDataChange).restart();
    } else {
      const {nBodyStrength, nBodyDistanceMin, nBodyDistanceMax} = this._options;
      this._simulation = forceSimulation(g.nodes)
        .force('link', forceLink(g.links).id(n => n.id).strength(this._strength))
        .force('charge', forceManyBody().strength(nBodyStrength)
          .distanceMin(nBodyDistanceMin).distanceMax(nBodyDistanceMax))
        .force('center', forceCenter())
        .on('tick', this._onSimulationTick);
    }
  }

  /*
  _onMouseMove({x, y}) {
    const g = this._graph;

    // handle drag & drop first
    if (g.draggedNode) {
      g.draggedNode.fx = x;
      g.draggedNode.fy = y;
      return;
    }

    // if not in drag & drop mode, find if any node is hovered
    const hoveredNode = this._simulation.find(x, y, 20);

    // if the hovered node is the same with previous, skip
    if (hoveredNode === g.hoveredNode || (!hoveredNode && !g.hoveredNode)) {
      return;
    }

    // reset state for the previous selection
    if (g.hoveredNode) {
      g.highlightOneHop(false);
      g.setHoveredNode(null);
    }

    // set state for the currently selection
    if (hoveredNode) {
      g.setHoveredNode(hoveredNode);
      g.highlightOneHop();

      const {options: {alphaOnHover}} = this.props;
      this._recharge(alphaOnHover);
    }

    // external callback
    this.props.onHover(hoveredNode);
  }

  _onClick({x, y, rightClick = false}) {
    const selectedNode = this._simulation.find(x, y, 20);
    // allow surfacing empty selections
    this.props.onClick(selectedNode && {...selectedNode, rightClick});
  }

  _onDoubleClick({x, y}) {
    const selectedNode = this._simulation.find(x, y, 20);
    if (selectedNode) {
      this.props.onDoubleClick(selectedNode);
    }
  }

  _onDrag({x, y, dragging}) {
    const g = this._graph;

    if (dragging) {
      // find nearest node
      g.setDraggedNode(this._simulation.find(x, y, 20));
      // if exist, set dragging to true, but change position on hover
      if (g.draggedNode) {
        g.draggedNode.dragging = true;
      }
    // if mouse released
    } else {
      if (g.draggedNode) {
        // reset previous draggedNode state
        g.draggedNode.fx = null;
        g.draggedNode.fy = null;
        g.draggedNode.dragging = false;

        const {options: {alphaOnDrag}} = this.props;
        this._recharge(alphaOnDrag);
      }
      // reset draggedNode
      g.draggedNode = null;
    }
  }
  */

  update(data, anchor) {
    // TODO revisit the anchoring logic
    this._processGraphData(data, anchor);

    return {
      nodes: this._graph.nodes,
      links: this._graph.links
    };
  }

  remove() {
    if (this._simulation) {
      this._simulation.on('tick', null);
    }
  }
}
