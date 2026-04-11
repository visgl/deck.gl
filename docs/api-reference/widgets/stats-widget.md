# StatsWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

import {StatsWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<StatsWidgetDemo />

Displays performance and debugging statistics from deck.gl, luma.gl, or custom probe.gl stats objects in a collapsible widget. When collapsed, it shows the current FPS in a compact button UI.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new StatsWidget({initialExpanded: true})
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {_StatsWidget as StatsWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new StatsWidget({initialExpanded: true})
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {_StatsWidget as StatsWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL>
      <StatsWidget initialExpanded />
    </DeckGL>
  );
}
```

  </TabItem>
  <TabItem value="react-controlled" label="React Controlled">

```tsx
import React, {useState} from 'react';
import DeckGL, {_StatsWidget as StatsWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  const [expanded, setExpanded] = useState(true);

  return (
    <DeckGL>
      <StatsWidget
        expanded={expanded}
        onExpandedChange={setExpanded}
      />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {_StatsWidget as StatsWidget, type StatsWidgetProps} from '@deck.gl/widgets';
new StatsWidget({} satisfies StatsWidgetProps);
```

## Types

### `StatsWidgetProps` {#statswidgetprops}

The `StatsWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### type (string, optional)

Type of stats to display. One of `'deck'`, `'luma'`, `'device'`, or `'custom'`.

* Default: `'deck'`

#### stats (Stats, optional)

A [Stats](https://visgl.github.io/probe.gl/docs/modules/stats) instance to display when using `type: 'custom'`.

#### title (string, optional)

Title shown in the widget header.

* Default: `'Stats'`

#### initialExpanded (boolean, optional)

If `true`, the UI is expanded at start.

* Default: `false`

#### framesPerUpdate (number, optional)

Number of frames to wait between refresh.

* Default: `1`

#### formatters (object, optional)

Custom formatters for stat values.

#### resetOnUpdate (object, optional)

Whether to reset particular stats after each update.

#### expanded (boolean, optional)

Controlled expanded state. When provided, the widget is in controlled mode and `initialExpanded` is ignored.

#### onExpandedChange (function, optional)

Callback when the expanded state changes (user clicks header). In controlled mode, use this to update the `expanded` prop.

### Built-in Formatters

- `'count'` - Display raw count value
- `'averageTime'` - Format as average time in ms/s
- `'totalTime'` - Format as total time in ms/s
- `'fps'` - Format as frames per second
- `'memory'` - Format as memory in MB

## Behavior

- When collapsed, click the FPS button to expand the stats display
- When expanded, click the header to collapse the stats display
- Stats are automatically updated based on `framesPerUpdate`
- Different stat types provide access to various performance metrics:
  - `'deck'`: deck.gl rendering statistics
  - `'luma'`: luma.gl WebGL statistics
  - `'device'`: GPU device statistics
  - `'custom'`: User-provided stats object

## Source

[modules/widgets/src/stats-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/stats-widget.tsx)
