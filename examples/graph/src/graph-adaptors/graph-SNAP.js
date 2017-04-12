export default class {
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

  // pass through as-is
  _processData(data) {
    this.nodes = data.nodes;
    this.links = data.links;
  }
}
