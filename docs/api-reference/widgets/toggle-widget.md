# ToggleWidget

<img src="https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square" alt="from v9.3" />

import {ToggleWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<ToggleWidgetDemo />

This widget renders an icon button with internal on/off state. It is useful for lightweight toggles such as layer visibility, mode switches, or filter controls.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {ToggleWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new ToggleWidget({
      icon: `./moon.png`,
      onIcon: `./sun.png`,
      label: 'Color mode',
      color: 'dodgerblue',
      onColor: 'orange',
      onChange: checked => updateLayers(checked ? 'light' : 'dark')
    })
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {ToggleWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new ToggleWidget({
      icon: `./moon.png`,
      onIcon: `./sun.png`,
      label: 'Color mode',
      color: 'dodgerblue',
      onColor: 'orange',
      onChange: checked => updateLayers(checked ? 'light' : 'dark')
    })
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {ToggleWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL>
      <ToggleWidget
        icon="./moon.png"
        onIcon="./sun.png"
        label="Color mode"
        color="dodgerblue"
        onColor="orange"
        onChange={checked => updateLayers(checked ? 'light' : 'dark')}
      />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {ToggleWidget, type ToggleWidgetProps} from '@deck.gl/widgets';
new ToggleWidget({} satisfies ToggleWidgetProps);
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

Tooltip message displayed while hovering over the widget.

#### `onLabel` (string, optional) {#onlabel}

* Default: same as `label`

Tooltip shown while the widget is checked.

#### `color` (string, optional) {#color}

CSS color of the icon.

#### `onColor` (string, optional) {#oncolor}

* Default: same as `color`

CSS color of the icon while the widget is checked.

#### `onChange` (function, optional) {#onchange}

```ts
(checked: boolean) => void
```

Callback invoked after the widget toggles state.

## Styles

The `ToggleWidget` uses the shared button theme variables described in the [styling guide](./styling.md).


## Source

[modules/widgets/src/toggle-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/toggle-widget.tsx)
