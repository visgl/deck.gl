# GimbalWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

import {GimbalWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<GimbalWidgetDemo />

Visualizes the orientation of an [OrbitView](../core/orbit-view.md) using nested circles. Clicking resets `rotationOrbit` and `rotationX` to `0`.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck, OrbitView} from '@deck.gl/core';
import {GimbalWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  views: new OrbitView({orbitAxis: 'Y'}),
  initialViewState: {
    target: [0, 0, 0],
    zoom: 0,
    rotationX: -45,
    rotationOrbit: 30
  },
  controller: true,
  widgets: [
    new GimbalWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, OrbitView} from '@deck.gl/core';
import {GimbalWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  views: new OrbitView({orbitAxis: 'Y'}),
  initialViewState: {
    target: [0, 0, 0] as [number, number, number],
    zoom: 0,
    rotationX: -45,
    rotationOrbit: 30
  },
  controller: true,
  widgets: [
    new GimbalWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {GimbalWidget} from '@deck.gl/react';
import {OrbitView} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL
      views={new OrbitView({orbitAxis: 'Y'})}
      initialViewState={{
        target: [0, 0, 0],
        zoom: 0,
        rotationX: -45,
        rotationOrbit: 30
      }}
      controller
    >
      <GimbalWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {GimbalWidget, type GimbalWidgetProps} from '@deck.gl/widgets';
new GimbalWidget({} satisfies GimbalWidgetProps);
```

## Types

### `GimbalWidgetProps` {#gimbalwidgetprops}

The `GimbalWidgetProps` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Gimbal'`

Tooltip message displayed while hovering a mouse over the widget.

#### `strokeWidth` (number, optional) {#strokewidth}

* Default: `1.5`

Width of gimbal lines.

#### `transitionDuration` (number, optional) {#transitionduration}

* Default: `200`

View state transition duration in milliseconds.

## Styles

| Name | Default |
| ---- | ------- |
| `--icon-gimbal-outer-color` | `rgb(68, 92, 204)` |
| `--icon-gimbal-inner-color` | `rgb(240, 92, 68)` |

## Source

[modules/widgets/src/gimbal-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/gimbal-widget.tsx)
