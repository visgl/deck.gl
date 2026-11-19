# Using with custom overlays

The Mapbox and MapLibre provider roots are thin bindings of the native `createDeckGL` factory. Use
the same factory to bring your own overlay: a deck.gl overlay for a host map that has no provider
root in this package. Examples of such hosts include the Leaflet and Bing Maps integrations in
this repository:

- [`@deck.gl-community/leaflet`](../../../leaflet/README.md) and its
  [`DeckOverlay`](../../../leaflet/api-reference/deck-overlay.md)
- [`@deck.gl-community/bing-maps`](../../../bing-maps/README.md) and its
  [`DeckOverlay`](../../../bing-maps/api-reference/deck-overlay.md)

[Using with maps](../using-with-maps.md) describes the behavior shared by every overlay root. The
[DeckGL API](../../api-reference/deckgl.md#custom-compatible-overlays) defines the factory options.

## Overlay requirements

The factory accepts any overlay that implements deck.gl's `setProps` and `finalize` lifecycle:

- `setProps(props)` receives the root's deck.gl props on every change, including the `layers`
  produced by JSX layers. It can run before the overlay is attached to its host.
- `finalize()` runs when the root unmounts or recreates the overlay. It releases the overlay's
  deck.gl resources. `MapboxOverlay` and `MapLibreOverlay` also detach themselves from the map in
  `finalize`.

An overlay that lacks one of these methods, or whose `finalize` does not release its resources,
needs a subclass or wrapper that adds it before it can be used with `createDeckGL`.

## Create the root

Create the component once, at module scope, never during render. Creating it during render makes
React remount the root on every render.

```tsx
import {createDeckGL} from '@deck.gl-community/react-fiber';

const DeckGL = createDeckGL({
  createExternalOverlay: props => new MyCompatibleOverlay({...props})
});
```

The factory runs only when the root is first configured, with the root's props. Later changes
reach the overlay through `setProps`. If the overlay reads some props only at construction, list
them in `recreateOverlayOnChange` so that a change finalizes the overlay and calls the factory again.

## Attach to the host

Give the factory an `attach` function, and the root accepts a `map` prop. `attach(map, overlay)`
attaches the overlay with the host's own API and returns a function that detaches it. The root
calls it for each overlay it creates while `map` is set, and calls the returned function before it
replaces or finalizes the overlay, when `map` changes or becomes `null`, and on unmount. A Strict
Mode replay can call the pair twice, so both steps must be safe to repeat. `map` never reaches the
overlay.

```tsx
const DeckGL = createDeckGL({
  createExternalOverlay: props => new MyCompatibleOverlay(props),
  attach: (map, overlay) => {
    overlay.addTo(map);
    return () => overlay.remove();
  }
});

<DeckGL map={hostMap}>{/* Layer components */}</DeckGL>;
```

The Mapbox and MapLibre roots use `attach` to call `map.addControl` and `map.removeControl`. An
overlay that a host attaches with `setMap`, such as `GoogleMapsOverlay`, would use
`(map, overlay) => { overlay.setMap(map); return () => overlay.setMap(null); }`.

Without `attach`, the application attaches the instance it receives through `onDeckChange`, as in
[Attach the overlay to the host map](../using-with-maps.md#attach-the-overlay-to-the-host-map).
The root then treats `map` like any other prop: if the overlay declares its own `map` prop, the
root passes it to the constructor and to `setProps`.

The host map owns the camera. Do not pass `viewState`, `initialViewState` or `controller` to a
custom overlay root. JSX `<deckView>` descriptors reach the overlay only when the root sets
`forwardViews: true`, which suits an overlay that renders deck.gl views beside its map.

## Recipe: ArcGIS

> This recipe is untested and may change.

`@deck.gl/arcgis` does not provide a `setProps` and `finalize` overlay. Its
[`DeckLayer`](https://deck.gl/docs/api-reference/arcgis/deck-layer) is an ArcGIS layer for a 2D
`MapView`, whose deck.gl props are set through `layer.deck`. A small adapter lets `createDeckGL`
drive it, and `attach` adds the layer to the ArcGIS map:

```tsx
import {DeckLayer} from '@deck.gl/arcgis';
import type ArcGISMap from '@arcgis/core/Map';
import {createDeckGL} from '@deck.gl-community/react-fiber';

const ArcGISDeckGL = createDeckGL({
  createExternalOverlay: props => {
    const layer = new DeckLayer({});
    layer.deck.set(props);
    return {layer, setProps: next => layer.deck.set(next), finalize: () => layer.destroy()};
  },
  attach: (map: ArcGISMap, overlay) => {
    map.add(overlay.layer);
    return () => map.remove(overlay.layer);
  }
});

<ArcGISDeckGL map={view.map}>{/* Layer components */}</ArcGISDeckGL>;
```

`DeckLayer` forwards only the deck.gl props it lists, such as `layers`, `layerFilter` and the
picking callbacks. The ArcGIS view owns the camera. For a 3D `SceneView`, deck.gl's `DeckRenderer`
is an external renderer rather than a layer; wire it the same way, with `attach` adding and removing
the renderer through ArcGIS's external renderer API.
