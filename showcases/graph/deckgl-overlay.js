import React, {Component} from 'react';
import DeckGL, {OrthographicView} from 'deck.gl';
import GraphLayoutLayer from './graph-layer/graph-layout-layer';

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
    const {layoutProps, deckGLRef} = this.props;
    const {layoutAccessors, linkAccessors, nodeAccessors, nodeIconAccessors} = this.props;
    const {onHover, onClick} = this.props;
    const layer = new GraphLayoutLayer({
      id: 'graph-layout',
      data,
      layoutProps,

      layoutAccessors,
      linkAccessors,
      nodeAccessors,
      nodeIconAccessors,

      onHover,
      onClick
    });

    // recalculate viewport on container size change.
    const left = -width / 2;
    const top = -height / 2;
    const view = new OrthographicView({width, height, left, top});

    return <DeckGL ref={deckGLRef} width={width} height={height} views={view} layers={[layer]} />;
  }
}
