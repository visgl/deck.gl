# FullscreenWidget

## Props

### `id` (String)

Default: `'fullscreen'`

Unique identifier of the widget.

### `placement` (String, optional)

Default: `'top-left'`

Widget position within the view relatitive to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

### `container` (HTMLElement, optional)

Default: `undefined`

A [compatible DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements) which should be made full screen. By default, the map container element will be made full screen.

### `enterLabel` (String, optional)

Toolip message displayed while hovering a mouse over the widget when out of fullscreen.

Default: `'Enter Fullscreen'`

### `exitLabel` (String, optional)

Toolip message displayed while hovering a mouse over the widget when fullscreen.

Default: `'Exit Fullscreen'`

### `style` (Object, optional)

Default: `{}`

Additional CSS styles for the canvas.

### `className` (String, optional)

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-fullscreen-widget`.