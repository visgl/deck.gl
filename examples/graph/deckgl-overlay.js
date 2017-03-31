import React, {Component} from 'react';
import DeckGL, {GraphLayer} from 'deck.gl';

export default class DeckGLOverlay extends Component {

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

    const layer = new GraphLayer({
      id: 'graph',
      data,
      opacity: 1.0,

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

      pickable: Boolean(this.props.onHover || this.props.onClick || this.props.onDoubleClick),
      onHover: this.props.onHover,
      onClick: this.props.onClick,
      onDoubleClick: this.props.onDoubleClick
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } onWebGLInitialized={this._initialize} />
    );
  }
}
