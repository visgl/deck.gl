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

  // pass through as-is
  _processData(data) {
    this.nodes = data.nodes;
    this.links = data.links;
    this.nodeMap = this.nodes.reduce((acc, n) => {
      acc[n.id] = n;
      return acc;
    }, {});
  }
}
