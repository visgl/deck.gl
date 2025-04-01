import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {CompassWidget} from '@deck.gl/widgets';

# CompassWidget

This widget visualizes bearing and pitch. Click it once to reset bearing to 0, click it a second time to reset pitch to 0. Supports Map and Globe view.

<WidgetPreview cls={CompassWidget}/>

```ts
import {CompassWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  widgets: [new CompassWidget()]
});
```

## Props

#### `id` (string, optional) {#id}

Default: `'compass'`

The `id` must be unique among all your widgets at a given time. It's recommended to set `id` explicitly. The `id` is used to match widgets between updates, ensuring deck.gl can distinguish between them. A default `id` is assigned based on widget type, so if you have multiple widgets of the same type (e.g., two `compass` widgets), you need to provide a custom `id` for at least one.

#### `viewId` (string, optional) {#viewid}

Default: `null`

The `viewId` prop controls how a widget interacts with views. If `viewId` is defined, the widget is placed in that view and interacts exclusively with it; otherwise, it is placed in the root widget container and affects all views.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `label` (string, optional) {#label}

Tooltip message displayed while hovering a mouse over the widget.

Default: `'Compass'`

#### `transitionDuration` (number, optional) {#transitionduration}

Default: `200`

Bearing and pitch reset transition duration in milliseconds.

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the widget. camelCase CSS properties (e.g. `backgroundColor`) and kabab-case CSS variables are accepted (e.g. `--button-size`).

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-compass-widget`.

## Styles

Learn more about how to replace icons in the [styling guide](/docs/api-reference/widgets/styling#replacing-icons).

| Name             | Type                     | Default                                        |
| ---------------- | ------------------------ | ---------------------------------------------- |
| `--icon-compass` | [SVG Data Url][data_url] | Custom Icon |
| `--icon-compass-north-color` | [Color](color_url) | `rgb(240, 92, 68)` |
| `--icon-compass-south-color` | [Color](color_url) | `rgb(204, 204, 204)` |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[color_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value

## Source

[modules/widgets/src/compass-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/compass-widget.tsx)