import React, {Component} from 'react';
import DeckGL, {OrthographicViewport, COORDINATE_SYSTEM} from 'deck.gl';
import GraphLayoutLayer from './src/graph-layout-layer';

export default class DeckGLOverlay extends Component {
  constructor(props) {
    super(props);
  }

  // TODO: remove for this example, since it uses OrthographicViewport?
  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, data} = this.props;

    if (!data) {
      return null;
    }

    const {width, height} = viewport;
    const layer = new GraphLayoutLayer({
      id: 'graph-layout',
      data,
      opacity: 1.0,
      projectionMode: COORDINATE_SYSTEM.IDENTITY,

      /*
      // from example.js in react-graph
      getNodeIcon={node => ICON_MAPPING[node.type]}
      getNodeStyle={this._getNodeStyle}
      getLinkColor={this._getLinkColor}
      getLinkWidth={() => this._getLinkWidth()}
      */

      /*
      // defaults applied in graph-layer.js, ported from graph-gl.js
      getNodePosition: node => [node.x, node.y, 0],
      getNodeColor: node => node.color || [0, 128, 255, 255],
      getNodeIcon: node => null,
      getNodeSize: node => node.radius || 9,
      getLinkPosition: link => ({
        sourcePosition: [link.source.x, link.source.y],
        targetPosition: [link.target.x, link.target.y]
      }),
      getLinkWidth: link => 4,
      getLinkColor: link => [160, 160, 160],
      */

      // TODO: can this be determined automatically by GraphLayoutLayer?
      pickable: Boolean(this.props.onHover || this.props.onClick || this.props.onDoubleClick),

      onHover: this.props.onHover,
      onClick: this.props.onClick,
      onDoubleClick: this.props.onDoubleClick
    });

    // recalculate viewport on container size change.
    const left = -width / 2;
    const top = -height / 2;
    const glViewport = new OrthographicViewport({width, height, left, top});

    // TODO: clean up viewport / glViewport
    return (
      <DeckGL
        width={width}
        height={height}
        viewport={glViewport}
        layers={ [layer] }
        onWebGLInitialized={this._initialize}
      />
    );
  }
}
