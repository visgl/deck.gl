import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {FullscreenWidget} from '@deck.gl/widgets';

# FullscreenWidget

This widget enlarges deck.gl to fill the full screen. Click the widget to enter or exit full screen.

<WidgetPreview cls={FullscreenWidget}/>

```ts
import {FullscreenWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  widgets: [new FullscreenWidget()]
});
```

## Props

#### `id` (string, optional) {#id}

Default: `'fullscreen'`

The `id` must be unique among all your widgets at a given time. It's recommended to set `id` explicitly. The `id` is used to match widgets between updates, ensuring deck.gl can distinguish between them. A default `id` is assigned based on widget type, so if you have multiple widgets of the same type (e.g., two `compass` widgets), you need to provide a custom `id` for at least one.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `container` (HTMLElement, optional) {#container}

Default: `undefined`

A [compatible DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements) which should be made full screen. By default, the map container element will be made full screen.

#### `enterLabel` (string, optional) {#enterlabel}

Tooltip message displayed while hovering a mouse over the widget when out of fullscreen.

Default: `'Enter Fullscreen'`

#### `exitLabel` (string, optional) {#exitlabel}

Tooltip message displayed while hovering a mouse over the widget when fullscreen.

Default: `'Exit Fullscreen'`

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the widget. camelCase CSS properties (e.g. `backgroundColor`) and kabab-case CSS variables are accepted (e.g. `--button-size`).

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-fullscreen-widget`.

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