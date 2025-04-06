# ScreenshotWidget

<p class="badges">
  <img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />
</p>

This widget captures and downloads the deck.gl screen (canvas). Click the widget to capture an image of the screen. The image will be downloaded by the browser into the user's "download" folder.

:::caution
Only the deck.gl canvas is captured, not other HTML DOM element underneath or on top of that canvas. This means that e.g. a non-interleaved basemap, or any widgets, will not be captured.
It is possible to use `props.onCapture` to integrate with more advanced screen capture modules such as [html2canvas](https://html2canvas.hertzen.com/)
:::

## Props

#### `id` (string, optional) {#id}

Default: `'screenshot'`

The `id` must be unique among all your widgets at a given time. It's recommended to set `id` explicitly if you have multiple widgets of the same type.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `label` (string, optional) {#label}

Tooltip message displayed while hovering a mouse over the widget.

Default: `'Screenshot'`

#### `imageFormat` (string, optional) {#imageFormat}

Format of the downloaded image. Browser dependent, may support `image/jpeg`, `image/webp`, `image/avif`

Default: `'image/png'`

#### `onCapture` (function, optional) {#oncapture}

```ts
onCapture(widget: ScreenshotWidget): void
```

Allows the application to define its own capture logic, perhaps to integrate a more advanced screen capture module such as [html2canvas](https://html2canvas.hertzen.com/).

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the widget. camelCase CSS properties (e.g. `backgroundColor`) and kabab-case CSS variables are accepted (e.g. `--button-size`).

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-screenshot-widget`.

## Styles

| Name            | Type                     | Default                                         |
| --------------- | ------------------------ | ----------------------------------------------- |
| `--icon-camera` | [SVG Data Url][data_url] | [Material Symbol Photo Camera][camera_icon_url] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[camera_icon_utl]: https://fonts.google.com/icons?selected=Material+Symbols+Outlined:photo_camera:FILL@0;wght@400;GRAD@0;opsz@24&icon.query=picture&icon.size=24&icon.color=%23000000
