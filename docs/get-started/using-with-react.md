# Using deck.gl with React

[`@deck.gl/react`](../api-reference/react/overview.md) is a React renderer for deck.gl. You write layers, views, widgets and effects as JSX, and deck.gl matches each layer with the previous render by `id`, so only what changed is updated on the GPU.

## Install

```bash
npm install react react-dom @deck.gl/react @deck.gl/core @deck.gl/layers
```

`@deck.gl/react` needs React 19.2 or later. Each component subpath needs its deck.gl package, such as `@deck.gl/layers` for `@deck.gl/react/layers`.

## Render layers

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

- `DeckGL` fills its nearest positioned ancestor, so give that element a size.
- Layer components can sit inside your own components, which can load data with hooks.
- Views and effects come from `@deck.gl/react/core`, and widgets from `@deck.gl/react/widgets`.
- Layer instances you already create still work: pass them in the `layers` prop.

[Get started](../developer-guide/react/get-started.md) walks through each of these.

## Add a base map

Import `DeckGL` from `@deck.gl/react/mapbox`, `@deck.gl/react/maplibre` or `@deck.gl/react/google-maps` to add deck.gl to a map that your application creates, including one rendered with [react-map-gl](https://visgl.github.io/react-map-gl/) or [React Google Maps](https://visgl.github.io/react-google-maps/). [Using with maps](../developer-guide/react/using-with-maps.md) compares them and links a guide for each.

## Performance

Building layers on every render is cheap: deck.gl compares the new layers with the previous ones and only updates GPU resources when props change. See [Should I be creating new layers on every render?](../developer-guide/using-layers.md#should-i-be-creating-new-layers-on-every-render)

Callbacks such as `onHover` and `onViewStateChange` can run on every animation frame. Setting React state in them rerenders your components, so keep expensive work in `useMemo` and out of the render path.

## Server rendering {#using-deckgl-with-ssr}

`DeckGL` renders on the client. With React Server Components, put `'use client'` at the top of the module that renders it. See [Client-only renderer](../api-reference/react/overview.md#client-only-renderer).

Some of deck.gl's dependencies, such as `d3-scale`, are ES modules only. If server rendering fails with `require() of ES Module`, set `"type": "module"` in your project's `package.json`, or load the component that renders `DeckGL` only on the client, for example with Next.js [`dynamic`](https://nextjs.org/docs/app/guides/lazy-loading) and `ssr: false`.

## Upgrading from deck.gl 9

The previous React API is still available from `@deck.gl/react/legacy`. See [Migrating from the previous API](../developer-guide/react/migrate-from-deckgl-react.md).
