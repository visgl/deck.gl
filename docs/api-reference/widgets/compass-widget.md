import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {CompassWidget} from '@deck.gl/widgets';

# CompassWidget

<img src="https://img.shields.io/badge/from-v9.0-green.svg?style=flat-square" alt="from v9.0" />

This widget visualizes bearing and pitch. Click it once to reset bearing to 0, click it a second time to reset pitch to 0. Supports Map and Globe view.

## Usage

<WidgetPreview cls={CompassWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {CompassWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [new CompassWidget()]
});
```

## Types

### `CompassWidgetProps` {#compasswidgetprops}

The `CompassWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Compass'`

Tooltip message displayed while hovering a mouse over the widget.

#### `transitionDuration` (number, optional) {#transitionduration}

* Default: `200`

Bearing and pitch reset transition duration in milliseconds.

#### `onCompassReset` (Function, optional) {#oncompassreset}

```ts
(params: {viewId: string; bearing: number; pitch: number}) => void
```

* Default: `() => {}`

Callback when the compass reset button is clicked. Called for each viewport that will be reset.

- `viewId`: The view being reset
- `bearing`: The new bearing value (0)
- `pitch`: The new pitch value (0 if bearing was already 0)

## Styles

Learn more about how to replace icons in the [styling guide](/docs/api-reference/widgets/styling#replacing-icons).

| Name             | Type                     | Default                                        |
| ---------------- | ------------------------ | ---------------------------------------------- |
| `--icon-compass` | [SVG Data Url][data_url] | Custom Icon |
| `--icon-compass-north-color` | [Color][color_url] | `rgb(240, 92, 68)` |
| `--icon-compass-south-color` | [Color][color_url] | `rgb(204, 204, 204)` |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[color_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value

## Source

[modules/widgets/src/compass-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/compass-widget.tsx)