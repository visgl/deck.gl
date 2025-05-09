import test from 'tape-promise/tape';
import {SelectionWidget} from '@deck.gl/widgets';

class DummyDeck {
  props: {layers: any[]} = {layers: []};
  setProps(props: any) {
    this.props = {...this.props, ...props};
  }
}

test('SelectionWidget adds and removes SelectionLayer', t => {
  const deck = new DummyDeck();
  const widget = new SelectionWidget({id: 'sel', label: 'Select'});
  widget.onAdd({deck: deck as any, viewId: null});

  (widget as any).startSelection();
  t.ok((widget as any).selectionLayer, 'layer is created');
  t.is(deck.props.layers.includes((widget as any).selectionLayer), true, 'layer added');

  (widget as any).stopSelection();
  t.is((widget as any).selectionLayer, null, 'layer cleared');
  t.is(deck.props.layers.includes((widget as any).selectionLayer), false, 'layer removed');
  t.end();
});
