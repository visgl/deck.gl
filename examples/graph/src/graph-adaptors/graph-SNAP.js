const MAX_NUM_NODES = 2000;

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
    this.nodes = [];
    this.links = [];
    this.nodeMap = {};

    data.forEach(link => {
      const {source, target} = link;
      if (source > MAX_NUM_NODES || target > MAX_NUM_NODES) {
        return;
      }

      this.links.push({
        id: this.links.length,
        source,
        target
      });

      let node = this.nodeMap[source];
      if (!node) {
        node = this.nodeMap[source] = {
          id: source,
          sourceCount: 0,
          targetCount: 0
        };
        this.nodes.push(node);
      }
      node.sourceCount++;

      node = this.nodeMap[target];
      if (!node) {
        node = this.nodeMap[target] = {
          id: target,
          sourceCount: 0,
          targetCount: 0
        };
        this.nodes.push(node);
      }
      node.targetCount++;
    });
  }
}
