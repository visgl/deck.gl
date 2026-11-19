# Native elements

![From v10.0](https://img.shields.io/badge/from-v10.0-green.svg?style=flat-square)

The native renderer accepts four deck.gl JSX elements: `<deckLayer>`, `<deckView>`, `<deckWidget>` and `<deckEffect>`. Each takes an instance you build. For deck.gl's own classes, the [components](./components.md) build the instance from props and render these elements for you; use the elements when you already have an instance, or for a class with no component. The elements are available after importing the root package:

```tsx
import {DeckGL} from '@deck.gl-community/react-fiber';
```

The `deck` prefix keeps the element names clear of DOM and SVG elements, such as SVG's `view`, and of other renderers' elements.

The import also provides the TypeScript JSX declarations. The elements are not DOM elements and they do not create DOM nodes. Each one carries a constructed deck.gl descriptor into the React Fiber renderer. Normal React components can organize the tree when they ultimately return these elements, but raw DOM nodes and text do not belong inside `DeckGL`: the custom renderer rejects any other host children. Each element also throws, in every build, when its prop is missing or holds another kind of descriptor, for example a `View` passed to `<deckLayer>`.

## Linting

eslint-plugin-react's `react/no-unknown-property` rule, in its recommended config, checks every lowercase tag as a DOM element. `layer`, `view`, `widget` and `effect` are not DOM attributes, so it reports them on the native tags. Allow them with the rule's `ignore` option, which applies to every lowercase tag, including DOM elements:

```js
// eslint.config.js
rules: {
  'react/no-unknown-property': ['error', {ignore: ['layer', 'view', 'widget', 'effect']}]
}
```

The [built-in components](./components.md), such as `<ScatterplotLayer>`, and components made with the [factories](./components.md#custom-classes) have capitalized tags, so the rule does not check them.

## `<deckLayer>`

`<deckLayer>` requires one prop named `layer`. Its value must be a deck.gl `Layer` instance.

```tsx
import {ScatterplotLayer} from '@deck.gl/layers';

<deckLayer
  layer={
    new ScatterplotLayer({
      id: 'airports',
      data: airports,
      getPosition: airport => airport.coordinates,
      getRadius: 100
    })
  }
/>;
```

Use a stable, unique `id` for every layer. deck.gl uses IDs to compare new descriptors with prior descriptors. Outside production builds, the renderer warns about a missing layer ID, and deck.gl warns when two layers share one.

The `layer` prop is intentionally an instance rather than a set of JSX props. Use the layer class from its deck.gl package for its full, typed property API. For example, import `ScatterplotLayer` from `@deck.gl/layers`, not from the native React Fiber package.

## `<deckView>`

`<deckView>` requires one prop named `view`. Its value must be a deck.gl `View` instance.

```tsx
import {MapView} from '@deck.gl/core';

<deckView view={new MapView({id: 'main-map'})} />;
```

Give every view an explicit ID. Outside production builds, the renderer warns when a view has no ID or uses deck.gl's default `unknown` ID.

## `<deckWidget>`

`<deckWidget>` requires one prop named `widget`. Its value must be a deck.gl `Widget` instance, such as one from `@deck.gl/widgets`.

```tsx
import {CompassWidget, ZoomWidget} from '@deck.gl/widgets';

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <deckWidget widget={new ZoomWidget({id: 'zoom'})} />
  {showCompass && <deckWidget widget={new CompassWidget({id: 'compass'})} />}
</DeckGL>;
```

deck.gl matches widgets by ID, as it does layers. Rendering a new widget instance with the same ID updates the mounted widget's props instead of adding another one, so creating the instance during render is fine. A widget has no children. Like `<deckLayer>`, nesting a `<deckWidget>` inside a `<deckView>` does not attach it to that view; set the widget's `viewId` instead.

`SplitterWidget` from `@deck.gl/widgets` sets deck.gl's views itself. Without `<deckView>` children or a `views` prop, the root leaves them alone, so the split survives re-renders. To keep the views in React state instead, pass `onChange` and render the views it reports:

```tsx
import {_SplitterWidget as SplitterWidget} from '@deck.gl/widgets';

function App() {
  const [views, setViews] = useState<View[]>([]);
  const splitter = useMemo(
    () => new SplitterWidget({id: 'splitter', onChange: setViews, viewLayout: VIEW_LAYOUT}),
    []
  );
  return (
    <DeckGL<MapView[]> initialViewState={INITIAL_VIEW_STATE} controller>
      {views.map(view => (
        <deckView key={view.id} view={view} />
      ))}
      <deckWidget widget={splitter} />
    </DeckGL>
  );
}
```

In TypeScript, the view state props are typed from the `views` prop, as in `@deck.gl/react`. For views from `<deckView>` children or a widget, name their type to pass one view state per view: `<DeckGL<MapView[]> initialViewState={{left: LEFT_VIEW_STATE, right: RIGHT_VIEW_STATE}}>`.

## `<deckEffect>`

`<deckEffect>` requires one prop named `effect`. Its value must be a deck.gl effect, such as a `LightingEffect` or a `PostProcessEffect`.

```tsx
import {AmbientLight, LightingEffect, PostProcessEffect} from '@deck.gl/core';
import {vignette} from '@luma.gl/effects';

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <deckEffect effect={new LightingEffect({ambient: new AmbientLight({intensity: 1})})} />
  {showVignette && <deckEffect effect={new PostProcessEffect(vignette, {radius: 0.8})} />}
</DeckGL>;
```

deck.gl matches effects by ID, as it does widgets. Rendering a new effect instance with the same ID updates the mounted effect's props instead of adding another one, so creating the instance during render is fine. A `LightingEffect` always has the ID `lighting-effect`, and a `PostProcessEffect` takes its ID from its shader module, so render at most one `LightingEffect` and one `PostProcessEffect` per shader module. An effect has no children.

## Tree shape and deck.gl output

React components may return, nest, or conditionally render these elements. At commit time, the renderer walks the complete tree in depth-first order, then builds separate flat `layers`, `views`, `widgets` and `effects` arrays for deck.gl. The order of the flattened layer list is the order deck.gl receives, so keep ordering deliberate.

This means that nesting is useful for React composition but does not create a parent-child deck.gl relationship. In this example, the layer is still placed in the root's flat layer list:

```tsx
<deckView view={new MapView({id: 'main-map'})}>
  <deckLayer layer={new ScatterplotLayer({id: 'airports', data: airports})} />
</deckView>;
```

Use deck.gl's normal view and layer configuration when an application needs view-specific rendering behavior. On the Mapbox and MapLibre roots, the overlay keeps its map's view and renders JSX views beside it; see [Views beside the map](../developer-guide/using-with-maps.md#views-beside-the-map).

Refs on these intrinsic elements resolve to their deck.gl instance, not an internal renderer wrapper. Use this low-level escape hatch sparingly; normal React data flow and deck.gl props are easier to keep in sync.

## Mixing elements and props

Each element has a matching `DeckGL` prop: `layers`, `views`, `widgets` and `effects`. The root combines the two, as `@deck.gl/react` does:

- **Layers.** `<deckLayer>` layers come first and `layers` prop layers after them, so prop layers draw on top. IDs must be unique across both lists.
- **Views, widgets and effects.** The root merges them by ID. A prop entry replaces the element with the same ID, and other prop entries follow the elements.

```tsx
<DeckGL
  layers={[new ScatterplotLayer({id: 'existing-layer', data: []})]}
  views={[new MapView({id: 'main-map', controller: true})]}
>
  <deckLayer layer={new ScatterplotLayer({id: 'react-layer', data: []})} />
  <deckView view={new MapView({id: 'main-map'})} />
  <deckView view={new MapView({id: 'minimap', x: '75%', width: '25%', height: '25%'})} />
</DeckGL>;
```

Here deck.gl receives `react-layer` then `existing-layer`, and the prop's `main-map` view then `minimap`.

Removing the last element of a kind leaves only the prop's entries; removing the last `<deckView>` with no `views` prop brings back deck.gl's default view. A root with neither leaves deck.gl's views alone, so a widget such as `SplitterWidget` can set them.

The Mapbox and MapLibre roots merge views the same way; a custom overlay root does only with [`forwardViews`](./deckgl.md#custom-compatible-overlays). Widgets and effects are sent to every external-overlay root.
