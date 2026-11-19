# DeckCanvas

`DeckCanvas` attaches a presentation canvas to an application-owned `Deck`. Multiple
panels share a device and rendering loop, while each panel contributes its own views,
layers and widgets.

```tsx
import {Deck, MapView} from '@deck.gl/core';
import {DeckCanvas} from '@deck.gl-community/react-fiber';
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

The `deck` must be initialized in multi-canvas mode (`_canvases: []`). `DeckCanvas`
never creates or finalizes it. Do not attach a Deck owned
by `DeckGL` or a Mapbox overlay.

## Props

- `deck`: shared imperative `Deck` instance (required).
- `views`: one `View` or a nonempty array of views (required). IDs must be unique
  across the shared Deck. Views are cloned with this canvas's ID if `canvasId` is
  absent; a conflicting `canvasId` throws.
- `canvas`: external `HTMLCanvasElement` or DOM element ID. When supplied, the
  component renders no DOM. Otherwise it renders a `<canvas>`.
- `id`: canvas ID. Defaults to the external canvas's ID or a stable generated ID.
  A conflicting external canvas ID throws. External canvases must exist when the
  component mounts.
- `layers`: local layers, rendered only in this panel's views, including composite
  sublayers. Top-level layer IDs must be unique across all panels and global layers.
- `widgets`: local widgets with unique IDs and a `viewId` belonging to this panel.
  The Deck must be initialized with a `parent` DOM element containing the panels.
  deck.gl captures the widget parent during initialization; setting `parent` later
  does not attach widgets. Without an explicit parent, panel widgets throw.
- `layerFilter`: additional filter for this panel's views. The Deck's global filter
  runs first. Global layers also pass through the panel filter in these views.

Other canvas HTML attributes, such as `style` and `className`, apply to an owned
canvas. Children, JSX layer/view extraction, render callbacks, basemaps and
per-panel view-state ownership are outside this API. Use `DeckGL` for Fiber JSX.

## Updates and cleanup

Prop changes replace the panel contribution. Unmount removes only that panel.
Baseline canvases, views, layers and widgets remain registered; baseline layers
are global. Direct `deck.setProps({layers: globalLayers})` updates the baseline
while keeping mounted contributions attached.

This adapts the [DeckCanvas RFC](https://github.com/visgl/deck.gl/issues/10392) to
the published `_canvases` API. Because deck.gl has no `setPropsSource` yet, the
registry temporarily wraps this Deck instance's `setProps` method and restores
it when the last panel unmounts. Call `deck.setProps` through the instance while
panels are mounted; previously captured references bypass the registry. Do not
replace `deck.setProps` while panels are attached.

## Example

The [multi-canvas cities example](https://github.com/visgl/deck.gl-community/tree/master/examples/react-fiber/multi-canvas)
ports deck.gl's four-city demo to React Fiber, including independent basemap
styles, controllers, zoom widgets and shared hover state. Run it with
`yarn workspace example-react-fiber-multi-canvas start` from the repository root.
