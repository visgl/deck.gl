import React, {Component} from 'react';
import DeckGL, {OrthographicViewport, COORDINATE_SYSTEM} from 'deck.gl';
import GraphLayoutLayer from './src/graph-layout-layer';

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
    const layer = new GraphLayoutLayer({
      id: 'graph-layout',
      data,
      opacity: 1.0,
      projectionMode: COORDINATE_SYSTEM.IDENTITY,

      layoutAccessors: this.props.layoutAccessors,

      getNodeColor: this.props.getNodeColor,
      getNodeSize: this.props.getNodeSize,
      getNodeIcon: this.props.getNodeIcon,

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
