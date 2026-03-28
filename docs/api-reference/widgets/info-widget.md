
# InfoWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

import {InfoWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<InfoWidgetDemo />

This widget shows a popup at a fixed position, or when an item in a deck.gl layer has been clicked or hovered.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {InfoWidget} from '@deck.gl/widgets';
import {ScatterplotLayer} from '@deck.gl/layers';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.78,
    zoom: 10
  },
  controller: true,
  layers: [
    new ScatterplotLayer({
      id: 'points',
      data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',
      getPosition: d => d.coordinates,
      getRadius: 100,
      getFillColor: [200, 0, 80],
      pickable: true
    })
  ],
  widgets: [
    new InfoWidget({
      mode: 'hover',
      getTooltip: info =>
        info.object && {
          text: info.object.name
        },
      style: {minWidth: '160px', fontSize: '12px'}
    })
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, type PickingInfo} from '@deck.gl/core';
import {InfoWidget} from '@deck.gl/widgets';
import {ScatterplotLayer} from '@deck.gl/layers';
import '@deck.gl/widgets/stylesheet.css';

type BartStation = {
  name: string;
  coordinates: [longitude: number, latitude: number];
};

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.78,
    zoom: 10
  },
  controller: true,
  layers: [
    new ScatterplotLayer<BartStation>({
      id: 'points',
      data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',
      getPosition: d => d.coordinates,
      getRadius: 100,
      getFillColor: [200, 0, 80],
      pickable: true
    })
  ],
  widgets: [
    new InfoWidget({
      mode: 'hover',
      getTooltip: (info: PickingInfo<BartStation>) =>
        info.object && {
          text: info.object.name
        },
      style: {minWidth: '160px', fontSize: '12px'}
    })
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useCallback} from 'react';
import DeckGL, {InfoWidget} from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

type BartStation = {
  name: string;
  coordinates: [longitude: number, latitude: number];
};

function App() {
  const layers = [
    new ScatterplotLayer<BartStation>({
      id: 'points',
      data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',
      getPosition: d => d.coordinates,
      getRadius: 100,
      getFillColor: [200, 0, 80],
      pickable: true
    })
  ];

  const getTooltip = useCallback((info: PickingInfo<BartStation>) => {
    return info.object && {
      text: info.object.name
    };
  }, []);

  return (
    <DeckGL
      initialViewState={{
        longitude: -122.4,
        latitude: 37.78,
        zoom: 10
      }}
      controller
      layers={layers}
    >
      <InfoWidget
        mode="hover"
        getTooltip={getTooltip}
        style={{minWidth: '160px', fontSize: '12px'}}
      />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {InfoWidget, type InfoWidgetProps} from '@deck.gl/widgets';
new InfoWidget({} satisfies InfoWidgetProps);
```

## Types

### `InfoWidgetProps` {#infowidgetprops}

The `InfoWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### mode (string, optional) {#mode}

* Default: `'hover'`

Determines the interaction mode of the widget:
* `'click'`: The widget is triggered by a user click.
* `'hover'`: The widget is triggered when the user hovers over an element.

#### minOffset (number, optional) {#minoffset}

* Default: `0`

Minimum offset (in pixels) to keep the popup away from the canvas edges.

#### getTooltip (Function) {#gettooltip}

```ts
(info: PickingInfo, widget: InfoWidget) => TooltipContent | null
```

Function to generate the popup contents from the selected element. The returned object may contain the following fields:

* `position` (`number[]`) - Anchor of the popup in world coordinates, e.g. [longitude, latitude]. If not supplied, default to the mouse position where the popup was triggered.
* `text` (`string`) - Text content to display in the popup
* `html` (`string`) - HTML content to display in the popup. If supplied, `text` is ignored.
* `element` (`HTMLElement`) - HTML element to attach to the popup
* `className` (`string`) - additional class name to add to the popup
* `style` - CSS style overrides

#### placement (string, optional) {#placement}

Position content relative to the anchor.
One of `bottom` | `left` | `right` | `top` | `bottom-start` | `bottom-end` | `left-start` | `left-end` | `right-start` | `right-end` | `top-start` | `top-end`

* Default: `'right'`

#### offset (number) {#offset}

Pixel offset from the anchor

* Default: `10`

#### arrow (false | number | [number, number]) {#arrow}

Show an arrow pointing at the anchor. Value can be one of the following:

* `false` - do not display an arrow
* `number` - pixel size of the arrow
* `[width: number, height: number]` - pixel size of the arrow

* Default: `10`

## Source

[modules/widgets/src/info-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/info-widget.tsx)
