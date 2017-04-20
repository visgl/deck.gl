/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {json as requestJSON, csv as requestCSV} from 'd3-request';

import DeckGLOverlay from './deckgl-overlay';
import {default as GraphBasic} from './graph-layer/adaptor/graph-basic';
import {default as GraphFlare} from './graph-layer/adaptor/graph-flare';
import {default as GraphSNAP} from './graph-layer/adaptor/graph-snap';

// change this to load a different sample dataset (valid: 0-2)
const DATASET = 1;

class Root extends Component {
  //
  // REACT LIFECYCLE
  //
  constructor(props) {
    super(props);

    this._resize = this._resize.bind(this);
    this._animate = this._animate.bind(this);
    this._onHover = this._onHover.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onDragStart = this._onDragStart.bind(this);
    this._onDragMove = this._onDragMove.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
    this._getNodeColor = this._getNodeColor.bind(this);

    // set initial state
    this.state = {
      viewport: {
        width: 500,
        height: 500
      },
      graph: null,
      data: null
    };

    const dataConfig = [
      {
        data: './data/sample-graph.json',
        loader: requestJSON,
        adaptor: GraphBasic,
        hasNodeTypes: true
      },
      {
        data: './data/flare.json',
        loader: requestJSON,
        adaptor: GraphFlare,
        hasNodeTypes: false
      },
      {
        data: './data/facebook-SNAP.csv',
        loader: requestCSV,
        adaptor: GraphSNAP,
        hasNodeTypes: false
      }
    ];
    const loader = dataConfig[DATASET].loader;
    loader(dataConfig[DATASET].data, (error, response) => {
      if (!error) {
        // apply timestamp and push loaded sample data into array
        const GraphAdaptor = dataConfig[DATASET].adaptor;
        const graph = new GraphAdaptor(response);
        this.setState({
          graph,
          data: [graph]
        });
      }
    });

    // only set up icon accessors for sample datasets that have types to be represented as icons.
    if (dataConfig[DATASET].hasNodeTypes) {
      // load icon atlas
      requestJSON('./data/node-icon-atlas.json', (error, response) => {
        if (!error) {
          this.setState({
            iconMapping: response
          });
        }
      });
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
    this._animate();
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this._animationFrame);
  }

  _animate() {
    this.forceUpdate();
    if (typeof window !== 'undefined') {
      this._animationFrame = window.requestAnimationFrame(this._animate);
    }
  }

