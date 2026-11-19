import * as deckAggregationLayers from '@deck.gl/aggregation-layers';
import * as deckCore from '@deck.gl/core';
import {AmbientLight, Layer, LightingEffect as DeckLightingEffect} from '@deck.gl/core';
import * as deckGeoLayers from '@deck.gl/geo-layers';
import * as deckLayers from '@deck.gl/layers';
import * as deckMeshLayers from '@deck.gl/mesh-layers';
import * as deckWidgets from '@deck.gl/widgets';
import type {ShaderPass} from '@luma.gl/shaders';
import {act, type ComponentType} from 'react';
import {afterEach, describe, expect, it} from 'vitest';

import {createTestRoot} from '../../reconciler/__tests__/test-renderer';
import * as aggregationLayers from '../aggregation-layers';
import * as core from '../core';
import {
  createEffectComponent,
  createLayerComponent,
  createViewComponent,
  createWidgetComponent
} from '../factories';
import * as geoLayers from '../geo-layers';
import * as layers from '../layers';
import * as meshLayers from '../mesh-layers';
import * as widgets from '../widgets';

/** A shader pass with one prop, enough for deck.gl to build a `PostProcessEffect`. */
const tint = {name: 'tint', fs: '', passes: []} as unknown as ShaderPass<{
  amount: number;
}>;

// Tells React that these tests wrap updates in `act`.
(globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;

/** Props a widget's constructor requires, in jsdom. */
const REQUIRED_WIDGET_PROPS: Record<string, object> = {
  // jsdom has no `matchMedia` for the default 'auto' mode.
  ThemeWidget: {initialThemeMode: 'light'},
  _SplitterWidget: {
    viewLayout: {
      orientation: 'horizontal',
      views: [new deckCore.MapView({id: 'left'}), new deckCore.MapView({id: 'right'})]
    }
  }
};

let unmountLast: (() => void) | undefined;

function unmountLastRoot() {
  if (unmountLast) {
    act(() => unmountLast?.());
    unmountLast = undefined;
  }
}

afterEach(unmountLastRoot);

/** Renders `element` in a new test root and returns its mock deck. It first unmounts the previous root, so one root is mounted at a time. */
async function render(element: React.ReactNode) {
  unmountLastRoot();
  const test = createTestRoot();
  unmountLast = test.unmount;
  await act(async () => {
    test.root.render(element);
    await test.flush();
  });
  return test.deck;
}

// Each subpath, the deck.gl module it mirrors, and the instances its components render.
const LAYER_MODULES = [
  ['layers', layers, deckLayers],
  ['geo-layers', geoLayers, deckGeoLayers],
  ['aggregation-layers', aggregationLayers, deckAggregationLayers],
  ['mesh-layers', meshLayers, deckMeshLayers]
] as const;

describe('built-in wrappers', () => {
  for (const [name, wrappers, deckModule] of LAYER_MODULES) {
    it(`wraps every public layer class of @deck.gl/${name} under the same name`, async () => {
      const publicLayerNames = Object.entries(deckModule)
        .filter(([key, value]) => {
          const isLayerClass = typeof value === 'function' && value.prototype instanceof Layer;
          // Underscored exports are sublayers and base classes, except the experimental _WMSLayer.
          return isLayerClass && (!key.startsWith('_') || key === '_WMSLayer');
        })
        .map(([key]) => key)
        .sort();
      expect(Object.keys(wrappers).sort()).toEqual(publicLayerNames);

      for (const [exportName, Wrapper] of Object.entries(wrappers)) {
        const LayerComponent = Wrapper as ComponentType<{id: string}>;
        const deck = await render(<LayerComponent id={exportName} />);
        const DeckLayer = deckModule[exportName as keyof typeof deckModule];
        expect(deck.layers[0]).toBeInstanceOf(DeckLayer);
        expect(deck.layers[0]?.id).toBe(exportName);
      }
    });
  }

  it('wraps every widget class of @deck.gl/widgets under the same name', async () => {
    const widgetNames = Object.entries(deckWidgets)
      .filter(
        ([, value]) => typeof value === 'function' && value.prototype instanceof deckCore.Widget
      )
      .map(([key]) => key)
      .sort();
    expect(Object.keys(widgets).sort()).toEqual(widgetNames);

    for (const [exportName, Wrapper] of Object.entries(widgets)) {
      const WidgetComponent = Wrapper as ComponentType<{id: string}>;
      const deck = await render(
        <WidgetComponent id={exportName} {...REQUIRED_WIDGET_PROPS[exportName]} />
      );
      // Checks the instance only: deck.gl's TimelineWidget overwrites the `id` prop with 'timeline'
      // through a class field. The fix is in progress upstream in deck.gl.
      expect(deck.widgets[0]).toBeInstanceOf(deckWidgets[exportName as keyof typeof deckWidgets]);
    }
  });

  it('wraps the views of @deck.gl/core and keeps their nested children', async () => {
    const viewNames = Object.entries(deckCore)
      .filter(
        ([key, value]) =>
          typeof value === 'function' && value.prototype instanceof deckCore.View && key !== 'View'
      )
      .map(([key]) => key);
    for (const viewName of viewNames) {
      expect(core).toHaveProperty(viewName);
    }

    const deck = await render(
      <core.MapView id="main">
        <layers.ScatterplotLayer id="points" data={[]} />
      </core.MapView>
    );
    expect(deck.views[0]).toBeInstanceOf(deckCore.MapView);
    expect(deck.views[0]?.id).toBe('main');
    expect(deck.getLayerIds()).toEqual(['points']);
  });

  it('wraps LightingEffect with its lights as props, and PostProcessEffect with its module', async () => {
    const ambientLight = new AmbientLight({intensity: 0.5});
    const deck = await render(
      <>
        <core.LightingEffect ambientLight={ambientLight} />
        <core.PostProcessEffect module={tint} amount={0.2} />
      </>
    );

    const [lighting, postProcess] = deck.effects;
    expect(lighting).toBeInstanceOf(DeckLightingEffect);
    expect((lighting as DeckLightingEffect).ambientLight).toBe(ambientLight);
    expect(postProcess).toBeInstanceOf(deckCore.PostProcessEffect);
    expect(postProcess?.id).toBe('tint-pass');
    expect((postProcess as deckCore.PostProcessEffect<typeof tint>).props).toEqual({amount: 0.2});
  });
});

describe('component factories', () => {
  class TrackedLayer extends deckLayers.ScatterplotLayer {
    static layerName = 'TrackedLayer';
  }

  it('wrap custom classes, named after the class for React DevTools', async () => {
    const Tracked = createLayerComponent(TrackedLayer);
    const Main = createViewComponent(deckCore.OrthographicView);
    const Zoom = createWidgetComponent(deckWidgets.ZoomWidget);
    const Lighting = createEffectComponent(DeckLightingEffect);

    expect((Tracked as {displayName?: string}).displayName).toBe('TrackedLayer');
    expect((Main as {displayName?: string}).displayName).toBe('OrthographicView');

    const deck = await render(
      <>
        <Main id="main">
          <Tracked id="tracked" data={[]} />
        </Main>
        <Zoom id="zoom" />
        <Lighting />
      </>
    );
    expect(deck.layers[0]).toBeInstanceOf(TrackedLayer);
    expect(deck.views[0]).toBeInstanceOf(deckCore.OrthographicView);
    expect(deck.widgets[0]).toBeInstanceOf(deckWidgets.ZoomWidget);
    expect(deck.effects[0]).toBeInstanceOf(DeckLightingEffect);
  });
});
