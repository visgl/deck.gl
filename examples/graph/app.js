/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {json as requestJSON, csv as requestCSV} from 'd3-request';

import DeckGLOverlay from './deckgl-overlay';
import {default as GraphBasic} from './src/graph-adaptors/graph-basic';
import {default as GraphFlare} from './src/graph-adaptors/graph-flare';
import {default as GraphSNAP} from './src/graph-adaptors/graph-snap';

class Root extends Component {
  //
  // REACT LIFECYCLE
  //
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        width: 500,
        height: 500
      },
      data: null
    };

    this._resize = this._resize.bind(this);
    this._animate = this._animate.bind(this);
    this._onHover = this._onHover.bind(this);
    this._onClick = this._onClick.bind(this);
    this._getNodeColor = this._getNodeColor.bind(this);

    const dataConfig = [
      {
        data: './data/sample-graph.json',
        loader: requestJSON,
        adaptor: GraphBasic
      },
      {
        data: './data/flare.json',
        loader: requestJSON,
        adaptor: GraphFlare
      },
      {
        data: './data/facebook-SNAP.csv',
        loader: requestCSV,
        adaptor: GraphSNAP
      }
    ];
    const dataset = 1;
    const loader = dataConfig[dataset].loader;
    loader(dataConfig[dataset].data, (error, response) => {
      if (!error) {
        // apply timestamp and push loaded sample data into array
        const GraphAdaptor = dataConfig[dataset].adaptor;
        this.setState({
          data: [new GraphAdaptor(response)]
        });
      }
    });
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
      this.setState({hovered: el.target});
    }
  }

  _onClick(el) {
    if (el) {
      this.setState({clicked: el.target});
    } else {
      const {clicked} = this.state;
      if (clicked) {
        this.setState({clicked: null});
      }
    }
  }

  //
  // deck.gl rendering accessors
  //
  _getNodeColor(node) {
    // TODO: demonstrate switching on e.g. node.type (for data that supply `type` field)
    // probably better to implement icon accessor.
    return [0, 128, 255, 255];
  }

  _getNodeSize(node) {
    return node.size || 8;
  }

  //
  // d3-force accessors
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

  _renderInteractionLayer(viewport, hovered, clicked) {
    // Note: node.x/y, calculated by d3 layout,
    // is measured from the center of the layout (of the viewport).
    // Therefore, we offset the node coordinates from the viewport center.
    return (
      <svg width={viewport.width} height={viewport.height} className="interaction-overlay">
        {hovered && <circle
          cx={hovered.x + viewport.width / 2}
          cy={hovered.y + viewport.height / 2}
          r={this._getNodeSize(hovered)}
          className="hovered"
        />}
        {clicked && <circle
          cx={clicked.x + viewport.width / 2}
          cy={clicked.y + viewport.height / 2}
          r={this._getNodeSize(clicked)}
          className="clicked"
        />}
      </svg>
    );
  }

  render() {
    const {viewport, data} = this.state;
    const {hovered, clicked} = this.state;
    const handlers = {
      onHover: this._onHover,
      onClick: this._onClick
    };
    const accessors = {
      getNodeColor: this._getNodeColor,
      getNodeSize: this._getNodeSize,
      linkDistance: this._linkDistance,
      linkStrength: this._linkStrength,
      nBodyStrength: this._nBodyStrength
    };

    return (
      <div>
        <DeckGLOverlay
          viewport={viewport}
          data={data}
          {...handlers}
          {...accessors} />
        {this._renderInteractionLayer(viewport, hovered, clicked)}
      </div>
    );
  }

}

render(<Root />, document.body.appendChild(document.createElement('div')));
