import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {GimbalWidget} from '@deck.gl/widgets';

# GimbalWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

Visualizes the orientation of an `OrbitView` using nested circles. Clicking resets `rotationOrbit` and `rotationX` to `0`.

## Usage

<WidgetPreview cls={GimbalWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {GimbalWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [new GimbalWidget()]
});
```

## Types

### `GimbalWidgetProps` {#gimbalwidgetprops}

The `GimbalWidgetProps` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Gimbal'`

Tooltip message displayed while hovering a mouse over the widget.

#### `strokeWidth` (number, optional) {#strokewidth}

* Default: `1.5`

Width of gimbal lines.

#### `transitionDuration` (number, optional) {#transitionduration}

* Default: `200`

View state transition duration in milliseconds.

## Styles

| Name | Default |
| ---- | ------- |
| `--icon-gimbal-outer-color` | `rgb(68, 92, 204)` |
| `--icon-gimbal-inner-color` | `rgb(240, 92, 68)` |

## Source

[modules/widgets/src/gimbal-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/gimbal-widget.tsx)
