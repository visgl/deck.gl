# IconWidget

<img src="https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square" alt="from v9.3" />

import {IconWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<IconWidgetDemo />

This widget renders a single icon button. Use it for simple actions that should live alongside the other built-in deck.gl widgets.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {IconWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new IconWidget({
      icon: `./run.svg`,
      label: 'Run!',
      onClick: () => alert('Running!')
    })
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {IconWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new IconWidget({
      icon: `./run.svg`,
      label: 'Run!',
      onClick: () => alert('Running!')
    })
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {IconWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL>
      <IconWidget
        icon="./run.svg"
        label="Run!"
        onClick={() => alert('Running!')}
      />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {IconWidget, type IconWidgetProps} from '@deck.gl/widgets';
new IconWidget({} satisfies IconWidgetProps);
```

## Types

### `IconWidgetProps` {#iconwidgetprops}

The `IconWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `icon` (string, required) {#icon}

Data URL used as the button icon mask.

#### `label` (string, optional) {#label}

Tooltip message displayed while hovering over the widget.

#### `color` (string, optional) {#color}

CSS color applied to the icon.

#### `onClick` (function, optional) {#onclick}

```ts
() => void
```

Callback invoked when the button is clicked.

## Styles

The `IconWidget` uses the shared button theme variables described in the [styling guide](./styling.md).


## Source

[modules/widgets/src/icon-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/icon-widget.tsx)
