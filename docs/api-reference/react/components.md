# Components

![From v10.0](https://img.shields.io/badge/from-v10.0-green.svg?style=flat-square)

React Fiber has a component for every layer, view, widget and effect that deck.gl ships. Each
subpath matches a deck.gl module, and each component has the deck.gl class's name:

| Import | Components | Install |
| --- | --- | --- |
| `@deck.gl-community/react-fiber/core` | `MapView`, `OrbitView`, `OrthographicView`, `FirstPersonView`, `_GlobeView`, `_CustomProjectionView`, `LightingEffect`, `PostProcessEffect` | `@deck.gl/core` |
| `@deck.gl-community/react-fiber/layers` | Every layer in `@deck.gl/layers` | `@deck.gl/layers` |
| `@deck.gl-community/react-fiber/geo-layers` | Every layer in `@deck.gl/geo-layers`, including `_WMSLayer` | `@deck.gl/geo-layers` |
| `@deck.gl-community/react-fiber/aggregation-layers` | Every layer in `@deck.gl/aggregation-layers` | `@deck.gl/aggregation-layers` |
| `@deck.gl-community/react-fiber/mesh-layers` | `ScenegraphLayer`, `SimpleMeshLayer` | `@deck.gl/mesh-layers` |
| `@deck.gl-community/react-fiber/widgets` | Every widget in `@deck.gl/widgets`, including the `_`-prefixed ones | `@deck.gl/widgets` |

Install the deck.gl package behind each subpath you import. The root import loads none of them,
and bundlers keep only the components you import.

## Props and rendering

A component takes the props of the class's constructor and builds a new instance on every render.
It renders that instance as a [native element](./native-elements.md). deck.gl matches the new
layer with the previous one by `id` and updates only what changed. For widgets and effects,
deck.gl keeps the first instance with a given id and passes it the props of each new one, so a
widget keeps its DOM and state across renders.

View components pass their children through, as `<deckView>` does. Nesting a layer inside a view
does not assign the layer to that view.

```tsx
import {MapView} from '@deck.gl-community/react-fiber/core';
import {ScatterplotLayer} from '@deck.gl-community/react-fiber/layers';
import {ZoomWidget} from '@deck.gl-community/react-fiber/widgets';

<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <MapView id="main" />
  <ScatterplotLayer id="points" data={points} getPosition={d => d.position} />
  <ZoomWidget id="zoom" placement="top-right" />
</DeckGL>;
```

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

`LightingEffect` takes its lights as props, keyed by name, as its constructor does:

```tsx
<LightingEffect ambient={new AmbientLight({intensity: 1})} sun={new DirectionalLight({direction: [-1, -3, -1]})} />
```

`PostProcessEffect` takes its shader pass as the `module` prop, next to that pass's props:

```tsx
import {vignette} from '@luma.gl/effects';

<PostProcessEffect module={vignette} radius={0.5} />;
```

## Custom classes

The root exports a factory for each kind of class. Call it once, at module level, to make a
component for a custom or community class. No registration is needed:

```tsx
import {
  createEffectComponent,
  createLayerComponent,
  createViewComponent,
  createWidgetComponent
} from '@deck.gl-community/react-fiber';

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

React DevTools shows each component under the class's `layerName`, or its class name. For a class
with another constructor signature, render the instance with a [native element](./native-elements.md).
