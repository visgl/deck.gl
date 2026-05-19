# View Layout

The view layout helpers build stable deck.gl view arrays from a declarative layout tree. They are generic utilities for applications that need multiple coordinated views without hand-computing every view rectangle in render code.

```js
import {buildViewsFromViewLayout} from '@deck.gl/widgets';
```

## Usage

Start by defining the deck.gl `View` instances that your application needs. Then place them in a plain layout object tree and compile that tree for the current deck canvas size.

```js
import {Deck, OrthographicView} from '@deck.gl/core';
import {
  buildViewsFromViewLayout,
  _SplitterWidget as SplitterWidget
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

const SIDEBAR_MAIN_SPLIT_ID = 'sidebar-main';

const VIEW_LAYOUT = {
  orientation: 'horizontal',
  splitId: SIDEBAR_MAIN_SPLIT_ID,
  initialSplit: 0.25,
  minSplit: 0.15,
  maxSplit: 0.5,
  views: [
    new OrthographicView({
      id: 'sidebar',
      controller: false,
      minPixels: 180,
      maxPixels: 420
    }),
    new OrthographicView({id: 'main', controller: true})
  ]
};

export function renderToDOM(container) {
  let deck;
  let splitValues = {};
  let deckSize = {
    width: Math.max(1, container.clientWidth),
    height: Math.max(1, container.clientHeight)
  };

  function updateDeck() {
    if (!deck) {
      return;
    }

    const compiled = buildViewsFromViewLayout({
      layout: VIEW_LAYOUT,
      width: deckSize.width,
      height: deckSize.height,
      splitValues
    });

    deck.setProps({
      views: compiled.views,
      widgets: [
        new SplitterWidget({
          split: compiled.splittersById[SIDEBAR_MAIN_SPLIT_ID],
          onSplitChange: (newSplit, splitId) => {
            splitValues = {...splitValues, [splitId]: newSplit};
            updateDeck();
          }
        })
      ]
    });
  }

  deck = new Deck({
    parent: container,
    views: [],
    initialViewState: {
      main: {target: [0, 0, 0], zoom: 0},
      sidebar: {target: [0, 0, 0], zoom: 0}
    },
    layers: [],
    widgets: [],
    onResize: ({width, height}) => {
      deckSize = {width, height};
      updateDeck();
    }
  });

  updateDeck();

  return {remove: () => deck.finalize()};
}
```

The returned `compiled.rectsById` map contains the same resolved rectangles keyed by view id. Use it when you need to position DOM overlays next to deck views, debug the generated layout, or scope non-layer UI to a view rectangle.

The returned `compiled.splittersById` map contains splitter metadata for rows and columns that declare a `splitId`. For two-child splits, the splitter id is exactly `splitId`. For three or more children, the compiler creates one splitter between each adjacent pair using generated ids such as `splitId-0`, `splitId-1`, and so on. Applications that store split values can pass them back into `buildViewsFromViewLayout` via `splitValues`.

Layout items may also define `minPixels` and `maxPixels` to constrain their size in the parent stack axis. The compiler combines those pixel constraints with percentage-based `width` or `height` values, and with `minSplit` and `maxSplit` when returning splitter metadata.

Use `viewPropsById` when an application needs to control layout-only bounds for a view without rebuilding the static layout tree. Override values use the same length syntax as authored view props.

The layout tree is a discriminated union of plain objects:

- `row`: lays out children left to right.
- `column`: lays out children top to bottom.
- `overlay`: gives each child the same parent rectangle.
- `spacer`: reserves empty fixed or flexible space.

Raw deck.gl `View` instances are leaf nodes in `children`. Put layout-only `width`, `height`, `x`, `y`, `minPixels`, and `maxPixels` props directly on the `View` when a leaf needs sizing or overlay positioning.

For split layouts, `ViewLayout` also accepts the `SplitterWidgetViewLayout`-style aliases `orientation: 'horizontal' | 'vertical'` and `views`. A horizontal orientation is equivalent to `type: 'row'`; a vertical orientation is equivalent to `type: 'column'`.

`buildViewsFromViewLayout` compiles a layout tree into:

- `views`: concrete deck.gl views with numeric `x`, `y`, `width`, and `height`.
- `rectsById`: resolved rectangles keyed by deck view id.
- `splittersById`: resolved splitter metadata keyed by split id.

## SplitterWidget Integration

The new view layout system does not pass the layout tree to `SplitterWidget`. Instead, the layout tree declares controlled split metadata, `buildViewsFromViewLayout` resolves that metadata, and `SplitterWidget` renders the handle for one resolved split.

Add `splitId`, `initialSplit`, `minSplit`, and `maxSplit` to a split layout. Store controlled split values in application state, pass them into `buildViewsFromViewLayout` as `splitValues`, and pass the resolved splitter entry to `SplitterWidget`. A two-child split uses `splitId` directly; a split with three or more children generates boundary ids such as `splitId-0` and `splitId-1`.

```js
let splitValues = {};

function updateDeck(width, height) {
  const compiled = buildViewsFromViewLayout({
    layout: VIEW_LAYOUT,
    width,
    height,
    splitValues
  });

  deck.setProps({
    views: compiled.views,
    widgets: [
      new SplitterWidget({
        split: compiled.splittersById['sidebar-main'],
        onSplitChange: (newSplit, splitId) => {
          splitValues = {...splitValues, [splitId]: newSplit};
          updateDeck(width, height);
        }
      })
    ]
  });
}
```

