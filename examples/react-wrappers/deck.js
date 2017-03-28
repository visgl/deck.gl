import {createElement, Children} from 'react';
import DeckGL from 'deck.gl';
// import DeckGL, {Layer} from 'deck.gl';

export default function Deck(props) {
  const layers = Children.map(props.children, element => {
    const LayerType = element.type;
    // if (!(LayerType instanceof Layer)) { - instanceof check fails outside deck.gl
    if (!LayerType) {
      throw new Error('DeckGL React component expects child components to be Layers');
    }
    return LayerType ? new LayerType(element.props) : null;
  });
  return createElement(DeckGL, Object.assign({}, props, {layers}));
}
