import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {ZoomWidget} from '@deck.gl/widgets';

# ZoomWidget

This widget controls the zoom level of a deck.gl view. Click '+' to zoom in by 1, click '-' to zoom out by 1. Supports controlling Map and Globe views.

<WidgetPreview cls={ZoomWidget} props={{orientation: 'horizontal'}}/>

```ts
import {ZoomWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  widgets: [new ZoomWidget()]
});
```

## Props

#### `id` (string, optional) {#id}

Default: `'zoom'`

The `id` must be unique among all your widgets at a given time. It's recommended to set `id` explicitly. The `id` is used to match widgets between updates, ensuring deck.gl can distinguish between them. A default `id` is assigned based on widget type, so if you have multiple widgets of the same type (e.g., two `compass` widgets), you need to provide a custom `id` for at least one.

#### `viewId` (string, optional) {#viewid}

Default: `null`

The `viewId` prop controls how a widget interacts with views. If `viewId` is defined, the widget is placed in that view and interacts exclusively with it; otherwise, it is placed in the root widget container and affects all views.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `orientation` (string, optional) {#orientation}

Default: `'vertical'`

Widget button orientation. Valid options are `vertical` or `horizontal`.

#### `zoomInLabel` (string, optional) {#zoominlabel}

Tooltip message displayed while hovering a mouse over the zoom in button.

Default: `'Zoom In'`

#### `zoomOutLabel` (string, optional) {#zoomoutlabel}

Tooltip message displayed while hovering a mouse over the zoom out button.

Default: `'Zoom Out'`

#### `transitionDuration` (number, optional) {#transitionduration}

Default: `200`

Zoom transition duration in milliseconds.

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the widget. camelCase CSS properties (e.g. `backgroundColor`) and kabab-case CSS variables are accepted (e.g. `--button-size`).

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-zoom-widget`.

## Styles

Learn more about how to replace icons in the [styling guide](/docs/api-reference/widgets/styling#replacing-icons).

| Name              | Type                     | Default                                     |
| ----------------- | ------------------------ | ------------------------------------------- |
| `--icon-zoom-in`  | [SVG Data Url][data_url] | [Material Symbol Add][icon_zoom_in_url]     |
| `--icon-zoom-out` | [SVG Data Url][data_url] | [Material Symbol Remove][icon_zoom_out_url] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[icon_zoom_in_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:add:FILL@0;wght@600;GRAD@0;opsz@40
[icon_zoom_out_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:remove:FILL@0;wght@600;GRAD@0;opsz@40

## Source

[modules/widgets/src/zoom-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/zoom-widget.tsx)