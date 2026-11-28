# Using deck.gl with React

[`@deck.gl/react`](../api-reference/react/overview.md) is a React renderer for deck.gl. You write layers, views, widgets and effects as JSX.

## Install

```bash
npm install react react-dom @deck.gl/react @deck.gl/core @deck.gl/layers
```

:::note
Until deck.gl 10.0 is released, this installs deck.gl 9.4. To try the 10.0 prerelease, pin each deck.gl package to it, including the base map package if you use one:

```bash
npm install react react-dom @deck.gl/react@10.0.0-alpha.2 @deck.gl/core@10.0.0-alpha.2 @deck.gl/layers@10.0.0-alpha.2
```

:::

The renderer needs React 19.2 or later, and TypeScript 5.3 or later for its types. Each component subpath needs its deck.gl package, such as `@deck.gl/layers` for `@deck.gl/react/layers`. To add deck.gl to a base map, also install its deck.gl package, such as `@deck.gl/maplibre`. Each base map guide in [Using with maps](../developer-guide/react/using-with-maps.md) lists what to install.

## Render on the client {#using-deckgl-with-ssr}

`DeckGL` creates a browser renderer. In an application that uses React Server Components, put `'use client'` at the beginning of the module that imports `DeckGL`, or import it from an existing client-marked module. In traditional SSR without React Server Components, create a map or overlay after hydration in an effect.

Server rendering a `DeckGL` root works without `ssr: false`. The standalone root renders its wrapper and canvas markup, a map root renders no markup, and deck.gl creates the renderer or overlay after hydration.

Some of deck.gl's dependencies, such as `d3-scale`, are ES modules only. If server rendering fails with `require() of ES Module`, set `"type": "module"` in your project's `package.json`, or load the component that renders `DeckGL` only on the client.

## Size the root

