# FullscreenWidget

![from v9.0](https://img.shields.io/badge/from-v9.0-green.svg?style=flat-square)

<!-- -->

This widget enlarges deck.gl to fill the full screen. Click the widget to enter or exit full screen.

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {FullscreenWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new FullscreenWidget({placement: 'top-left'})

  ]

});
```

```
import {Deck} from '@deck.gl/core';

import {FullscreenWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new FullscreenWidget({placement: 'top-left'})

  ]

});
```

```
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

## Constructor[​](#constructor "Direct link to Constructor")

```
import {FullscreenWidget, type FullscreenWidgetProps} from '@deck.gl/widgets';

new FullscreenWidget({} satisfies FullscreenWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `FullscreenWidgetProps`[​](#fullscreenwidgetprops "Direct link to fullscreenwidgetprops")

The `FullscreenWidget` accepts the generic [`WidgetProps`](https://deck.gl/next/docs/api-reference/core/widget.md#widgetprops) and:

#### `container` (HTMLElement, optional)[​](#container "Direct link to container")

* Default: `undefined`

A [compatible DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements) which should be made full screen. By default, the map container element will be made full screen.

#### `enterLabel` (string, optional)[​](#enterlabel "Direct link to enterlabel")

* Default: `'Enter Fullscreen'`

Tooltip message displayed while hovering a mouse over the widget when out of fullscreen.

#### `enterTooltip` (string | HTMLElement | false, optional)[​](#entertooltip "Direct link to entertooltip")

* Default: value of `enterLabel`

Custom tooltip content for the enter fullscreen button. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `exitLabel` (string, optional)[​](#exitlabel "Direct link to exitlabel")

* Default: `'Exit Fullscreen'`

Tooltip message displayed while hovering a mouse over the widget when fullscreen.

#### `exitTooltip` (string | HTMLElement | false, optional)[​](#exittooltip "Direct link to exittooltip")

* Default: value of `exitLabel`

Custom tooltip content for the exit fullscreen button. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `onFullscreenChange` (Function, optional)[​](#onfullscreenchange "Direct link to onfullscreenchange")

```
(fullscreen: boolean) => void
```

* Default: `() => {}`

Callback when fullscreen state changes (via user click or browser fullscreen events).

## Styles[​](#styles "Direct link to Styles")

Learn more about how to replace icons in the [styling guide](https://deck.gl/next/docs/api-reference/widgets/styling.md#replacing-icons).

| Name                      | Type                                                                                  | Default                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--icon-fullscreen-enter` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Fullscreen](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:fullscreen:FILL@0;wght@400;GRAD@0;opsz@40)           |
| `--icon-fullscreen-exit`  | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Fullscreen Exit](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:fullscreen_exit:FILL@0;wght@400;GRAD@0;opsz@40) |

## Source[​](#source "Direct link to Source")

[modules/widgets/src/fullscreen-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/fullscreen-widget.tsx)
