# ZoomWidget

<img src="https://img.shields.io/badge/from-v9.0-green.svg?style=flat-square" alt="from v9.0" />

import {ZoomWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<ZoomWidgetDemo />

This widget controls the zoom level of a deck.gl view. Click '+' to zoom in by 1, click '-' to zoom out by 1. Supports controlling Map and Globe views.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {ZoomWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  initialViewState: {
    longitude: 0,
    latitude: 52,
    zoom: 4
  },
  controller: true,
  widgets: [
    new ZoomWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {ZoomWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  initialViewState: {
    longitude: 0,
    latitude: 52,
    zoom: 4
  },
  controller: true,
  widgets: [
    new ZoomWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL, ZoomWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL
      initialViewState={{
        longitude: 0,
        latitude: 52,
        zoom: 4
      }}
      controller
    >
      <ZoomWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
  <TabItem value="react-controlled" label="React Controlled">

```tsx
import React, {useState, useCallback} from 'react';
import {DeckGL, ZoomWidget} from '@deck.gl/react';
import type {MapViewState} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: 0,
    latitude: 52,
    zoom: 4
  });

  const onViewStateChange = useCallback(({viewState: vs}) => {
    setViewState(vs as MapViewState);
  }, []);

  return (
    <DeckGL viewState={viewState} onViewStateChange={onViewStateChange} controller>
      <ZoomWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {ZoomWidget, type ZoomWidgetProps} from '@deck.gl/widgets';
new ZoomWidget({} satisfies ZoomWidgetProps);
```

## Types

### `ZoomWidgetProps` {#zoomwidgetprops}

The `ZoomWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `orientation` (string, optional) {#orientation}

* Default: `'vertical'`

Widget button orientation. Valid options are `vertical` or `horizontal`.

#### `zoomInLabel` (string, optional) {#zoominlabel}

* Default: `'Zoom In'`

Tooltip message displayed while hovering a mouse over the zoom in button.

#### `zoomOutLabel` (string, optional) {#zoomoutlabel}

* Default: `'Zoom Out'`

Tooltip message displayed while hovering a mouse over the zoom out button.

#### `transitionDuration` (number, optional) {#transitionduration}

* Default: `200`

Zoom transition duration in milliseconds.

#### `onZoom` (Function, optional) {#onzoom}

```ts
(params: {viewId: string; delta: number; zoom: number}) => void
```

* Default: `() => {}`

Callback when zoom buttons are clicked. Called for each viewport that will be zoomed.

- `viewId`: The view being zoomed
- `delta`: Zoom direction (+1 for zoom in, -1 for zoom out)
- `zoom`: The new zoom level

## Styles

Learn more about how to replace icons in the [styling guide](./styling#replacing-icons).

| Name              | Type                     | Default                                     |
| ----------------- | ------------------------ | ------------------------------------------- |
| `--icon-zoom-in`  | [SVG Data Url][data_url] | [Material Symbol Add][icon_zoom_in_url]     |
| `--icon-zoom-out` | [SVG Data Url][data_url] | [Material Symbol Remove][icon_zoom_out_url] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[icon_zoom_in_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:add:FILL@0;wght@600;GRAD@0;opsz@40
[icon_zoom_out_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:remove:FILL@0;wght@600;GRAD@0;opsz@40

## Source

[modules/widgets/src/zoom-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/zoom-widget.tsx)
