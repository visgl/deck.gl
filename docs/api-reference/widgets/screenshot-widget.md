# ScreenshotWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

import {ScreenshotWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<ScreenshotWidgetDemo />

This widget captures and downloads the deck.gl screen (canvas). Click the widget to capture an image of the screen. The image will be downloaded by the browser into the user's "download" folder.

:::info
Only the deck.gl canvas is captured, not other HTML DOM element underneath or on top of that canvas. This means that e.g. a non-interleaved basemap, or any widgets, will not be captured.
It is possible to use `props.onCapture` to integrate with more advanced screen capture modules such as [html2canvas](https://html2canvas.hertzen.com/)
:::

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {ScreenshotWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new ScreenshotWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {ScreenshotWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new ScreenshotWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {ScreenshotWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL>
      <ScreenshotWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {ScreenshotWidget, type ScreenshotWidgetProps} from '@deck.gl/widgets';
new ScreenshotWidget({} satisfies ScreenshotWidgetProps);
```

## Types

### `ScreenshotWidgetProps` {#screenshotwidgetprops}

The `ScreenshotWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Screenshot'`

Tooltip message displayed while hovering a mouse over the widget.

#### `filename` (string, optional) {#filename}

* Default: `'screenshot.png'`

Filename for captured screenshot.

#### `imageFormat` (string, optional) {#imageformat}

* Default: `'image/png'`

Format of the downloaded image. Browser dependent, may support `image/jpeg`, `image/webp`, `image/avif`

#### `onCapture` (function, optional) {#oncapture}

```ts
(widget: ScreenshotWidget) => void
```

* Default: `undefined`

Allows the application to define its own capture logic, perhaps to integrate a more advanced screen capture module such as [html2canvas](https://html2canvas.hertzen.com/).

## Styles

Learn more about how to replace icons in the [styling guide](./styling#replacing-icons).

| Name            | Type                     | Default                                         |
| --------------- | ------------------------ | ----------------------------------------------- |
| `--icon-camera` | [SVG Data Url][data_url] | [Material Symbol Photo Camera][camera_icon_url] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[camera_icon_utl]: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:photo_camera:FILL@0;wght@400;GRAD@0;opsz@24&icon.query=picture&icon.size=24&icon.color=%23000000

## Source

[modules/widgets/src/screenshot-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/screenshot-widget.tsx)
