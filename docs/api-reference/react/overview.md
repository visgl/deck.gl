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

## Install and set up

[Using deck.gl with React](../../get-started/using-with-react.md) covers installation, rendering on the client and sizing the root.

The package requires `@deck.gl/core`, and `@deck.gl/widgets` for `@deck.gl/react/legacy`. Every other deck.gl package is an optional peer: install `@deck.gl/mapbox`, `@deck.gl/maplibre` or `@deck.gl/google-maps` for its root, and the layer or widget package behind each component subpath you import. The plain root imports none of them.

## Guides and API reference

- [Using deck.gl with React](../../get-started/using-with-react.md) walks through the root, client rendering, each kind of component, and instance access.
- [Using with maps](../../developer-guide/react/using-with-maps.md) explains provider roots and links the [Mapbox](../../developer-guide/react/base-maps/using-with-mapbox.md) and [MapLibre](../../developer-guide/react/base-maps/using-with-maplibre.md) and [Google Maps](../../developer-guide/react/base-maps/using-with-google-maps.md) guides.
- [Migrating from the previous API](../../developer-guide/react/migrate-from-deckgl-react.md) lists the changes to make when coming from `@deck.gl/react/legacy`.
- [Debugging](../../developer-guide/react/debugging.md) explains how to trace a problem through the renderer, with logs, React DevTools and error boundaries.
- [DeckGL API](deckgl.md) documents root ownership and lifecycle behavior.
- [Components](components.md) lists the component subpaths and the factories for custom classes.
- [Native elements](native-elements.md) documents `<deckLayer>`, `<deckView>`, `<deckWidget>` and `<deckEffect>`.
- The [React get-started examples](https://github.com/visgl/deck.gl/tree/master/examples-v10/get-started/react) are minimal applications, one per base map.
