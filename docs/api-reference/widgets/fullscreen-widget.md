# FullscreenWidget

## Props

### `id` (String) {#id}

Default: `'fullscreen'`

Unique identifier of the widget.

### `viewId` (String, optional) {#viewid}

Default: `null`

The view id that this widget is being attached to. If assigned, this widget will only respond to events occurred inside the specific view that matches this id.

### `placement` (String, optional) {#placement}

Default: `'top-left'`

Widget position within the view relatitive to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

### `container` (HTMLElement, optional) {#container}

Default: `undefined`

A [compatible DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements) which should be made full screen. By default, the map container element will be made full screen.

### `enterLabel` (String, optional) {#enterlabel}

Toolip message displayed while hovering a mouse over the widget when out of fullscreen.

Default: `'Enter Fullscreen'`

### `exitLabel` (String, optional) {#exitlabel}

Toolip message displayed while hovering a mouse over the widget when fullscreen.

Default: `'Exit Fullscreen'`

### `style` (Object, optional) {#style}

Default: `{}`

Additional CSS styles for the canvas.

### `className` (String, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-fullscreen-widget`.