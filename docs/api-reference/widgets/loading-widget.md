# LoadingWidget

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
import {LoadingWidget} from '@deck.gl/widgets';
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
import {LoadingWidget} from '@deck.gl/widgets';
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
import DeckGL, {LoadingWidget} from '@deck.gl/react';
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

## Constructor

```ts
import {LoadingWidget, type LoadingWidgetProps} from '@deck.gl/widgets';
new LoadingWidget({} satisfies LoadingWidgetProps);
```

## Types

### `LoadingWidgetProps` {#loadingwidgetprops}

The `InfoWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Loading data'`

Tooltip message displayed while hovering a mouse over the widget.

#### `onLoadingChange` (Function, optional) {#onloadingchange}

```ts
(loading: boolean) => void
```

* Default: `() => {}`

Callback when the loading state changes. Called when layers transition between loading and loaded states.

## Source

[modules/widgets/src/loading-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/loading-widget.tsx)
