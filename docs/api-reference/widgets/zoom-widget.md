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

### `ZoomProps` {#zoomprops}

The `Zoomidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

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