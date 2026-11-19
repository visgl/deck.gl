// Refs on the native elements receive the deck.gl instance (see getPublicInstance).
import {
  type Effect,
  type Layer,
  LightingEffect,
  MapView,
  type View,
  Widget,
  type WidgetPlacement
} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import '../jsx';

class TestWidget extends Widget {
  className = 'test-widget';
  placement: WidgetPlacement = 'top-left';
  onRenderHTML(): void {}
}

describe('native element refs', () => {
  it('types refs as the element instance', () => {
    const layerRef = createRef<Layer>();
    const widgetRef = createRef<Widget>();
    const viewRef = createRef<View>();
    const effectRef = createRef<Effect>();

    const layer = <deckLayer ref={layerRef} layer={new ScatterplotLayer({id: 'points'})} />;
    const widget = <deckWidget ref={widgetRef} widget={new TestWidget({id: 'test'})} />;
    const view = <deckView ref={viewRef} view={new MapView({id: 'main'})} />;
    const effect = <deckEffect ref={effectRef} effect={new LightingEffect()} />;
    // @ts-expect-error A layer ref does not accept a widget.
    const _wrongRef = <deckWidget ref={layerRef} widget={new TestWidget({id: 'test'})} />;

    expect([layer, widget, view, effect]).toHaveLength(4);
  });
});
