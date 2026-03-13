# ToggleWidget

<img src="https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square" alt="from v9.3" />

This widget renders an icon button with internal on/off state. It is useful for lightweight toggles such as layer visibility, mode switches, or filter controls.

## Usage


```ts
import {Deck} from '@deck.gl/core';
import {ToggleWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [
    new ToggleWidget({
      icon: `./play.png`,
      onIcon: `./pause.png`,
      label: 'Play',
      onLabel: 'Pause',
      onChange: checked => {
        // do something
      }
    })
  ]
});
```

## Types

### `ToggleWidgetProps` {#togglewidgetprops}

The `ToggleWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `initialChecked` (boolean, optional) {#initialchecked}

* Default: `false`

Whether the widget starts in the checked state.

#### `icon` (string, required) {#icon}

Data URL used as the default button icon mask.

#### `onIcon` (string, optional) {#onicon}

* Default: same as `icon`

Data URL used as the icon when the widget is checked.

#### `label` (string, optional) {#label}

Tooltip shown while the widget is unchecked.

#### `onLabel` (string, optional) {#onlabel}

* Default: same as `label`

Tooltip shown while the widget is checked.

#### `color` (string, optional) {#color}

CSS color applied while the widget is unchecked.

#### `onColor` (string, optional) {#oncolor}

* Default: same as `color`

CSS color applied while the widget is checked.

#### `onChange` (function, optional) {#onchange}

```ts
(checked: boolean) => void
```

Callback invoked after the widget toggles state.

## Styles

The `ToggleWidget` uses the shared button theme variables described in the [styling guide](./styling.md).


## Source

[modules/widgets/src/toggle-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/toggle-widget.tsx)
