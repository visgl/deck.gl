# Using deck.gl with React

[`@deck.gl/react`](../api-reference/react/overview.md) is a React renderer for deck.gl. You write layers, views, widgets and effects as JSX, and deck.gl matches each layer with the previous render by `id`, so only what changed is updated on the GPU.

## Install

```bash
npm install react react-dom @deck.gl/react @deck.gl/core @deck.gl/layers
```

The renderer needs React 19.2 or later, and TypeScript 5.3 or later for its types. Each component subpath needs its deck.gl package, such as `@deck.gl/layers` for `@deck.gl/react/layers`. To add deck.gl to a Mapbox or MapLibre map, also install the matching deck.gl package and map library:

```bash
npm install @deck.gl/mapbox mapbox-gl
npm install @deck.gl/maplibre maplibre-gl
```

## Render on the client {#using-deckgl-with-ssr}

`DeckGL` creates a browser renderer. In an application that uses React Server Components, put `'use client'` at the beginning of the module that imports `DeckGL`, or import it from an existing client-marked module. In traditional SSR without React Server Components, create a map or overlay after hydration in an effect.

Server rendering a `DeckGL` root does not need `ssr: false`: the standalone root renders its wrapper and canvas markup, a map root renders no markup, and deck.gl or the overlay is created only after hydration.

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

Props are checked against `LineLayerProps`, and the accessors are typed by the data type, which is inferred from `data` or passed as `<LineLayer<Line>>`. The component builds a new layer on every render, and deck.gl updates only what changed.

deck.gl matches layers by `id`. A layer without one gets an id from its place in the React tree, so give layers in a changing list a `key`, and give an `id` to any layer that other code refers to. See [Ids](../api-reference/react/components.md#ids).

Use ordinary React components to organize a map. A component can load its own data with hooks and return one or more layers:

```tsx
function Airports() {
  const airports = useAirports();
  return <ScatterplotLayer id="airports" data={airports} getPosition={d => d.coordinates} />;
}

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <Airports />
</DeckGL>;
```

## Add views, widgets and effects

Views and effects come from `@deck.gl/react/core`, and widgets from `@deck.gl/react/widgets`:

```tsx
import {LightingEffect, MapView} from '@deck.gl/react/core';
import {ZoomWidget} from '@deck.gl/react/widgets';

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <MapView id="main-map" />
  <ZoomWidget id="zoom" />
  <LightingEffect ambient={ambientLight} />
  <Airports />
</DeckGL>;
```

The React tree is flattened before deck.gl receives it. A view can contain React children for composition, but it does not scope its child layers to that view; use deck.gl's `layerFilter` for that.

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

`DeckGL` also accepts deck.gl's `layers` prop. Layers from the prop are drawn after, and so on top of, the layers from JSX. This helps when moving an existing deck.gl app to React one part at a time. Every layer from both sources needs a unique id.

```tsx
import {ScatterplotLayer as DeckScatterplotLayer} from '@deck.gl/layers';

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

function Map() {
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

`onDeckChange` is not a callback ref: replacing only the callback does not reconfigure or unmount the root.

Callbacks such as `onClick` are deck.gl event handlers, passed to the root or a layer. They are not React synthetic events.

## Performance

Building layers on every render is cheap: deck.gl compares the new layers with the previous ones and only updates GPU resources when props change. See [Should I be creating new layers on every render?](../developer-guide/using-layers.md#should-i-be-creating-new-layers-on-every-render)

Callbacks such as `onHover` and `onViewStateChange` can run on every animation frame. Setting React state in them rerenders your components, so keep expensive work in `useMemo` and out of the render path.

## Next steps

- [DeckGL API](../api-reference/react/deckgl.md) covers the root's props and lifecycle.
- [Components](../api-reference/react/components.md) lists every component subpath.
- [Debugging](../developer-guide/react/debugging.md) traces a problem through the renderer.
- The [`@deck.gl/react` examples](https://github.com/visgl/deck.gl/tree/master/examples-v10/react) are standalone applications, one per framework.
- To upgrade from deck.gl 9, see [Migrating from the previous API](../developer-guide/react/migrate-from-deckgl-react.md). The previous API is still available from `@deck.gl/react/legacy`.