## ViewLayout vs SplitterWidgetViewLayout

The new `ViewLayout` type and the existing `SplitterWidgetViewLayout` type both describe split views, but they are used at different layers:

| Type | Passed to | Owns view generation | Best for |
| --- | --- | --- | --- |
| `SplitterWidgetViewLayout` | `new SplitterWidget({viewLayout})` | `SplitterWidget` | Simple splitter-only layouts where `Deck.views` is unset |
| `ViewLayout` | `buildViewsFromViewLayout({layout})` | Application/compiler | Explicit `Deck.views`, overlays, spacers, rect metadata, and controlled split state |

`SplitterWidgetViewLayout` is passed directly to `new SplitterWidget({viewLayout})`:

```js
new SplitterWidget({
  viewLayout: {
    orientation: 'horizontal',
    initialSplit: 0.25,
    views: [
      new OrthographicView({id: 'sidebar', controller: false}),
      new OrthographicView({id: 'main', controller: true})
    ]
  }
});
```

In this mode `SplitterWidget` owns the split calculation. It is useful for a simple splitter-driven layout when `Deck.views` is unset, or when the app receives generated views through `onChange`.

`ViewLayout` is passed to `buildViewsFromViewLayout`. For split layouts, it can use the same `orientation` and `views` field names:

```js
const layout = {
  orientation: 'horizontal',
  splitId: 'sidebar-main',
  initialSplit: 0.25,
  views: [
    new OrthographicView({id: 'sidebar', controller: false}),
    new OrthographicView({id: 'main', controller: true})
  ]
};

const compiled = buildViewsFromViewLayout({layout, width, height});

deck.setProps({
  views: compiled.views,
  widgets: [
    new SplitterWidget({
      split: compiled.splittersById['sidebar-main'],
      onSplitChange
    })
  ]
});
```

In this mode the compiler owns view generation and the app passes explicit `views` to `Deck`. `ViewLayout` also supports canonical `type: 'row' | 'column'` plus `children`, nested `overlay` and `spacer` nodes, resolved view rectangles, and resolved splitter metadata for other UI.

## Layout Sizing

`width`, `height`, `x`, and `y` accept numbers or CSS-like length strings such as percentages and simple `calc(...)` expressions. The compiler resolves those values against the current parent rectangle before passing numeric bounds to deck.gl.

Use `minPixels` and `maxPixels` on layout items or raw `View` leaves when an item should keep a pixel floor or ceiling while still using percentage sizing.

```ts
new OrthographicView({
  id: 'overlay',
  x: '50%',
  width: 'calc(50% - 12px)',
  height: 80,
  minPixels: 240,
  maxPixels: 480
});
```

## View Reuse

Pass the previous `CompiledDeckViews` result back to `buildViewsFromViewLayout` when a caller needs structural view reuse across renders. A previous view is reused when its id, constructor, and resolved props match the next compilation.

```ts
let compiled = buildViewsFromViewLayout({layout, width, height});

compiled = buildViewsFromViewLayout({
  layout,
  width,
  height,
  previous: compiled
});
```

## Playground JSON

The deck.gl website playground supports a playground-local `viewLayout` field. JSON layout nodes use `layout` as the discriminator to avoid confusing layout nodes with `@@type` class instantiation. Converted deck.gl `View` instances remain the leaf nodes.

```json
{
  "viewLayout": {
    "layout": "column",
    "children": [
      {"@@type": "OrthographicView", "id": "header", "height": 64},
      {
        "layout": "row",
        "splitId": "sidebar-main",
        "initialSplit": 0.22,
        "children": [
          {"@@type": "OrthographicView", "id": "sidebar", "minPixels": 180, "maxPixels": 420},
          {
            "layout": "overlay",
            "children": [
              {"@@type": "OrthographicView", "id": "main"},
              {
                "@@type": "OrthographicView",
                "id": "minimap",
                "x": "calc(100% - 196px)",
                "y": "calc(100% - 136px)",
                "width": 180,
                "height": 120
              }
            ]
          }
        ]
      }
    ]
  }
}
```

This JSON shape is playground-specific. The TypeScript API still uses `ViewLayout` objects with `type: 'row' | 'column' | 'overlay' | 'spacer'`.

## Types

### `ViewLayout` {#viewlayout}

Plain discriminated layout object. Children may be nested layout objects, raw deck.gl `View` instances, or falsey optional children.

### `buildViewsFromViewLayout` {#buildviewsfromviewlayout}

Compiles a layout tree for the current deck canvas size.

Parameters:

- `layout` (`ViewLayout`) - Root layout tree to compile.
- `width` (`number`) - Current deck width in pixels.
- `height` (`number`) - Current deck height in pixels.
- `previous` (`CompiledDeckViews`, optional) - Previous compilation for view reuse.
- `splitValues` (`Record<string, number>`, optional) - Controlled split ratios keyed by layout `splitId`.
- `viewPropsById` (`Record<string, {x?, y?, width?, height?}>`, optional) - Controlled layout-only view prop overrides keyed by deck view id.

Returns:

- `views` (`View[]`) - Concrete deck.gl views.
- `rectsById` (`Record<string, {x, y, width, height}>`) - Resolved rectangles keyed by view id.

## Source

[modules/widgets/src/view-layout/build-views-from-view-layout.ts](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/view-layout/build-views-from-view-layout.ts)
