# Migrating from the previous API

This page lists the changes to make when you move an app from the deck.gl 9 React API to the React
renderer. deck.gl 10 publishes the previous API as `@deck.gl/react/legacy`, and the renderer as
`@deck.gl/react`. See [From `@deck.gl/react` 9](#from-deckglreact-9). Start with
[Write JSX](#write-jsx), which shows the syntax you end up with.

## Requirements

- React 19.2 or later.
- deck.gl 10.
- TypeScript 5.3 or later, if you use TypeScript.
- A client module: in an app that uses React Server Components, import `DeckGL` from a
  `'use client'` module. See [Render on the client](../../get-started/using-with-react.md#using-deckgl-with-ssr).

## Write JSX

Import the root, and import a component for each deck.gl class from the subpath named after its
deck.gl module. Install the deck.gl package behind each subpath you import.

```tsx
import {DeckGL} from '@deck.gl/react';
import {MapView} from '@deck.gl/react/core';
import {ScatterplotLayer} from '@deck.gl/react/layers';
import {ZoomWidget} from '@deck.gl/react/widgets';

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <MapView id="main" />
  <ScatterplotLayer id="points" data={data} getPosition={d => d.position} />
  <ZoomWidget id="zoom" />
</DeckGL>;
```

| Subpath | Components |
| --- | --- |
| `/core` | The views, `LightingEffect` and `PostProcessEffect` |
| `/layers`, `/geo-layers`, `/aggregation-layers`, `/mesh-layers` | Every layer in that deck.gl module |
| `/widgets` | Every widget in `@deck.gl/widgets` |

Components can sit at any depth inside your own components, which can use hooks and context.
Props are checked against the class, and layer components take its type parameters. For a custom
class, make a component once with `createLayerComponent`, `createViewComponent`,
`createWidgetComponent` or `createEffectComponent`, exported from the root. To render an instance
you built yourself, use `<deckLayer layer={layer} />`, `<deckView>`, `<deckWidget>` or
`<deckEffect>`. See [Components](../../api-reference/react/components.md) and
[Native elements](../../api-reference/react/native-elements.md).

## From `@deck.gl/react` 9

### Change the imports

The root is a named export. Import layers, views and widgets from the `@deck.gl/react` subpaths
instead of the deck.gl modules; the JSX stays the same.

<!-- snippet-check: skip -->
```tsx
// Before
import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {ZoomWidget} from '@deck.gl/react';

// After
import {DeckGL} from '@deck.gl/react';
import {MapView} from '@deck.gl/react/core';
import {ScatterplotLayer} from '@deck.gl/react/layers';
import {ZoomWidget} from '@deck.gl/react/widgets';
```

The root takes the same deck.gl props, renders the same wrapper and canvas, and orders the
`layers` and `views` props against JSX the same way. See
[Root DOM and sizing](../../api-reference/react/deckgl.md#root-dom-and-sizing).

For a `MapboxOverlay` or `MapLibreOverlay`, import `DeckGL` from `/mapbox` or `/maplibre` and
attach the overlay to the map you create. See [Using with maps](using-with-maps.md).

### Removed props reset

Removing a prop now resets it to deck.gl's default. `@deck.gl/react` 9 kept the last value for most
props. A prop set to `undefined`, such as `onLoad={debug ? onLoad : undefined}`, also gets the
default, where `@deck.gl/react` 9 stored the `undefined` and could crash calling it; deck.gl handles
that case itself ([deck.gl#10906](https://github.com/visgl/deck.gl/pull/10906)). A few props only apply when deck.gl is created, and changing them later has no effect; see
[Props that only apply at creation](../../api-reference/react/deckgl.md#props-that-only-apply-at-creation).

### Replace `DeckGLRef`

The root's `ref` receives the `Deck` instance, or the overlay on a map root. Picking calls stay
the same; replace `deckRef.current.deck` with `deckRef.current`:

```tsx
// Before
const deckRef = useRef<DeckGLRef>(null);
deckRef.current?.pickObject({x, y});

// After
const deckRef = useRef<Deck>(null);
deckRef.current?.pickObject({x, y});
```

To re-render when the instance is created or torn down, store it in state with `onDeckChange`.
`DeckGLContext` has no equivalent; pass the instance through your own context or props.

### Remove unsupported children

- **HTML and function children.** `DeckGL` children may only be deck.gl components, native
  elements, and components that render them. Render HTML overlays as siblings of `DeckGL` in a
  positioned container. For per-view content, read viewports with `deck.getViewports()`.
- **react-map-gl `<Map>` as a child.** Create the map yourself and use a map root. See
  [Reverse-controlled maps](using-with-maps.md#reverse-controlled-maps).
- **`useWidget`.** Make a component for a custom widget with `createWidgetComponent`.
- **A custom `Deck` class.** For a custom overlay, use
  [`createDeckGL`](../../api-reference/react/deckgl.md#custom-compatible-overlays).

Nesting a layer inside a view does not assign it to that view, as in `@deck.gl/react/legacy`. See
[Tree shape and deck.gl output](../../api-reference/react/native-elements.md#tree-shape-and-deckgl-output).