  _resize() {
    this._onChangeViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onHover(el) {
    if (el) {
      this.setState({hovered: el});
    }
  }

  _onClick(el) {
    if (el) {
      this.setState({clicked: el});
    } else {
      const {clicked} = this.state;
      if (clicked) {
        this.setState({clicked: null});
      }
    }
  }

  _onDragStart(el) {
    if (el) {
      const {viewport} = this.state;
      const {width, height} = viewport;
      const x = el.x - width / 2;
      const y = el.y - height / 2;
      this.setState({
        dragging: {
          node: el.object,
          x,
          y
        }
      });
    }
  }

  _onDragMove(el) {
    if (el) {
      const {viewport} = this.state;
      const {width, height} = viewport;
      const x = el.x - width / 2;
      const y = el.y - height / 2;
      this.setState({
        dragging: {
          node: el.object,
          x,
          y
        }
      });
    }
  }

  _onDragEnd(el) {
    if (el) {
      this.setState({
        dragging: null,
        lastDragged: {
          node: el.object
        }
      });
    }
  }

  //
  // layout (d3-force) accessors
  //
  _linkDistance(link, i) {
    return 20;
  }

  _linkStrength(link, i) {
    if (link.sourceCount || link.targetCount) {
      return 1 / Math.min(link.sourceCount, link.targetCount);
    }
    return 0.5;
  }

  _nBodyStrength(node, i) {
    if (node.size) {
      return -Math.pow(node.size, 1.5) * 3;
    }
    return -60;
  }

  //
  // rendering (deck.gl) accessors
  //
  _getNodeColor(node) {
    return [18, 147, 154, 255];
  }

  _getNodeSize(node) {
    return node.size || 8;
  }

  // map node type to icon in texture atlas
  _getNodeIcon(node) {
    switch (node.type) {
    case 0:
      return 'burger';
    case 1:
      return 'fries';
    case 2:
      return 'soda';
    case 3:
    case 4:
      return 'pie';
    default:
      return null;
    }
  }

  //
  // rendering
  //
  _renderInteractionLayer(viewport, hovered, clicked) {
    // set flags used below to determine if SVG highlight elements should be rendered.
    // if truthy, each flag is replaced with the corresponding element to render.
    const elements = {
      hovered: hovered && hovered.object,
      clicked: clicked && clicked.object
    };
    const relatedElements = {
      hovered: hovered && hovered.relatedObjects,
      clicked: clicked && clicked.relatedObjects
    };
    const elementInfo = {
      hovered: hovered && hovered.object,
      clicked: clicked && clicked.object
    };

    // process related elements first, since they compare themselves to the focused elements
    Object.keys(relatedElements).forEach(k => {
      const els = relatedElements[k];
      if (!els || !els.length) {
        relatedElements[k] = null;
      } else {
        relatedElements[k] = [];
        els.forEach(el => {
          if (el.source) {
            // highlight linked nodes, as well as the links
            const relatedNode = el.source === elements[k] ? el.target : el.source;
            relatedElements[k].push(
              this._renderInteractionElement(relatedNode, `related ${k}`, viewport)
            );
          }
          relatedElements[k].push(
            this._renderInteractionElement(el, `related ${k}`, viewport)
          );
        });
      }
    });

    // process the focused (hovered / clicked) elements
    Object.keys(elements).forEach(k => {
      const el = elements[k];
      elements[k] = el ? this._renderInteractionElement(el, k, viewport) : null;
    });

    // render additional info about the focused elements (only nodes, not links)
    Object.keys(elementInfo).forEach(k => {
      const el = elementInfo[k];
      if (el && el.name) {
        elementInfo[k] = (<text
          x={el.x + viewport.width / 2}
          y={el.y + viewport.height / 2}
          dx={this._getNodeSize(el) + 10}
          dy={-10}
        >{el.name}</text>);
      } else {
        elementInfo[k] = null;
      }
    });

    return (
      <svg width={viewport.width} height={viewport.height} className="interaction-overlay">
        {relatedElements.hovered}
        {elements.hovered}
        {relatedElements.clicked}
        {elements.clicked}
        {elementInfo.hovered}
        {elementInfo.clicked}
      </svg>
    );
  }

  _renderInteractionElement(el, className, viewport) {
    // Note: node.x/y, calculated by d3 layout,
    // is measured from the center of the layout (of the viewport).
    // Therefore, we offset the node coordinates from the viewport center.

    let element;
    if (el.source) {
      // link
      element = (<line
        x1={el.source.x + viewport.width / 2}
        y1={el.source.y + viewport.height / 2}
        x2={el.target.x + viewport.width / 2}
        y2={el.target.y + viewport.height / 2}
        className={className}
        key={`link-${className}-${el.id}`}
      />);
    } else {
      // node
      element = (<circle
        cx={el.x + viewport.width / 2}
        cy={el.y + viewport.height / 2}
        r={this._getNodeSize(el)}
        className={className}
        key={`node-${className}-${el.id}`}
      />);
    }
    return element;
  }

  render() {
    const {viewport, data} = this.state;
    const {hovered, clicked, dragging, lastDragged} = this.state;
    const handlers = {
      onHover: this._onHover,
      onClick: this._onClick,
      onDragStart: this._onDragStart,
      onDragMove: this._onDragMove,
      onDragEnd: this._onDragEnd
    };

    const layoutProps = {
      fixedNodes: dragging ? [dragging] : null,
      unfixedNodes: lastDragged ? [lastDragged] : null
    };

    const layoutAccessors = {
      linkDistance: this._linkDistance,
      linkStrength: this._linkStrength,
      nBodyStrength: this._nBodyStrength
    };

    const linkAccessors = {};
    const nodeAccessors = {
      getNodeColor: this._getNodeColor,
      getNodeSize: this._getNodeSize
    };

    let nodeIconAccessors;
    const {iconMapping} = this.state;
    if (iconMapping) {
      // pass icon accessors if icon mapping is loaded
      nodeIconAccessors = {
        getIcon: this._getNodeIcon.bind(this),
        iconAtlas: './data/node-icon-atlas.png',
        iconMapping,
        sizeScale: 4
      };
    }

    return (
      <div>
        <DeckGLOverlay
          viewport={viewport}
          data={data}
          {...handlers}
          layoutProps={layoutProps}
          layoutAccessors={layoutAccessors}
          linkAccessors={linkAccessors}
          nodeAccessors={nodeAccessors}
          nodeIconAccessors={nodeIconAccessors}
        />
        {this._renderInteractionLayer(viewport, hovered, (dragging || clicked))}
      </div>
    );
  }

}

render(<Root />, document.body.appendChild(document.createElement('div')));
