# FullscreenWidget

This widget enlarges deck.gl to fill the full screen. Click the widget to enter or exit full screen.

## Props

#### `id` (string) {#id}

Default: `'fullscreen'`

Unique identifier of the widget.

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

Additional CSS styles for the canvas.

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-fullscreen-widget`.