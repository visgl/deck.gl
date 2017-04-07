import assert from 'assert';

export default class Graph {
  constructor(nodes, links) {
    this.nodes = nodes || [];
    this.links = links || [];

    this.hoveredNode = null;
    this.draggedNode = null;
    this.offset = {x: 0, y: 0};

    this._nodeMap = {};
    this._linkMap = {};

    this.nodes.forEach(node => {
      assert(node.id || node.id === 0, 'node should have a valid ID.');
      this._nodeMap[node.id] = node;
    });

    this.links.forEach(link => {
      assert(link.id || link.id === 0, 'link should have a valid ID.');
      this._linkMap[link.id] = link;
    });
  }

  setNodes(nodes) {
    this.nodes = nodes;
  }

  setLinks(links) {
    this.links = links;
  }

  setHoveredNode(node) {
    if (node) {
      this.hoveredNode = node;
      this.hoveredNode.hovering = true;
    } else {
      this.hoveredNode.hovering = false;
      this.hoveredNode = null;
    }
  }

  setDraggedNode(node) {
    this.draggedNode = node;
  }

  setOffset({x, y}) {
    this.offset = {x, y};
  }

  addNode(node) {
    if (node) {
      assert(node.id || node.id === 0, 'node should have a valid ID.');
      this.nodes.push(node);
      this._nodeMap[node.id] = node;
    }
  }

  addLink(link) {
    if (link) {
      assert(link.id || link.id === 0, 'link should have a valid ID.');
      this.links.push(link);
      this._linkMap[link.id] = link;
    }
  }

  removeNode(id) {
    if (id) {
      this.nodes = this.nodes.filter(node => node.id !== id);
      this._nodeMap[id] = null;
    }
  }

  removeLink(id) {
    if (id) {
      this.links = this.links.filter(link => link.id !== id);
      this._linkMap[id] = null;
    }
  }

  getDegree(id) {
    return this.findConnectedLinks(id).length;
  }

  findNode(id) {
    return this._nodeMap[id];
  }

  findLink(id) {
    return this._linkMap[id];
  }

  findConnectedLinks(id) {
    return this.links.filter(e => e.source.id === id || e.target.id === id);
  }

  findDualNodes(id) {
    return this.findConnectedLinks(id).reduce((result, link) => {
      result.push(link.source.id === id ? link.target : link.source);
      return result;
    }, []);
  }

  findOrphanedDualNodes(id) {
    return this.findDualNodes(id).filter(node => this.getDegree(node.id) < 2);
  }

  findLinksToOrphanedDualNodes(id) {
    return this.findConnectedLinks(id).reduce((result, link) => {
      if ((link.source.id === id && this.getDegree(link.target.id) < 2) ||
        link.target.id === id && this.getDegree(link.source.id) < 2) {
        result.push(link);
      }
      return result;
    }, []);
  }

  resetNodes() {
    this.nodes = [];
    this._nodeMap = {};
  }

  resetLinks() {
    this.links = [];
    this._linkMap = [];
  }

  reset() {
    this.resetNodes();
    this.resetLinks();
  }

  isEmpty() {
    return !this.nodes || !this.nodes.length;
  }

  // ----------------
  // STYLING
  // ----------------

  highlightOneHop(highlighting = true, node = this.hoveredNode) {
    this.findConnectedLinks(node.id).forEach(link => {
      link.highlighting = highlighting;
      link.source.highlighting = highlighting;
      link.target.highlighting = highlighting;
    });
  }
}
