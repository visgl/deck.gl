# LoadingWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

import {LoadingWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<LoadingWidgetDemo />

This widget shows a spinning indicator while any deck.gl layers are loading data.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {_LoadingWidget as LoadingWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new LoadingWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {_LoadingWidget as LoadingWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new LoadingWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {_LoadingWidget as LoadingWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL>
      <LoadingWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Installation

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/widgets
```

```ts
import {_LoadingWidget as LoadingWidget, type LoadingWidgetProps} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';
new LoadingWidget({} satisfies LoadingWidgetProps);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<link href="https://unpkg.com/deck.gl@^9.0.0/dist/stylesheet.css" rel='stylesheet' />
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/widgets@^9.0.0/dist.min.js"></script>
<link href="https://unpkg.com/@deck.gl/widgets@^9.0.0/dist/stylesheet.css" rel='stylesheet' />
```

```js
new deck._LoadingWidget({});
```

## Types

### `LoadingWidgetProps` {#loadingwidgetprops}

The `InfoWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Loading data'`

Tooltip message displayed while hovering a mouse over the widget.

## Source

[modules/widgets/src/loading-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/loading-widget.tsx)
