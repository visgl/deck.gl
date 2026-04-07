# CompassWidget

<img src="https://img.shields.io/badge/from-v9.0-green.svg?style=flat-square" alt="from v9.0" />


import {CompassWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<CompassWidgetDemo />

This widget visualizes bearing and pitch. Click it once to reset bearing to 0, click it a second time to reset pitch to 0. Supports [MapView](../core/map-view.md) and [GlobeView](../core/globe-view.md).

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {CompassWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 11,
    pitch: 45,
    bearing: 30
  },
  controller: true,
  widgets: [
    new CompassWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {CompassWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 11,
    pitch: 45,
    bearing: 30
  },
  controller: true,
  widgets: [
    new CompassWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL, CompassWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL
      initialViewState={{
        longitude: -122.4,
        latitude: 37.8,
        zoom: 11,
        pitch: 45,
        bearing: 30
      }}
      controller
    >
      <CompassWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
  <TabItem value="react-controlled" label="React Controlled">

```tsx
import React, {useState, useCallback} from 'react';
import {DeckGL, CompassWidget} from '@deck.gl/react';
import type {MapViewState} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: -122.4,
    latitude: 37.8,
    zoom: 11,
    pitch: 45,
    bearing: 30
  });

  const onViewStateChange = useCallback(({viewState: vs}) => {
    setViewState(vs as MapViewState);
  }, []);

  return (
    <DeckGL viewState={viewState} onViewStateChange={onViewStateChange} controller>
      <CompassWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {CompassWidget, type CompassWidgetProps} from '@deck.gl/widgets';
new CompassWidget({} satisfies CompassWidgetProps);
```


## Types

### `CompassWidgetProps` {#compasswidgetprops}

The `CompassWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Compass'`

Tooltip message displayed while hovering a mouse over the widget.

#### `transitionDuration` (number, optional) {#transitionduration}

* Default: `200`

Bearing and pitch reset transition duration in milliseconds.

#### `onReset` (Function, optional) {#onreset}

```ts
(params: {viewId: string; bearing: number; pitch: number}) => void
```

* Default: `() => {}`

Callback when the compass reset button is clicked. Called for each viewport that will be reset.

- `viewId`: The view being reset
- `bearing`: The new bearing value (0)
- `pitch`: The new pitch value (0 if bearing was already 0)

## Styles

Learn more about how to replace icons in the [styling guide](./styling#replacing-icons).

| Name             | Type                     | Default                                        |
| ---------------- | ------------------------ | ---------------------------------------------- |
| `--icon-compass` | [SVG Data Url][data_url] | Custom Icon |
| `--icon-compass-north-color` | [Color][color_url] | `rgb(240, 92, 68)` |
| `--icon-compass-south-color` | [Color][color_url] | `rgb(204, 204, 204)` |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[color_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value

## Source

[modules/widgets/src/compass-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/compass-widget.tsx)
