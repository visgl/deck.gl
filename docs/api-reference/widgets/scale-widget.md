# ScaleWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

import {ScaleWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<ScaleWidgetDemo />

This widget displays a dynamic cartographic scale bar that updates as the map view changes. It shows a horizontal line with end tick marks and a distance label, reflecting the current map scale based on zoom level and latitude.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {_ScaleWidget as ScaleWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new ScaleWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {_ScaleWidget as ScaleWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new ScaleWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {_ScaleWidget as ScaleWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL>
      <ScaleWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {_ScaleWidget as ScaleWidget, type ScaleWidgetProps} from '@deck.gl/widgets';
new ScaleWidget({} satisfies ScaleWidgetProps);
```

## Types

### `ScaleWidgetProps` {#scalewidgetprops}

The `ScaleWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Scale'`

Tooltip label for the widget.

## Source

[modules/widgets/src/scale-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/scale-widget.tsx)
