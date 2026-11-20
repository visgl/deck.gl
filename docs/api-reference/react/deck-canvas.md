# DeckCanvas (Experimental)

![From v10.0](https://img.shields.io/badge/from-v10.0-green.svg?style=flat-square)

> This component is experimental, which means it does not provide the compatibility and stability that one would typically expect from other features. Use with caution and report any issues that you find on GitHub.

`DeckCanvas` lets one `Deck` draw into several canvases on a page, such as side-by-side map
panels. The panels share one GPU device and one render loop, and layers set on the `Deck` itself
render in every panel.

Each `DeckCanvas` is one panel. It adds a canvas, and that panel's views, layers and widgets, to
a `Deck` that the application creates.

## Usage

```tsx
import {Deck, MapView} from '@deck.gl/core';
import {DeckCanvas} from '@deck.gl/react';
import {useEffect, useRef, useState} from 'react';

function Panels({londonLayers, tokyoLayers}) {
  const parent = useRef<HTMLDivElement>(null);
  const [deck, setDeck] = useState<Deck | null>(null);
  useEffect(() => {
    const deckInstance = new Deck({
      parent: parent.current!,
      _canvases: [],
      views: [],
      initialViewState: {
        london: {longitude: -0.1276, latitude: 51.5072, zoom: 10},
        tokyo: {longitude: 139.7588, latitude: 35.6762, zoom: 10}
      }
    });
    setDeck(deckInstance);
    return () => deckInstance.finalize();
  }, []);
  return <div ref={parent} style={{position: 'relative'}}>
    {deck && <>
    <DeckCanvas deck={deck} id="london-canvas"
      views={new MapView({id: 'london', controller: true})}
      layers={londonLayers} style={{width: 400, height: 300}} />
    <DeckCanvas deck={deck} id="tokyo-canvas"
      views={new MapView({id: 'tokyo', controller: true})}
      layers={tokyoLayers} style={{width: 400, height: 300}} />
    </>}
  </div>;
}
```

## Types

### `DeckCanvasProps`

`DeckCanvas` also takes the HTML attributes of a `<canvas>`, such as `style` and `className`.
They apply only when the component renders its own canvas.

#### `deck` (Deck) {#deck}

The shared `Deck`. Create it with [`_canvases: []`](../core/deck.md#_canvases) to start it in multi-canvas mode. `DeckCanvas`
never creates or finalizes it.

Pass a `Deck` that the application creates. The `Deck` inside `DeckGL`, or inside a basemap
overlay such as `MapboxOverlay`, manages its own canvas and cannot take panels.

#### `views` (View | View[]) {#views}

The panel's views. Pass one view or a nonempty array. View ids must be unique across the shared
`Deck`. A view without a `canvasId` is cloned with this panel's canvas id; a view with a different
`canvasId` throws.

#### `canvas` (HTMLCanvasElement | string, optional) {#canvas}

An existing canvas element, or its DOM id. The canvas must exist when the component mounts. When
set, the component renders no DOM; otherwise it renders a `<canvas>`.

#### `id` (string, optional) {#id}

* Default: the external canvas's id, or a stable generated id

The canvas id. An id that conflicts with the external canvas's id throws.

#### `layers` (LayersList, optional) {#layers}

Layers that render only in this panel's views, including their sublayers. Top-level layer ids must
be unique across all panels and the `Deck`'s own layers.

#### `widgets` (Widget[], optional) {#widgets}

Widgets for this panel. Each needs a unique id and a `viewId` of one of this panel's views. The
`Deck` must be created with a `parent` DOM element that contains the panels; without it, panel
widgets throw. deck.gl reads `parent` when the `Deck` is created, so setting it later does not help.

#### `layerFilter` (function, optional) {#layerfilter}

An extra [`layerFilter`](../core/deck.md#layerfilter) for this panel's views. The `Deck`'s own
filter runs first. The `Deck`'s own layers also pass through this filter in these views.

## Updates and cleanup

A prop change replaces the panel's contribution. Unmounting removes only that panel.

The canvases, views, layers and widgets that the `Deck` was created with stay registered, and its
own layers render in every view. `deck.setProps({layers})` updates those layers and keeps the
mounted panels attached.

## Limitations

- `DeckCanvas` takes no children. Layers, views and widgets go in props, not JSX. Use
  [`DeckGL`](./deckgl.md) for JSX.
- Render callbacks, basemaps and a view state per panel are not supported.
- deck.gl has no `setPropsSource` yet, so `DeckCanvas` wraps the `Deck` instance's `setProps`
  while panels are mounted and restores it when the last one unmounts. Call `deck.setProps`
  through the instance: a reference captured earlier skips the panels. Do not replace
  `deck.setProps` while panels are attached.

This adapts the [DeckCanvas RFC](https://github.com/visgl/deck.gl/issues/10392) to the
experimental `_canvases` API.

## Example

The [multi-canvas cities example](https://github.com/visgl/deck.gl-community/tree/master/examples/react-fiber/multi-canvas)
ports deck.gl's four-city demo to React, including independent basemap
styles, controllers, zoom widgets and shared hover state. Run it with
`yarn workspace example-react-fiber-multi-canvas start` from the repository root.

## Source

[modules/react/src/dom/deck-canvas.tsx](https://github.com/visgl/deck.gl/blob/master/modules/react/src/dom/deck-canvas.tsx)
