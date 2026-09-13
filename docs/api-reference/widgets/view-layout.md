# View Layout

The view layout helpers build stable deck.gl view arrays from a declarative layout tree. They are generic utilities for applications that need multiple coordinated views without hand-computing every view rectangle in render code.

```js
import {buildViewsFromViewLayout} from '@deck.gl/widgets';
```

## Usage

Start by defining the deck.gl `View` instances that your application needs. Then place them in a plain layout object tree and compile that tree for the current deck canvas size.

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {OrthographicView} from '@deck.gl/core';
import {buildViewsFromViewLayout} from '@deck.gl/widgets';
import type {ViewLayout} from '@deck.gl/widgets';

const VIEW_LAYOUT = {
  type: 'column',
  children: [
    new OrthographicView({id: 'header', height: 48, controller: false}),
    {
      type: 'row',
      children: [
        new OrthographicView({id: 'sidebar', controller: false}),
        {
          type: 'overlay',
          children: [
            new OrthographicView({id: 'main', controller: true}),
            new OrthographicView({
              id: 'minimap',
              x: 'calc(100% - 180px)',
              y: 16,
              width: 164,
              height: 120,
              controller: false,
              clear: true
            })
          ]
        }
      ]
    }
  ]
} satisfies ViewLayout;

export function App({width, height, layers}) {
  const compiled = buildViewsFromViewLayout({layout: VIEW_LAYOUT, width, height});
  return <DeckGL views={compiled.views} layers={layers} />;
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

Raw deck.gl `View` instances are leaf nodes in `children`. Put layout-only `width`, `height`, `x`, and `y` props directly on the `View` when a leaf needs fixed sizing or overlay positioning.

For split layouts, `ViewLayout` also accepts the `SplitterWidgetViewLayout`-style aliases `orientation: 'horizontal' | 'vertical'` and `views`. A horizontal orientation is equivalent to `type: 'row'`; a vertical orientation is equivalent to `type: 'column'`.

`buildViewsFromViewLayout` compiles a layout tree into:

- `views`: concrete deck.gl views with numeric `x`, `y`, `width`, and `height`.
- `rectsById`: resolved rectangles keyed by deck view id.
- `splittersById`: resolved splitter metadata keyed by split id.

## Layout Sizing

`width`, `height`, `x`, and `y` accept numbers or CSS-like length strings such as percentages and simple `calc(...)` expressions. The compiler resolves those values against the current parent rectangle before passing numeric bounds to deck.gl.

```ts
new OrthographicView({
  id: 'overlay',
  x: '50%',
  width: 'calc(50% - 12px)',
  height: 80
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

## Types

### `ViewLayout`

Plain discriminated layout object. Children may be nested layout objects, raw deck.gl `View` instances, or falsey optional children.

### `buildViewsFromViewLayout`

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
