# ResetViewWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

import {ResetViewWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<ResetViewWidgetDemo />

This widget resets the view state of a deck.gl viewport to its initial state. The user clicks the widget to return to the initial view.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {ResetViewWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  initialViewState: {
    longitude: 0,
    latitude: 52,
    zoom: 4
  },
  controller: true,
  widgets: [
    new ResetViewWidget({
      initialViewState: {
        longitude: -20,
        latitude: 15,
        zoom: 0
      }
    })
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {ResetViewWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  initialViewState: {
    longitude: 0,
    latitude: 52,
    zoom: 4
  },
  controller: true,
  widgets: [
    new ResetViewWidget({
      initialViewState: {
        longitude: -20,
        latitude: 15,
        zoom: 0
      }
    })
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL, ResetViewWidget} from '@deck.gl/react';
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
      <ResetViewWidget
        initialViewState={{
          longitude: -20,
          latitude: 15,
          zoom: 0
        }}
      />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {ResetViewWidget, type ResetViewWidgetProps} from '@deck.gl/widgets';
new ResetViewWidget({} satisfies ResetViewWidgetProps);
```

## Types

### `ResetViewWidgetProps` {#resetviewwidgetprops}

The `ResetViewWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Reset View'`

Tooltip message displayed while hovering a mouse over the widget.

#### `initialViewState` (ViewState, optional) {#initialviewstate}

* Default: `deck.props.initialViewState`

The initial view state to reset the view to.

#### `onReset` (Function, optional) {#onreset}

```ts
(params: {viewId: string; viewState: Record<string, unknown>}) => void
```

* Default: `() => {}`

Callback when the reset view button is clicked.

- `viewId`: The view being reset
- `viewState`: The view state being reset to

## Styles

Learn more about how to replace icons in the [styling guide](./styling#replacing-icons).

| Name                | Type                     | Default                                       |
| ------------------- | ------------------------ | --------------------------------------------- |
| `--icon-reset-view` | [SVG Data Url][data_url] | [Material Symbol Reset Focus][icon_reset_view] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[icon_reset_view_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:reset_focus:FILL@1;wght@400;GRAD@0;opsz@40&icon.size=40&icon.color=%23000000&icon.style=Rounded

## Source

[modules/widgets/src/reset-view-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/reset-view-widget.tsx)
