import {scalePow} from 'd3-scale';
import {extent} from 'd3-array';

export default class GraphAdaptor {
  constructor(data) {
    this._processData(data);
  }

  update(data) {
    this._processData(data);
  }

  getTopology() {
    const {nodes, links} = this;
    return {
      nodes,
      links
    };
  }

  getNode(id) {
    return this.nodeMap[id];
  }

  // process hierarchical nested data structure
  _processData(data) {
    this.nodes = [];
    this.links = [];
    this.nodeMap = {};
    this.nodeNameMap = {};

    this._processNode(null, data);

    // scale size for display
    const scale = scalePow()
      .domain(extent(this.nodes, n => n.size))
      .range([6, 20])
      .exponent(0.5);
    this.nodes.forEach(n => {
      n.size = scale(n.size);
    });

    // count links per node for force-directed graph layout
    this.links.forEach(l => {
      l.sourceCount = this.links.reduce((count, ll) =>
        (ll.source === l.source || ll.target === l.source) ? count + 1 : count, 0);
      l.targetCount = this.links.reduce((count, ll) =>
        (ll.source === l.target || ll.target === l.target) ? count + 1 : count, 0);
    });
  }

  _processNode(parent, node) {
    const {name, children, size} = node;
    let newNode = this.nodeNameMap[name];
    if (!newNode) {
      newNode = {
        id: this.nodes.length,
        name,
        size: size || 0
      };
      this.nodeMap[newNode.id] = newNode;
      this.nodeNameMap[name] = newNode;
      this.nodes.push(newNode);
      newNode.children = children ? children.map(child => this._processNode(newNode, child)) : [];
    }

    if (parent) {
      this.links.push({
        id: this.links.length,
        source: parent.id,
        target: newNode.id
      });
    }

    return newNode;
  }
}
