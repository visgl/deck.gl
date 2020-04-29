/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {json as requestJSON, csv as requestCSV} from 'd3-request';

import DeckGLOverlay from './deckgl-overlay';
import {default as GraphBasic} from './graph-layer/adaptor/graph-basic';
import {default as GraphFlare} from './graph-layer/adaptor/graph-flare';
import {default as GraphSNAP} from './graph-layer/adaptor/graph-snap';

// change this to load a different sample dataset:
// 0: typed data, with types represented as icons
// 1: named data, to show labeling on interaction
// 2: larger dataset
const DATASET = 1;

class Root extends Component {
  //
  // React lifecycle
  //

  constructor(props) {
    super(props);

    this._resize = this._resize.bind(this);
    this._animate = this._animate.bind(this);
    this._onHover = this._onHover.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._getNodeColor = this._getNodeColor.bind(this);

    // set initial state
    this.state = {
      viewport: {
        width: 500,
        height: 500
      },
      data: null,
      iconMapping: null,
      hovered: null,
      clicked: null,
      dragging: null,
      lastDragged: null
    };

    /* eslint-disable max-len */
    const dataConfig = [
      {
        data:
          'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/graph/sample-graph.json',
        loader: requestJSON,
        adaptor: GraphBasic,
        hasNodeTypes: true
      },
      {
        data:
          'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/graph/flare.json',
        loader: requestJSON,
        adaptor: GraphFlare,
        hasNodeTypes: false
      },
      {
        data:
          'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/graph/facebook-SNAP.csv',
        loader: requestCSV,
        adaptor: GraphSNAP,
        hasNodeTypes: false
      }
    ];
    /* eslint-enable max-len */

    const loader = dataConfig[DATASET].loader;
    loader(dataConfig[DATASET].data, (error, response) => {
      if (!error) {
        // "adaptors" are used to parse data into the format
        // required by your layout (e.g. nodes and links arrays for d3-force),
        // and to manage addition / removal of graph elements.
        const GraphAdaptor = dataConfig[DATASET].adaptor;
        const graph = new GraphAdaptor(response);
        this.setState({
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

  shouldComponentUpdate() {
    // Prevent component from updating while animation is running,
    // to ensure layout updating and rendering are synchronized.
    return !this._animationFrame;
  }

  componentDidUpdate() {
    /* eslint-disable react/no-did-update-set-state */
    // lastDragged state lasts only one frame
    const {lastDragged} = this.state;
    if (lastDragged) {
      this.setState({
        lastDragged: null
      });
    }
    /* eslint-enable react/no-did-update-set-state */
  }

  componentWillUnmount() {
    this._stopAnimation();
  }

  _animate() {
    this.forceUpdate();
    if (typeof window !== 'undefined') {
      this._animationFrame = window.requestAnimationFrame(this._animate);
    }
  }

  _stopAnimation() {
    window.cancelAnimationFrame(this._animationFrame);
    this._animationFrame = null;
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onHover(info) {
    if (info) {
      this.setState({hovered: info});
    }
  }

  _onClick(info) {
    if (info) {
      this.setState({clicked: info});
    } else {
      const {clicked} = this.state;
      if (clicked) {
        this.setState({clicked: null});
      }
    }
  }

  _onMouseDown(event) {
    // Use DeckGL.pickObject() to find the object under the mouse,
    // and store it for updating on mouse move.
    const info = this.deckGL.pickObject({x: event.clientX, y: event.clientY});
    if (info) {
      this.setState({
        clicked: info,
        dragging: {
          node: info.object
        }
      });
      this._updateDraggedElement([event.clientX, event.clientY], info.object);
    }
  }

  _onMouseMove(event) {
    if (this.state.dragging) {
      this._updateDraggedElement([event.clientX, event.clientY], this.state.dragging.node);
    }
  }

  _onMouseUp(event) {
    if (this.state.dragging) {
      this.setState({
        dragging: null,
        lastDragged: {
          node: this.state.dragging.node
        }
      });
    }
  }

  _updateDraggedElement(point, node) {
    const {
      viewport: {width, height}
    } = this.state;
    const x = point[0] - width / 2;
    const y = point[1] - height / 2;
    this.setState({
      dragging: {
        node,
        x,
        y
      }
    });
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

  /**
   * The "interaction layer" is an SVG overlay used to apply highlights
   * and labels to the targets of interaction (hovered and clicked/dragged elements).
   */
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

    // process related elements first, since they compare themselves to the focused elements.
    // related elements are:
    // - all links and nodes attached to a node; or
    // - the nodes at each end of a link.
    // see `graph-layout-layer::getPickingInfo()` for more information.
    Object.keys(relatedElements).forEach(k => {
      const els = relatedElements[k];
      if (!els || !els.length) {
        relatedElements[k] = null;
      } else {
        relatedElements[k] = [];
        els.forEach(el => {
          relatedElements[k].push(this._renderInteractionElement(el, `related ${k}`, viewport));
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
        elementInfo[k] = (
          <text x={el.x} y={el.y} dx={this._getNodeSize(el) + 10} dy={-10}>
            {el.name}
          </text>
        );
      } else {
        elementInfo[k] = null;
      }
    });

    // Note: node.x/y, calculated by d3 layout,
    // is measured from the center of the layout (of the viewport).
    // Therefore, we offset the <g> container to align.
    return (
      <svg width={viewport.width} height={viewport.height} className="interaction-overlay">
        <g transform={`translate(${viewport.width / 2},${viewport.height / 2})`}>
          {relatedElements.hovered}
          {elements.hovered}
          {relatedElements.clicked}
          {elements.clicked}
          {elementInfo.hovered}
          {elementInfo.clicked}
        </g>
      </svg>
    );
  }

  _renderInteractionElement(el, className, viewport) {
    let element;
    if (el.source) {
      // link
      element = (
        <line
          x1={el.source.x}
          y1={el.source.y}
          x2={el.target.x}
          y2={el.target.y}
          className={className}
          key={`link-${className}-${el.id}`}
        />
      );
    } else {
      // node
      element = (
        <circle
          cx={el.x}
          cy={el.y}
          r={this._getNodeSize(el)}
          className={className}
          key={`node-${className}-${el.id}`}
        />
      );
    }
    return element;
  }

  render() {
    const {viewport, data} = this.state;
    const {hovered, clicked, dragging, lastDragged} = this.state;

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
      <div
        onMouseDown={this._onMouseDown}
        onMouseMove={this._onMouseMove}
        onMouseUp={this._onMouseUp}
      >
        <DeckGLOverlay
          // eslint-disable-next-line no-return-assign
          deckGLRef={ref => (this.deckGL = ref)}
          viewport={viewport}
          data={data}
          onHover={this._onHover}
          onClick={this._onClick}
          layoutProps={layoutProps}
          layoutAccessors={layoutAccessors}
          linkAccessors={linkAccessors}
          nodeAccessors={nodeAccessors}
          nodeIconAccessors={nodeIconAccessors}
        />
        {this._renderInteractionLayer(viewport, hovered, dragging || clicked)}
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
