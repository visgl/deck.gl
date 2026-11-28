# DeckGL

![From v10.0](https://img.shields.io/badge/from-v10.0-green.svg?style=flat-square)

`DeckGL` renders deck.gl from a React tree. Import it from `@deck.gl/react` for a standalone `Deck` with its own canvas, or from a map subpath to add deck.gl to a map.

```tsx
import {DeckGL} from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/react/layers';

const points = [{coordinates: [-122.4, 37.8]}];

<DeckGL initialViewState={{longitude: -122.4, latitude: 37.8, zoom: 12}} controller>
  <ScatterplotLayer id="points" data={points} getPosition={d => d.coordinates} />
</DeckGL>;
```

## Properties

The standalone `DeckGL` takes every [`Deck` property](../core/deck.md#properties) and passes it to `Deck`. A map root takes its overlay's properties instead. [Root DOM and sizing](#root-dom-and-sizing) covers `canvas`, `id`, `width`, `height` and `style`, which also shape the DOM that `DeckGL` renders.

### React properties

#### `children` (ReactNode, optional) {#children}

deck.gl elements, and components that render them: [components](components.md) for layers, views, widgets and effects, and [native elements](native-elements.md). They are merged with the `layers`, `views`, `widgets` and `effects` props, as [Mixing elements and props](native-elements.md#mixing-elements-and-props) describes.

#### `onDeckChange` (Function, optional) {#ondeckchange}

Called with the root's instance after deck.gl creates it, and with `null` when the root is cleaned up. The instance is `Deck` on the standalone root and the overlay on a map root. When a map root creates a new overlay, `onDeckChange` receives `null` and then the new instance. Passing a new function on each render does not recreate the root.

#### `ref` (Ref, optional) {#ref}

A React ref that receives the same instance as `onDeckChange`. It is set before `onDeckChange` is called and receives `null` on teardown. A callback ref can return a cleanup function instead.

```tsx
const deckRef = useRef<Deck>(null);

<DeckGL ref={deckRef} layers={layers} />;
```

### Map root properties

These apply to `DeckGL` from `@deck.gl/react/mapbox`, `@deck.gl/react/maplibre` and `@deck.gl/react/google-maps`.

#### `map` (Map | MapRef | google.maps.Map | null, optional) {#map}

* Default: `null`

The map to add the overlay to: a Mapbox or MapLibre `Map`, a React Map GL `MapRef`, or a `google.maps.Map`. `DeckGL` adds each overlay it creates to the map, and removes it when `map` changes or becomes `null` and on unmount. Keep the map in React state so `DeckGL` sees it change. Without `map`, attach the instance from `onDeckChange` yourself, as [Attach the overlay to the host map](../../developer-guide/react/using-with-maps.md#attach-the-overlay-to-the-host-map) shows.

#### `interleaved` (boolean, optional) {#interleaved}

* Default: `false` on `/mapbox` and `/maplibre`, `true` on `/google-maps`

Renders deck.gl layers into the map's WebGL2 context, so they can draw between the map's own layers. See [overlaid and interleaved](../../developer-guide/react/using-with-maps.md#overlaid-and-interleaved-rendering). The overlay reads it only when it is created, so changing it creates a new overlay. `onDeckChange` receives `null` and then the new instance, and state such as the hovered object is lost.

## Map roots {#provider-roots}

Each map subpath creates one kind of overlay:

| Import | Overlay | Props type |
| --- | --- | --- |
| `@deck.gl/react/mapbox` | [`MapboxOverlay`](../mapbox/mapbox-overlay.md) | `MapboxDeckGLProps` |
| `@deck.gl/react/maplibre` | [`MapLibreOverlay`](../maplibre/overview.md) | `MapLibreDeckGLProps` |
| `@deck.gl/react/google-maps` | [`GoogleMapsOverlay`](../google-maps/google-maps-overlay.md) | `GoogleMapsDeckGLProps` |

The map owns its canvas and camera, so a map root does not take `canvas`, `parent`, `device`, `viewState`, `initialViewState` or `controller`. The MapLibre root also does not take `width`, `height` or `gl`. Set those on the map. A map root renders no DOM, so it can sit inside a map container that must stay empty.

The Mapbox and MapLibre roots send `<deckView>` elements, merged with the `views` prop, to the overlay, which keeps one view in step with the map camera. See [Views beside the map](../../developer-guide/react/using-with-maps.md#views-beside-the-map).

## Updating props

Removing a prop resets it to deck.gl's default, and so does setting it to `undefined`. A removed `onError` stops being called, removed `parameters` stop applying, and a removed `viewState` returns the camera to deck.gl's own view state. Removing `layers`, `widgets` or `effects` leaves only the JSX elements. Removing `views` when the tree has no `<deckView>` restores deck.gl's default view, and the root then leaves the views alone, so a widget such as `SplitterWidget` can set them.

Effects can be JSX children, as [components](components.md#effects) or [`<deckEffect>`](native-elements.md#deckeffect) elements, or the `effects` prop. deck.gl matches effects by id, so a new instance with the same id updates the mounted effect, and creating effects during render is fine.

## Props that only apply at creation

deck.gl reads some props only when it creates its device, canvas or event manager. Changing or removing them later has no effect, and in development builds the root warns once per prop. To apply a new value, remount `DeckGL` with a new React `key`.

| Prop | Read when deck.gl creates | Changing it |
| --- | --- | --- |
| `canvas` | Its canvas | Creates a new root, with a new `Deck` |
| `interleaved` (map roots) | The overlay | Creates a new overlay; see [`interleaved`](#interleaved) |
| `deviceProps`, `gl` | Its GPU device | No effect; dev warning |
| `debug` | Its GPU device | No effect; dev warning |
| `touchAction`, `eventRecognizerOptions` | Its event manager | No effect; dev warning |
| `_typedArrayManagerProps` | The instance | No effect; dev warning |

deck.gl applies changes to `device` and `_canvases` after creation, so they are not in the table. To draw one `Deck` into several canvases, use [`DeckCanvas`](https://visgl.github.io/deck.gl-community/docs/modules/react/api-reference/deck-canvas) from `@deck.gl-community/react`.

## Root DOM and sizing

Without a [`canvas`](../core/deck.md#canvas) prop, the standalone root renders the same wrapper and canvas as `@deck.gl/react/legacy`:

```html
<div id="deckgl-wrapper" style="position: absolute; z-index: 0; left: 0; top: 0; width: 100%; height: 100%">
  <canvas id="deckgl-overlay" style="left: 0; top: 0"></canvas>
</div>
```

- The ids come from [`id`](../core/deck.md#id). `id="map"` renders `map-wrapper` and a canvas with id `map`. Give each root its own `id` when a page has more than one.
- The wrapper fills its nearest positioned ancestor. [`width`](../core/deck.md#width) and [`height`](../core/deck.md#height) size the wrapper, and the canvas fills it.
- [`style`](../core/deck.md#style) applies to the wrapper, except `mixBlendMode`, which applies to the canvas.

With `canvas`, the root renders no DOM and passes `width`, `height` and `style` to deck.gl. `canvas` takes an `HTMLCanvasElement` or the id of a `<canvas>` element, which can render in the same commit as `DeckGL`. An id that names no mounted `<canvas>` throws. The root keeps the element it found at mount, so to switch to another element with the same id, pass the element itself or remount `DeckGL` with a new `key`.

## Errors and debugging

An error thrown while rendering inside a root, including one for an invalid element, is rethrown from the `DeckGL` component, so the nearest [error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) around it handles the error. An error boundary inside `DeckGL` can only render native elements or `null` as its fallback. Errors that deck.gl raises at runtime, such as a layer whose data fails to load, go to the [`onError`](../core/deck.md#onerror) prop.

[`debug`](../core/deck.md#debug) is passed to `Deck` or the overlay. The root logs through deck.gl's `log`, and the Components tab of React DevTools shows the deck.gl elements inside each root. See [Debugging](../../developer-guide/react/debugging.md).

Callbacks such as `onClick` are deck.gl event handlers, and they are not React synthetic events.

## Custom compatible overlays

For an overlay that the map roots don't cover, make a root with `createDeckGL`:

```tsx
import {createDeckGL} from '@deck.gl/react';

const DeckGL = createDeckGL({
  createExternalOverlay: props => new MyCompatibleOverlay(props),
  recreateOverlayOnChange: ['interleaved']
});
```

* `createExternalOverlay` (Function) - creates the overlay. It runs when the root is created, and again when a prop in `recreateOverlayOnChange` changes. The overlay must implement deck.gl's `setProps` and `finalize`.
* `recreateOverlayOnChange` (string[], optional) - props the overlay reads only when it is created. When one changes, compared with `Object.is`, the root finalizes the overlay and creates a new one. Default `[]`.
* `forwardViews` (boolean, optional) - send `<deckView>` children, merged with the `views` prop, to the overlay. Set it for an overlay that renders deck.gl views beside its map. Default `false`.
* `attach` (Function, optional) - `attach(map, overlay)` gives the root a [`map`](#map) prop. It attaches the overlay to `map` and returns a function that detaches it. Both must be safe to call twice, because Strict Mode can replay them.

See [Using with custom overlays](../../developer-guide/react/base-maps/using-with-custom-overlays.md) for the overlay requirements and [Attach to the host](../../developer-guide/react/base-maps/using-with-custom-overlays.md#attach-to-the-host).

## Advanced reconciler APIs

`@deck.gl/react/reconciler` exports `createRoot` and `unmountAtNode` for direct integration. Most applications use `DeckGL` instead.
