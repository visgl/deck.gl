# FullscreenWidget

<img src="https://img.shields.io/badge/from-v9.0-green.svg?style=flat-square" alt="from v9.0" />

import {FullscreenWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<FullscreenWidgetDemo />

This widget enlarges deck.gl to fill the full screen. Click the widget to enter or exit full screen.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {FullscreenWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new FullscreenWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {FullscreenWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new FullscreenWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL, FullscreenWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL>
      <FullscreenWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {FullscreenWidget, type FullscreenWidgetProps} from '@deck.gl/widgets';
new FullscreenWidget({} satisfies FullscreenWidgetProps);
```

## Types

### `FullscreenWidgetProps` {#fullscreenwidgetprops}

The `FullscreenWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `container` (HTMLElement, optional) {#container}

* Default: `undefined`

A [compatible DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements) which should be made full screen. By default, the map container element will be made full screen.

#### `enterLabel` (string, optional) {#enterlabel}

* Default: `'Enter Fullscreen'`

Tooltip message displayed while hovering a mouse over the widget when out of fullscreen.

#### `exitLabel` (string, optional) {#exitlabel}

* Default: `'Exit Fullscreen'`

Tooltip message displayed while hovering a mouse over the widget when fullscreen.

## Styles

Learn more about how to replace icons in the [styling guide](./styling#replacing-icons).

| Name                      | Type                     | Default                                                      |
| ------------------------- | ------------------------ | ------------------------------------------------------------ |
| `--icon-fullscreen-enter` | [SVG Data Url][data_url] | [Material Symbol Fullscreen][icon_fullscreen_enter_url]      |
| `--icon-fullscreen-exit`  | [SVG Data Url][data_url] | [Material Symbol Fullscreen Exit][icon_fullscreen_exit_url] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[icon_fullscreen_enter_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:fullscreen:FILL@0;wght@400;GRAD@0;opsz@40
[icon_fullscreen_exit_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:fullscreen_exit:FILL@0;wght@400;GRAD@0;opsz@40

## Source

[modules/widgets/src/fullscreen-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/fullscreen-widget.tsx)
