import React, {Component} from 'react';
import DeckGL, {OrthographicViewport, COORDINATE_SYSTEM} from 'deck.gl';
import GraphConductorLayer from './src/graph-conductor-layer';

export default class DeckGLOverlay extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {viewport, data} = this.props;

    if (!data) {
      return null;
    }

    const {width, height} = viewport;
    const layer = new GraphConductorLayer({
      id: 'graph-conductor',
      data,
      opacity: 1.0,
      projectionMode: COORDINATE_SYSTEM.IDENTITY,

      getNodeColor: this.props.getNodeColor,

      onHover: this.props.onHover,
      onClick: this.props.onClick
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
