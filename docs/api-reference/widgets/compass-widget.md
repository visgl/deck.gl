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

## Types

### `CompassWidgetProps`

The `CompassWidget` accepts the generic [`WidgetProps`](../core/widget.md#props):

- `id` (default `'compass'`) -  Unique id for this widget
- `placement` (default `'top-left'`) - Widget position within the view relative to the map container
- `viewId` (default `null`) - The `viewId` prop controls how a widget interacts with views. 
- `style` (default `{}`) - Additional inline styles on the top HTML element.
- `className` (default `''`) - Additional classnames on the top HTML element.

#### `label` (string, optional) {#label}

Tooltip message displayed while hovering a mouse over the widget.

Default: `'Compass'`

#### `transitionDuration` (number, optional) {#transitionduration}

Default: `200`

Bearing and pitch reset transition duration in milliseconds.

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