import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {FullscreenWidget} from '@deck.gl/widgets';

# FullscreenWidget

<img src="https://img.shields.io/badge/from-v9.0-green.svg?style=flat-square" alt="from v9.0" />

This widget enlarges deck.gl to fill the full screen. Click the widget to enter or exit full screen.

## Usage

<WidgetPreview cls={FullscreenWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {FullscreenWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [new FullscreenWidget()]
});
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

Learn more about how to replace icons in the [styling guide](/docs/api-reference/widgets/styling#replacing-icons).

| Name                      | Type                     | Default                                                      |
| ------------------------- | ------------------------ | ------------------------------------------------------------ |
| `--icon-fullscreen-enter` | [SVG Data Url][data_url] | [Material Symbol Fullscreen][icon_fullscreen_enter_url]      |
| `--icon-fullscreen-exit`  | [SVG Data Url][data_url] | [Material Symbol Fullscreen Exit][icon_fullscreen_exit_url] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[icon_fullscreen_enter_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:fullscreen:FILL@0;wght@400;GRAD@0;opsz@40
[icon_fullscreen_exit_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:fullscreen_exit:FILL@0;wght@400;GRAD@0;opsz@40

## Source

[modules/widgets/src/fullscreen-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/fullscreen-widget.tsx)