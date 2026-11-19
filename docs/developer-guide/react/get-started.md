# Get started

`@deck.gl-community/react-fiber` renders deck.gl in a React client tree. The root exports `DeckGL`, and subpaths named after deck.gl's modules export a component for each built-in layer, view, widget and effect.

## 1. Install the packages you use

Install React, the renderer, and the deck.gl packages used by the application:

```bash
npm install react react-dom @deck.gl-community/react-fiber @deck.gl/core @deck.gl/layers
```

The renderer requires React 19 or later, and TypeScript 5.3 or later for its types. It is built for the deck.gl 10 prerelease packages, `10.0.0-alpha.1`. Each component subpath needs its deck.gl package, such as `@deck.gl/layers` for `/layers`. The standalone root imports no provider package. Add the matching deck.gl provider and host-map SDK only when using a provider root:

```bash
# Mapbox provider root
yarn add @deck.gl/mapbox mapbox-gl

# MapLibre provider root
yarn add @deck.gl/maplibre maplibre-gl
```

The application owns the Mapbox or MapLibre map; keep map creation in browser-only code. A bundled MapLibre GL JS 6 application calls `setWorkerUrl` before it creates the first map. See [Using with maps](./using-with-maps.md) for safe overlay attachment and [Configure the MapLibre worker](./base-maps/using-with-maplibre.md#configure-the-maplibre-worker) for worker and CSP guidance.

## 2. Render on the client

The native root creates a browser renderer. In an application that uses React Server Components, put `'use client'` at the beginning of the module that imports `DeckGL`, or import it from an existing client-marked module. This React directive marks that module and its transitive dependencies as client code; Next.js is one framework that supports it. In traditional SSR without React Server Components, initialize a map or overlay after hydration in an effect. Server rendering a `DeckGL` root does not require `ssr: false`: the standalone root renders its wrapper and canvas markup, provider roots render no markup, and deck.gl or the overlay is created only after hydration.

## 3. Size a standalone root

Without a `canvas` prop, `DeckGL` renders a wrapper and canvas like `@deck.gl/react`: the wrapper is absolutely positioned with `width` and `height` of `100%` by default, so it fills the nearest positioned ancestor. Give that container a size in application CSS, or set `width`, `height`, or `style` on `DeckGL`. See [Root DOM and sizing](../api-reference/deckgl.md#root-dom-and-sizing). Supplying `canvas` tells the component to use a canvas you render and size yourself; it then renders no wrapper or canvas.

## 4. Add layers

Import a layer component from the subpath named after its deck.gl module, and pass it the layer's
props. deck.gl matches layers by `id`, so give each one a stable, unique ID.

```tsx
import {DeckGL} from '@deck.gl-community/react-fiber';
import {ScatterplotLayer} from '@deck.gl-community/react-fiber/layers';

type Point = {coordinates: [number, number]};

export function App({data}: {data: Point[]}) {
  return (
    <DeckGL initialViewState={{longitude: -122.4, latitude: 37.8, zoom: 12}} controller>
      <ScatterplotLayer id="points" data={data} getPosition={d => d.coordinates} getRadius={100} />
    </DeckGL>
  );
}
```

Props are checked against `ScatterplotLayerProps`, and the accessors are typed by the data type,
which is inferred from `data` or passed as `<ScatterplotLayer<Point>>`. The component builds a new
layer on every render, and deck.gl updates only what changed.

Use ordinary React components to organize a map. A component can load its own data with hooks and
return one or more layers:

```tsx
function Airports() {
  const airports = useAirports();
  return <ScatterplotLayer id="airports" data={airports} getPosition={d => d.coordinates} />;
}

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <Airports />
</DeckGL>;
```

## 5. Add views, widgets and effects

Views and effects come from `/core`, and widgets from `/widgets`:

```tsx
import {LightingEffect, MapView} from '@deck.gl-community/react-fiber/core';
import {ZoomWidget} from '@deck.gl-community/react-fiber/widgets';

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <MapView id="main-map" />
  <ZoomWidget id="zoom" />
  <LightingEffect ambient={ambientLight} />
  <Airports />
</DeckGL>;
```

The React tree is flattened before deck.gl receives it. A view can contain React children for
composition, but it does not scope its child layers to that view; use deck.gl's `layerFilter`. The
renderer supplies the flattened view list to `Deck`, or to a Mapbox or MapLibre overlay, which
renders it beside the map's own view.

## 6. Wrap your own classes

For a custom layer, view, widget or effect, make a component once with `createLayerComponent`,
`createViewComponent`, `createWidgetComponent` or `createEffectComponent`. No registration is
needed:

```tsx
import {createLayerComponent} from '@deck.gl-community/react-fiber';
import {FlowLayer as DeckFlowLayer} from './flow-layer';

export const FlowLayer = createLayerComponent(DeckFlowLayer);
```

When you already have an instance, for example from `useMemo`, pass it to a native element:
`<deckLayer layer={layer} />`, `<deckView>`, `<deckWidget>` or `<deckEffect>`. See
[Native elements](../api-reference/native-elements.md).

## 7. Combine JSX and `layers` only when needed

`DeckGL` accepts the normal deck.gl `layers` prop as well as JSX layers. As in `@deck.gl/react`, the renderer appends the `layers` prop after the layers produced by JSX, so prop layers draw on top. This is useful while incrementally moving an existing deck.gl configuration to React, but all layers across both sources must have unique IDs.

```tsx
import {ScatterplotLayer as DeckScatterplotLayer} from '@deck.gl/layers';

<DeckGL
  layers={[new DeckScatterplotLayer({id: 'existing-points', data: []})]}
  initialViewState={{longitude: -122.4, latitude: 37.8, zoom: 12}}
>
  <ScatterplotLayer id="react-points" data={[]} />
</DeckGL>;
```

## 8. Access the root instance when necessary

Use `onDeckChange` to receive the root-specific `Deck` instance. Store it in React state if another component needs to react to the instance becoming available:

```tsx
import {useEffect, useState} from 'react';
import type {Deck} from '@deck.gl/core';
import {DeckGL} from '@deck.gl-community/react-fiber';

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

The notification receives `null` when its root is cleaned up. It is not a callback ref: replacing only the callback does not reconfigure or unmount the root, although the replacement receives later lifecycle notifications.

## Add a provider overlay

Provider selection is an import-path decision. Use `/mapbox` for `MapboxOverlay` or `/maplibre` for `MapLibreOverlay`; install the matching `@deck.gl` package and create/configure the host map in your application. Store the overlay from `onDeckChange` in state and attach it to the map in an effect, so it is attached once per instance and detached during cleanup. See [Attach the overlay to the host map](./using-with-maps.md#attach-the-overlay-to-the-host-map) for the lifecycle, and the [Mapbox](./base-maps/using-with-mapbox.md) and [MapLibre](./base-maps/using-with-maplibre.md) guides for complete examples.

Deck callbacks such as `onClick` are deck.gl event handlers, passed to the root or a layer, not React synthetic events.

## Next steps

Read the [DeckGL API](../api-reference/deckgl.md) for standalone and interleaved ownership details, [Using with maps](./using-with-maps.md) for host-map lifecycle and provider guides, [Components](../api-reference/components.md) for every component subpath, and [Native elements](../api-reference/native-elements.md) for the `<deckLayer>`, `<deckView>`, `<deckWidget>` and `<deckEffect>` contract.

If you are upgrading from `@deck.gl/react`, see the [upgrade guide](./migrate-from-deckgl-react.md).

For framework-specific project layouts, see the [React Fiber examples](/examples/react-fiber/overview).
