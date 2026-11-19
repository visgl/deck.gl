# Using with maps

deck.gl works without a base map, but a base map gives geospatial layers context. This page
describes what is shared by every base-map integration of `@deck.gl-community/react-fiber`. Each
provider guide then covers installation, examples, and provider-specific options. For the
underlying deck.gl concepts, see deck.gl's [Using with map](https://deck.gl/docs/get-started/using-with-map)
guide.

## Overlaid and interleaved rendering

deck.gl integrates with a base map in one of two ways:

- **Overlaid:** deck.gl renders into its own canvas above the map, and the two cameras stay in
  sync. The two libraries render independently.
- **Interleaved:** deck.gl renders into the map's WebGL2 context, so deck.gl layers and map layers
  such as labels or 3D buildings can occlude each other.

deck.gl's guide describes both modes in detail:
[overlaid](https://deck.gl/docs/get-started/using-with-map#overlaid) and
[interleaved](https://deck.gl/docs/get-started/using-with-map#interleaved).

## Supported base maps

| Base map | Import path | deck.gl package | Host SDK | Overlaid | Interleaved | React Map GL | Guide | deck.gl guide |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mapbox GL JS | `@deck.gl-community/react-fiber/mapbox` | [`@deck.gl/mapbox`](https://deck.gl/docs/api-reference/mapbox/overview) | `mapbox-gl` | ✓ | ✓ | ✓ | [Using with Mapbox](./base-maps/using-with-mapbox.md) | [Using with Mapbox](https://deck.gl/docs/developer-guide/base-maps/using-with-mapbox) |
| MapLibre GL JS | `@deck.gl-community/react-fiber/maplibre` | [`@deck.gl/maplibre`](https://deck.gl/docs/api-reference/maplibre/overview) | `maplibre-gl` | ✓ | ✓ | ✓ | [Using with MapLibre](./base-maps/using-with-maplibre.md) | [Using with MapLibre](https://deck.gl/docs/developer-guide/base-maps/using-with-maplibre) |
| Google Maps | `@deck.gl-community/react-fiber/google-maps` | [`@deck.gl/google-maps`](https://deck.gl/docs/api-reference/google-maps/overview) | Maps JavaScript API | ✓ | ✓ (vector maps) | [React Google Maps](https://visgl.github.io/react-google-maps/) | [Using with Google Maps](./base-maps/using-with-google-maps.md) | [Using with Google Maps](https://deck.gl/docs/developer-guide/base-maps/using-with-google-maps) |
| Custom overlay | `createDeckGL` from `@deck.gl-community/react-fiber` | The overlay's package | The host's SDK | Overlay-specific | Overlay-specific | Overlay-specific | [Using with custom overlays](./base-maps/using-with-custom-overlays.md) | None |

## Choose a provider root

Use a provider root when the application owns a Mapbox, MapLibre or Google map and needs deck.gl
as a map overlay:

```tsx
import {DeckGL as MapboxDeckGL} from '@deck.gl-community/react-fiber/mapbox';
import {DeckGL as MapLibreDeckGL} from '@deck.gl-community/react-fiber/maplibre';
import {DeckGL as GoogleMapsDeckGL} from '@deck.gl-community/react-fiber/google-maps';
```

A provider root creates the deck.gl overlay only. The application creates, configures, and removes
the host map. Keep map tokens, styles, camera options, terrain, projection, event handlers,
workers, and CSP configuration on the map creator or React Map GL `<Map>`, not on `DeckGL`.

## Choose the overlay mode

Provider roots pass `interleaved?: boolean` to the overlay unchanged, so each overlay's own default
applies:

- Pass `false` for a dedicated deck canvas. This is the default of
  [`MapboxOverlay`](https://deck.gl/docs/api-reference/mapbox/mapbox-overlay#constructor) and
  [`MapLibreOverlay`](https://deck.gl/docs/api-reference/maplibre/overview).
- Pass `true` to share the map's WebGL context. This is the default of
  [`GoogleMapsOverlay`](https://deck.gl/docs/api-reference/google-maps/google-maps-overlay), on
  vector maps.

The Mapbox and MapLibre overlays read `interleaved` only in their constructors, and the Google Maps
overlay when it attaches to its map. When the prop changes, `DeckGL`
finalizes the current overlay, which removes it from the map, and creates a new one.
`onDeckChange` receives `null` and then the new instance. With the `map` prop, `DeckGL` attaches
the new overlay itself; see [Attach the overlay to the host map](#attach-the-overlay-to-the-host-map).
The new overlay starts
without the old one's internal state, such as the hovered object. `interleaved` does not select the
provider; select Mapbox, MapLibre or Google Maps through the import path.

Provider roots render no host DOM node. You can place them inside a React Map GL `<Map>`, or beside
a manual `new Map({container})` integration without adding a child to the map container.

## Views beside the map

The Mapbox and MapLibre roots send JSX views, merged with the `views` prop, to the overlay,
which supports deck.gl's [multi-view usage](https://deck.gl/docs/api-reference/mapbox/mapbox-overlay#multi-view-usage).
Only one view follows the map camera and receives map interaction: the view with id `mapbox` on
the `/mapbox` root and `maplibre` on the `/maplibre` root. The overlay adds it first when the list
has none. Give a JSX view that id to set the map view's position in the list. Keep it the full size
of the map, or its layers drift off the basemap.

The Google Maps root does not send JSX views: `GoogleMapsOverlay` draws one view, which follows the
map camera. See [Using with Google Maps](./base-maps/using-with-google-maps.md#views).

```tsx
import {OrthographicView} from '@deck.gl-community/react-fiber/core';
import {ScatterplotLayer} from '@deck.gl-community/react-fiber/layers';
import {DeckGL} from '@deck.gl-community/react-fiber/maplibre';

<DeckGL
  layerFilter={({layer, viewport}) => (viewport.id === 'inset') === layer.id.startsWith('inset')}
>
  <OrthographicView id="inset" x="75%" width="25%" height="25%" />
  <ScatterplotLayer id="points" data={points} />
  <ScatterplotLayer id="inset-points" data={points} />
</DeckGL>;
```

## Attach the overlay to the host map

Keep the host map in React state and pass it in `map`:

```tsx
const [map, setMap] = useState<MapRef | null>(null);

<Map ref={setMap} mapStyle={MAP_STYLE} initialViewState={INITIAL_VIEW_STATE}>
  <DeckGL map={map} interleaved>
    {/* Layer components, such as <ScatterplotLayer /> */}
  </DeckGL>
</Map>;
```

On the Mapbox and MapLibre roots, `map` takes a Mapbox or MapLibre `Map`, or a React Map GL
`MapRef`. On the Google Maps root it takes a `google.maps.Map`. With it, `DeckGL`:

- adds the overlay as soon as both exist, with `map.addControl` on Mapbox and MapLibre and
  `overlay.setMap(map)` on Google Maps. It does not wait for the map to load; `MapboxOverlay` and
  `MapLibreOverlay` wait for the style, and `GoogleMapsOverlay` for the map's rendering type,
  before they draw.
- adds the new overlay when it recreates the overlay because `interleaved` changed.
- moves the overlay when `map` changes, and removes it when `map` becomes `null` or `DeckGL`
  unmounts.

The state matters: `DeckGL` sees the map only when a render passes it. A map created in an effect,
as in the provider guides' manual examples, is set in state there.

Without `map`, attach the overlay yourself: keep the instance from `onDeckChange` in state, add it
with `map.addControl` in an effect, and remove it with `map.removeControl` in the effect's cleanup.
On Google Maps, call `overlay.setMap(map)` and `overlay.setMap(null)` instead.
The effect must depend on the instance, because `onDeckChange` reports `null` and then a new
instance when the overlay is recreated. React Map GL's `useControl` cannot do this; see the
provider guides.

## Provider prop boundary

The provider root accepts supported deck.gl and overlay props, including layers, effects,
picking callbacks, layer filtering, parameters, and `interleaved`. Do not pass map-owned values
to it. `canvas`, `parent`, `device`, `viewState`, `initialViewState`, and `controller` belong to
the host map. Some providers exclude more props; see the provider guide.

Use a standalone root when the application needs `Deck` and its canvas. For a compatible custom
overlay, use the native `createDeckGL` factory instead of trying to select a provider at render
time. See [Using with custom overlays](./base-maps/using-with-custom-overlays.md).

## Reverse-controlled maps

deck.gl's guides describe a third mode, reverse controlled, in which the `@deck.gl/react` `DeckGL`
component is the root, a React Map GL `<Map>` is its child, and deck.gl owns the camera. Provider
roots do not support this mode. `DeckGL` renders its children with the deck.gl reconciler, which
accepts only `<deckLayer>` and `<deckView>` elements, so it cannot render a `<Map>` child. An application
that needs reverse-controlled rendering should keep using
[`@deck.gl/react`](https://deck.gl/docs/api-reference/react/deckgl) for that map.

## Base map renderer and data provider

The JavaScript library that renders the map is separate from the service that provides its data.
For example, MapLibre GL JS can render tiles from many vector tile services, and Mapbox GL JS can
render any source that serves Mapbox Vector Tiles. Follow the terms of use and attribution
requirements of both the rendering library and the data provider.
