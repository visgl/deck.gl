import {
  LightingEffect,
  MapView,
  PostProcessEffect,
  Widget,
  type WidgetPlacement
} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {createElement} from 'react';
import {describe, expect, it} from 'vitest';

import type {DeckGLElements} from '../jsx';

describe('JSX type tests', () => {
  it('should expose native layer and view elements', () => {
    const layer = new ScatterplotLayer({data: [], id: 'points'});
    const view = new MapView({id: 'main'});
    const validLayer: DeckGLElements['deckLayer'] = {layer};
    const validView: DeckGLElements['deckView'] = {view};
    const classicLayer: import('react').JSX.IntrinsicElements['deckLayer'] = validLayer;
    const automaticLayer: import('react/jsx-runtime').JSX.IntrinsicElements['deckLayer'] =
      validLayer;
    const developmentLayer: import('react/jsx-dev-runtime').JSX.IntrinsicElements['deckLayer'] =
      validLayer;
    const layerElement = createElement('deckLayer', validLayer);
    const viewElement = createElement('deckView', validView);

    expect(layerElement).toBeDefined();
    expect(viewElement).toBeDefined();
    expect(classicLayer).toBeDefined();
    expect(automaticLayer).toBeDefined();
    expect(developmentLayer).toBeDefined();
  });

  it('should type the widget element', () => {
    class TestWidget extends Widget {
      className = 'test-widget';
      placement: WidgetPlacement = 'top-left';
      onRenderHTML(): void {}
    }
    const widget = new TestWidget({id: 'test'});
    const validWidget: DeckGLElements['deckWidget'] = {widget};
    const widgetElement = createElement('deckWidget', validWidget);
    // @ts-expect-error A layer is not a widget.
    const _layerAsWidget: DeckGLElements['deckWidget'] = {widget: new ScatterplotLayer({id: 'x'})};
    // @ts-expect-error Widgets have no children.
    const _widgetWithChildren: DeckGLElements['deckWidget'] = {children: null, widget};

    expect(widgetElement).toBeDefined();
  });

  it('should type the effect element', () => {
    const lighting = new LightingEffect();
    const validEffect: DeckGLElements['deckEffect'] = {effect: lighting};
    const effectElement = createElement('deckEffect', validEffect);
    const _postProcess = (
      <deckEffect effect={new PostProcessEffect({name: 'p', passes: []} as never, {} as never)} />
    );
    const lightingElement = <deckEffect effect={lighting} />;
    // @ts-expect-error A layer is not an effect.
    const _layerAsEffect: DeckGLElements['deckEffect'] = {effect: new ScatterplotLayer({id: 'x'})};
    // @ts-expect-error Effects have no children.
    const _effectWithChildren: DeckGLElements['deckEffect'] = {children: null, effect: lighting};

    expect(effectElement).toBeDefined();
    expect(lightingElement).toBeDefined();
  });

  it('should reject removed typed intrinsic declarations', () => {
    // @ts-expect-error Legacy typed layer intrinsics are not supported.
    const _removedLayer: keyof DeckGLElements = 'scatterplotLayer';
    // @ts-expect-error Legacy typed view intrinsics are not supported.
    const _removedView: keyof DeckGLElements = 'mapView';
  });
});