Without a `canvas` prop, `DeckGL` renders a wrapper and a canvas. The wrapper is absolutely positioned with a `width` and `height` of `100%`, so it fills the nearest positioned ancestor. Give that element a size in your CSS, or set `width`, `height` or `style` on `DeckGL`. To use a canvas that you render and size yourself, pass it as `canvas`; `DeckGL` then renders no wrapper or canvas. See [Root DOM and sizing](../api-reference/react/deckgl.md#root-dom-and-sizing).

## Add layers

Import a layer component from the subpath named after its deck.gl module, and pass it the layer's props:

```tsx
import {DeckGL} from '@deck.gl/react';
import {LineLayer} from '@deck.gl/react/layers';
import type {MapViewState} from '@deck.gl/core';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13
};

type Line = {
  from: [longitude: number, latitude: number];
  to: [longitude: number, latitude: number];
};

export function App({data}: {data: Line[]}) {
  return (
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
      <LineLayer
        id="lines"
        data={data}
        getSourcePosition={d => d.from}
        getTargetPosition={d => d.to}
      />
    </DeckGL>
  );
}
```

Props are checked against `LineLayerProps`. The accessors are typed by the data type, which is inferred from `data` or passed as `<LineLayer<Line>>`.

deck.gl matches layers by `id`. A layer without one gets an id from its place in the React tree, so give layers in a changing list a `key`, and give an `id` to any layer that other code refers to. See [Ids](../api-reference/react/components.md#ids).

Use ordinary React components to organize a map. A component can load its own data with hooks and return one or more layers:

```tsx
import {ScatterplotLayer} from '@deck.gl/react/layers';

function Airports() {
  const airports = useAirports(); // your data hook
  return <ScatterplotLayer id="airports" data={airports} getPosition={d => d.coordinates} />;
}

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <Airports />
</DeckGL>;
```

## Add views, widgets and effects

Views and effects come from `@deck.gl/react/core`, and widgets from `@deck.gl/react/widgets`:

```tsx
import {AmbientLight} from '@deck.gl/core';
import {LightingEffect, MapView} from '@deck.gl/react/core';
import {ZoomWidget} from '@deck.gl/react/widgets';

const ambientLight = new AmbientLight({intensity: 1});

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <MapView id="main-map" />
  <ZoomWidget id="zoom" />
  <LightingEffect ambient={ambientLight} />
  <Airports />
</DeckGL>;
```

The React tree is flattened before deck.gl receives it. A view can contain React children for composition, but it does not scope its child layers to that view. To draw a layer in one view only, use [`layerFilter`](../api-reference/core/deck.md#layerfilter).

## Add a base map

Import `DeckGL` from `@deck.gl/react/mapbox`, `@deck.gl/react/maplibre` or `@deck.gl/react/google-maps` to add deck.gl to a map that your application creates, including one rendered with [react-map-gl](https://visgl.github.io/react-map-gl/) or [React Google Maps](https://visgl.github.io/react-google-maps/). Keep map creation in browser-only code. [Using with maps](../developer-guide/react/using-with-maps.md) compares the integrations and links a guide for each.

## Wrap your own classes

For a custom layer, view, widget or effect, make a component once with `createLayerComponent`, `createViewComponent`, `createWidgetComponent` or `createEffectComponent`. No registration is needed:

```tsx
import {createLayerComponent} from '@deck.gl/react';
import {FlowLayer as DeckFlowLayer} from './flow-layer';

export const FlowLayer = createLayerComponent(DeckFlowLayer);
```

When you already have an instance, for example from `useMemo`, pass it to a native element: `<deckLayer layer={layer} />`, `<deckView>`, `<deckWidget>` or `<deckEffect>`. See [Native elements](../api-reference/react/native-elements.md).

## Use the `layers` prop

`DeckGL` also accepts deck.gl's `layers` prop. Layers from the prop draw on top of the layers from JSX. This helps when moving an existing deck.gl app to React one part at a time. Every layer from both sources needs a unique id.

```tsx
import {ScatterplotLayer as DeckScatterplotLayer} from '@deck.gl/layers';
import {ScatterplotLayer} from '@deck.gl/react/layers';

<DeckGL
  layers={[new DeckScatterplotLayer({id: 'existing-points', data: []})]}
  initialViewState={INITIAL_VIEW_STATE}
>
  <ScatterplotLayer id="react-points" data={[]} />
</DeckGL>;
```

## Use the `Deck` instance

`onDeckChange` receives the root's `Deck` instance, and `null` when the root is cleaned up. Store it in state if another component needs it:

```tsx
import {useEffect, useState} from 'react';
import type {Deck} from '@deck.gl/core';
import {DeckGL} from '@deck.gl/react';

function DeckMap() {
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    if (!deck) {
      return;
    }
    // Connect imperative behavior to this root instance.
  }, [deck]);

  return (
    <DeckGL onDeckChange={setDeck}>
      <Airports />
    </DeckGL>
  );
}
```

Passing a new `onDeckChange` function on each render does not recreate the root.

Callbacks such as `onClick` are deck.gl event handlers, passed to the root or a layer. They are not React synthetic events.

## Performance

Building layers on every render is cheap. deck.gl matches each layer with the previous render by `id` and only updates GPU resources when its props change. See [Should I be creating new layers on every render?](../developer-guide/using-layers.md#should-i-be-creating-new-layers-on-every-render)

Callbacks such as `onHover` and `onViewStateChange` can run on every animation frame. Setting React state in them rerenders your components, so keep expensive work in `useMemo` and out of the render path.

## Next steps

- [DeckGL API](../api-reference/react/deckgl.md) covers the root's props and lifecycle.
- [Components](../api-reference/react/components.md) lists every component subpath.
- [Debugging](../developer-guide/react/debugging.md) traces a problem through the renderer.
- The [React get-started examples](https://github.com/visgl/deck.gl/tree/master/examples-v10/get-started/react) are minimal applications, one per base map.
- To upgrade from deck.gl 9, see [Migrating from the previous API](../developer-guide/react/migrate-from-deckgl-react.md). The previous API is still available from `@deck.gl/react/legacy`.
