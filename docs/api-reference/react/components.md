# Components

![From v10.0](https://img.shields.io/badge/from-v10.0-green.svg?style=flat-square)

React Fiber has a component for every layer, view, widget and effect that deck.gl ships. Each
subpath matches a deck.gl module, and each component has the deck.gl class's name:

| Import | Components | Install |
| --- | --- | --- |
| `@deck.gl/react/core` | Every view | `@deck.gl/core` |
| `@deck.gl/react/core` | `LightingEffect`, `PostProcessEffect` | `@deck.gl/core` |
| `@deck.gl/react/layers` | Every layer | `@deck.gl/layers` |
| `@deck.gl/react/geo-layers` | Every layer | `@deck.gl/geo-layers` |
| `@deck.gl/react/aggregation-layers` | Every layer | `@deck.gl/aggregation-layers` |
| `@deck.gl/react/mesh-layers` | Every layer | `@deck.gl/mesh-layers` |
| `@deck.gl/react/widgets` | Every widget | `@deck.gl/widgets` |

Install the deck.gl package behind each subpath you use.

## Props and rendering

A component takes the props of the class's constructor and builds a new instance on every render.
It renders that instance as a [native element](native-elements.md). deck.gl matches the new
layer with the previous one by `id` and updates only what changed.

```tsx
import {MapView} from '@deck.gl/react/core';
import {ScatterplotLayer} from '@deck.gl/react/layers';
import {ZoomWidget} from '@deck.gl/react/widgets';

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <MapView id="main" />
  <ScatterplotLayer id="points" data={points} getPosition={d => d.position} />
  <ZoomWidget id="zoom" placement="top-right" />
</DeckGL>;
```

## Ids

deck.gl matches each new layer, view, widget and effect with the previous one that has the same `id`, and keeps the matched one's state: a layer's GPU buffers and loaded data, a widget's DOM. Without an `id`, an instance keeps deck.gl's default, its class name, which every instance of the class shares. So the renderer gives a component or [native element](./native-elements.md) without an `id` one from its place in the React tree:

```tsx
<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  {/* ScatterplotLayer/roads and ScatterplotLayer/rivers */}
  {['roads', 'rivers'].map(key => (
    <ScatterplotLayer key={key} data={DATA[key]} getPosition={d => d.position} />
  ))}
</DeckGL>
```

The generated id is the class's default id, then, from the top of `DeckGL` down, each element's `key`, or `#` and its index among its siblings, separated by `/`. Keys are escaped, so `key="a/b"` gives `a%2Fb`, and no two elements can get the same id. A component that renders a single unkeyed element adds nothing, so `<ScatterplotLayer key="roads" />`, or your own `<Roads key="roads" />` that renders one, gives `ScatterplotLayer/roads`. An element alone at the top of `DeckGL` keeps deck.gl's default id. The id lasts as long as React keeps the element mounted.

deck.gl effects take no `id`: a `LightingEffect` has the ID `lighting-effect`, and a `PostProcessEffect` takes its ID from its shader module. An effect component uses that ID as the base, so two effects of one kind can render together. A [`<deckEffect>`](./native-elements.md#deckeffect) keeps its effect's ID.

A widget or effect gets its id in place, and keeps it if you later pass the same instance in a `widgets` or `effects` prop.

An `id` you pass is always kept, even one that equals the class's default, such as `<MapView id="MapView" />` or `<ZoomWidget id="zoom" />`. deck.gl keeps a layer's, view's or widget's default `id` apart from the props you pass, so the renderer can tell the two apart.

### When you need an id

- **Lists that change.** As in any React list, give each element a `key`, or give it an `id`. Without either, inserting, removing or reordering items moves the index-based ids. Each layer then takes over another layer's state and recomputes its attributes, and a `TileLayer` fetches its tiles again. A conditional element, such as `{show && <ScatterplotLayer ... />}`, keeps its siblings' ids, because React keeps its place.
- **Code that refers to an id.** A `layerFilter`, picking results (`info.layer.id`), `getTooltip`, a view state keyed by view id, a view's `viewState: {id}`, a widget's `viewId`, `deck.getViewports()` and `onViewStateChange`'s `viewId` all use the final id. A generated id is predictable, but it changes when you move the element, so give these an explicit `id`.
- **Elements that must match a prop entry.** A `views`, `widgets` or `effects` prop entry on `DeckGL` replaces the element with the same final id. An element without an `id` has a generated one, so to replace it from a prop, give both the same explicit `id`. A `layers` prop entry never replaces a layer element.

Outside production builds, the renderer warns when two layers, views, widgets or effects reach deck.gl with the same id, naming both, for example an explicit `id` that equals a generated one, or a `layers` prop entry that shares an id with a layer element.

## Types

Props are checked against the class's props type, such as `ScatterplotLayerProps`. Layer
components take the same type parameters as the class:

- The data type is inferred from `data`, or passed explicitly: `<ScatterplotLayer<Point> ... />`.
- `GeoJsonLayer` and `MVTLayer` take the feature properties type: `<GeoJsonLayer<{population: number}> ... />`.
- The second type parameter types extension props, as in deck.gl:

  ```tsx
  <ScatterplotLayer<Point, DataFilterExtensionProps<Point>>
    id="points"
    data={points}
    extensions={[new DataFilterExtension()]}
    getFilterValue={d => d.size}
  />
  ```

The types need TypeScript 5.3 or later.

## Effects

`LightingEffect` takes its lights as props, keyed by name:

```tsx
<LightingEffect ambient={new AmbientLight({intensity: 1})} sun={new DirectionalLight({direction: [-1, -3, -1]})} />
```

`PostProcessEffect` takes its shader pass as the `module` prop, next to that pass's props:

```tsx
import {vignette} from '@luma.gl/effects';

<PostProcessEffect module={vignette} radius={0.5} />;
```

## Custom classes

Make JSX components for custom classes using one of the provided factories:

```tsx
import {
  createEffectComponent,
  createLayerComponent,
  createViewComponent,
  createWidgetComponent
} from '@deck.gl/react';

export const FlowLayer = createLayerComponent(DeckFlowLayer);
export const MinimapView = createViewComponent(DeckMinimapView);
export const LegendWidget = createWidgetComponent(DeckLegendWidget);
export const OutlineEffect = createEffectComponent(DeckOutlineEffect);
```

| Factory | Takes | The component |
| --- | --- | --- |
| `createLayerComponent(LayerClass)` | A layer class | Keeps the class's type parameters, so `<FlowLayer<Flow> ... />` types the accessors |
| `createViewComponent(ViewClass)` | A view class | Passes children through |
| `createWidgetComponent(WidgetClass)` | A widget class whose constructor takes a props object | |
| `createEffectComponent(EffectClass)` | An effect class whose constructor takes a props object | |

React DevTools shows each component under the class's `layerName`, or its class name.

The factories call `new Class(props)`. A class whose constructor takes other arguments, as
`new PostProcessEffect(module, props)` does, has no factory: create the instance yourself and
render it with a [native element](native-elements.md).

## Source

[modules/react/src/wrappers](https://github.com/visgl/deck.gl/tree/master/modules/react/src/wrappers)
