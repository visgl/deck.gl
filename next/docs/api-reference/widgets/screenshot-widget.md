# ScreenshotWidget

![from v9.2](https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square)

<!-- -->

This widget captures and downloads the deck.gl screen (canvas). Click the widget to capture an image of the screen. The image will be downloaded by the browser into the user's "download" folder.

info

Only the deck.gl canvas is captured, not other HTML DOM element underneath or on top of that canvas. This means that e.g. a non-interleaved basemap, or any widgets, will not be captured. It is possible to use `props.onCapture` to integrate with more advanced screen capture modules such as [html2canvas](https://html2canvas.hertzen.com/)

* JavaScript
* TypeScript
* React

```
import {ScreenshotWidget} from '@deck.gl/widgets';

import {Deck} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new ScreenshotWidget({placement: 'top-left'})

  ]

});
```

```
import {ScreenshotWidget} from '@deck.gl/widgets';

import {Deck} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new ScreenshotWidget({placement: 'top-left'})

  ]

});
```

```
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

## Constructor[​](#constructor "Direct link to Constructor")

```
import {ScreenshotWidget, type ScreenshotWidgetProps} from '@deck.gl/widgets';

new ScreenshotWidget({} satisfies ScreenshotWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `ScreenshotWidgetProps`[​](#screenshotwidgetprops "Direct link to screenshotwidgetprops")

The `ScreenshotWidget` accepts the generic [`WidgetProps`](https://deck.gl/next/docs/api-reference/core/widget.md#widgetprops) and:

#### `label` (string, optional)[​](#label "Direct link to label")

* Default: `'Screenshot'`

Tooltip message displayed while hovering a mouse over the widget.

#### `tooltip` (string | HTMLElement | false, optional)[​](#tooltip "Direct link to tooltip")

* Default: value of `label`

Custom tooltip content. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `filename` (string, optional)[​](#filename "Direct link to filename")

* Default: `'screenshot.png'`

Filename for captured screenshot.

#### `imageFormat` (string, optional)[​](#imageformat "Direct link to imageformat")

* Default: `'image/png'`

Format of the downloaded image. Browser dependent, may support `image/jpeg`, `image/webp`, `image/avif`

#### `onCapture` (function, optional)[​](#oncapture "Direct link to oncapture")

```
(widget: ScreenshotWidget) => void
```

* Default: `undefined`

Allows the application to define its own capture logic, perhaps to integrate a more advanced screen capture module such as [html2canvas](https://html2canvas.hertzen.com/).

## Styles[​](#styles "Direct link to Styles")

Learn more about how to replace icons in the [styling guide](https://deck.gl/next/docs/api-reference/widgets/styling.md#replacing-icons).

| Name            | Type                                                                                  | Default                                             |
| --------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `--icon-camera` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | \[Material Symbol Photo Camera]\[camera\_icon\_url] |

## Source[​](#source "Direct link to Source")

[modules/widgets/src/screenshot-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/screenshot-widget.tsx)
