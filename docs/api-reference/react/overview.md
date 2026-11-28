# @deck.gl/react

![From v10.0](https://img.shields.io/badge/from-v10.0-green.svg?style=flat-square)

`@deck.gl/react` is a client-side React 19 renderer for deck.gl. It lets an application describe deck.gl layers and views in a React tree while keeping deck.gl's normal descriptor objects and ID-based diffing model.

The package has four public surfaces:

| Use case | Import | What it provides |
| --- | --- | --- |
| Applications | `@deck.gl/react` | The `DeckGL` root. |
| Built-in deck.gl classes | `/core`, `/layers`, `/geo-layers`, `/aggregation-layers`, `/mesh-layers`, `/widgets` | A component for each view, layer, widget and effect shipped natively in deck.gl. |
| Custom classes | `@deck.gl/react` | The factories for custom classes, and the `<deckLayer>`, `<deckView>`, `<deckWidget>` and `<deckEffect>` elements. Used by apps and libraries that write their own classes. |
| Direct reconciler integration | `@deck.gl/react/reconciler` | Advanced root-management APIs. Most applications should use the native root instead. |

## Client-only renderer

The native root creates a canvas-backed deck.gl renderer. In an application that uses React Server Components, put `'use client'` at the beginning of the module that imports and renders `DeckGL`, or import it from an existing client-marked module. This React directive marks that module and its transitive dependencies as client code; Next.js is one framework that supports it. In a traditional SSR application without React Server Components, create the map or overlay after hydration in an effect. Server rendering a `DeckGL` root does not require `ssr: false`: the standalone root renders its wrapper and canvas markup, provider roots render no markup, and deck.gl or the overlay is created only after hydration.

## How it works

Import the root, then import a component for each deck.gl class from the subpath named after its
deck.gl module. The JSX looks like deck.gl's own constructors:

```tsx
import {DeckGL} from '@deck.gl/react';
import {MapView} from '@deck.gl/react/core';
import {ScatterplotLayer} from '@deck.gl/react/layers';

type Point = {coordinates: [number, number]};

export function Map({data}: {data: Point[]}) {
  return (
    <DeckGL initialViewState={{longitude: -122.4, latitude: 37.8, zoom: 12}} controller>
      <MapView id="map" />
      <ScatterplotLayer id="points" data={data} getPosition={d => d.coordinates} getRadius={100} />
    </DeckGL>
  );
}
```

Each component builds a new instance from its props on every render, and deck.gl matches it with
the previous one by `id`. Props are type-checked against the class, and layer components infer
their data type from `data`. Components can sit at any depth inside your own components, which can
use hooks and context.

Every component renders one of four elements: `<deckLayer>`, `<deckView>`, `<deckWidget>` or
`<deckEffect>`.

You would use these when working directly with instances or when authoring your own classes.

For your own classes you may also create JSX components with `createLayerComponent` and its view, widget and effect
counterparts, with no registration.

See [Components](components.md)
and [Native elements](native-elements.md).

The renderer flattens the committed tree into deck.gl's `layers`, `views`, `widgets` and `effects`
arrays. Nesting a layer inside a view does not assign the layer to that view: use a layer filter
for view-specific layers. Elements without an `id` get one from their place in the tree; see
[When you need an id](./components.md#when-you-need-an-id). The root
`DeckGL` owns one standalone `Deck`; import `/mapbox`, `/maplibre` or `/google-maps` for a map overlay.

## Installation

Install React 19.2 or later, the package, and the deck.gl packages that your application uses. This example installs the packages for the scatterplot example above:

```bash
npm install react react-dom @deck.gl/react @deck.gl/core @deck.gl/layers
```

The package requires `@deck.gl/core`, and `@deck.gl/widgets` for `@deck.gl/react/legacy`. Every other deck.gl package is an optional peer: install `@deck.gl/mapbox`, `@deck.gl/maplibre` or `@deck.gl/google-maps` for its root, and the layer or widget package behind each component subpath you import. The plain root imports none of them.

TypeScript users need TypeScript 5.3 or later.

## Standalone layout

Without `canvas`, a standalone root renders an absolutely positioned wrapper that fills its nearest positioned ancestor, with `width` and `height` of `100%` by default. Give that ancestor a position and a size in application CSS, or set `width`, `height` or `style` on `DeckGL`. See [Root DOM and sizing](./deckgl.md#root-dom-and-sizing). Alternatively, provide and size the canvas in your own DOM tree with the `canvas` prop. In that case, `DeckGL` renders no wrapper or canvas itself.

## Guides and API reference

- [Get started](../../developer-guide/react/get-started.md) explains the root, client boundaries, layer and view components, and instance access.
- [Using with maps](../../developer-guide/react/using-with-maps.md) explains provider roots and links the [Mapbox](../../developer-guide/react/base-maps/using-with-mapbox.md) and [MapLibre](../../developer-guide/react/base-maps/using-with-maplibre.md) and [Google Maps](../../developer-guide/react/base-maps/using-with-google-maps.md) guides.
- [Migrating from the previous API](../../developer-guide/react/migrate-from-deckgl-react.md) lists the changes to make when coming from `@deck.gl/react/legacy`.
- [Debugging](../../developer-guide/react/debugging.md) explains how to trace a problem through the renderer, with logs, React DevTools and error boundaries.
- [DeckGL API](deckgl.md) documents root ownership and lifecycle behavior.
- [Components](components.md) lists the component subpaths and the factories for custom classes.
- [Native elements](native-elements.md) documents `<deckLayer>`, `<deckView>`, `<deckWidget>` and `<deckEffect>`.
- The [`@deck.gl/react` examples](https://github.com/visgl/deck.gl/tree/master/examples-v10/react) are standalone applications, one per framework.
