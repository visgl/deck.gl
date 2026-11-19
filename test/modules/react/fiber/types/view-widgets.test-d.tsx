// Widgets that manage views, and multi-view props, type-check as they do in @deck.gl/react.
import {MapView} from '@deck.gl/core';
import {_SplitterWidget as SplitterWidget, ZoomWidget} from '@deck.gl/widgets';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import {DeckGL} from '../../dom/index';

describe('view-layout widgets and multi-view props', () => {
  it('accepts a widget typed for several views', () => {
    const splitter = new SplitterWidget({
      id: 'splitter',
      viewLayout: {
        orientation: 'horizontal',
        views: [new MapView({id: 'left'}), new MapView({id: 'right'})]
      }
    });
    const splitterRef = createRef<SplitterWidget>();

    // Views set by a widget are not in the props, so name their type explicitly.
    const element = (
      <DeckGL<MapView[]>
        controller
        initialViewState={{
          left: {latitude: 0, longitude: 0, zoom: 1},
          right: {latitude: 0, longitude: 0, zoom: 2}
        }}
      >
        <deckWidget ref={splitterRef} widget={splitter} />
        <deckWidget widget={new ZoomWidget({id: 'zoom', viewId: 'left'})} />
      </DeckGL>
    );

    expect(element).toBeDefined();
  });

  it('types the view state from the views prop', () => {
    const element = (
      <DeckGL
        initialViewState={{left: {latitude: 0, longitude: 0, zoom: 1}}}
        views={[new MapView({id: 'left'}), new MapView({id: 'right'})]}
      />
    );
    const _single = (
      <DeckGL initialViewState={{latitude: 0, longitude: 0, zoom: 1}} views={new MapView()} />
    );
    // @ts-expect-error A single map view takes one map view state, not one per view.
    const _wrong = <DeckGL initialViewState={{left: {zoom: 1}}} views={new MapView()} />;

    expect(element).toBeDefined();
  });
});
