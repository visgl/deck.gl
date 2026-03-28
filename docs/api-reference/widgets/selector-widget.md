# SelectorWidget

<img src="https://img.shields.io/badge/from-v9.3-green.svg?style=flat-square" alt="from v9.3" />

import {SelectorWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<SelectorWidgetDemo />

This widget renders an icon button that opens a popover menu of selectable options. Each option provides an icon and an optional label, and the button updates to reflect the current selection.


<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {SelectorWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

const deck = new Deck({
  widgets: [
    new SelectorWidget({
      initialValue: 'single',
      options: [
        {
          value: 'single',
          label: 'Single view',
          icon: './single.svg'
        },
        {
          value: 'split-horizontal',
          label: 'Split views horizontal',
          icon: './split-h.svg'
        },
        {
          value: 'split-vertical',
          label: 'Split views vertical',
          icon: './split-v.svg'
        }
      ],
      onChange: value => updateViews(value)
    })
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {SelectorWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

type ViewLayout = 'single' | 'split-horizontal' | 'split-vertical';

const deck = new Deck({
  widgets: [
    new SelectorWidget<ViewLayout>({
      initialValue: 'single',
      options: [
        {
          value: 'single',
          label: 'Single view',
          icon: './single.svg'
        },
        {
          value: 'split-horizontal',
          label: 'Split views horizontal',
          icon: './split-h.svg'
        },
        {
          value: 'split-vertical',
          label: 'Split views vertical',
          icon: './split-v.svg'
        }
      ],
      onChange: value => updateViews(value)
    })
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {SelectorWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

type ViewLayout = 'single' | 'split-horizontal' | 'split-vertical';

function App() {
  return (
    <DeckGL>
      <SelectorWidget<ViewLayout>
        initialValue="single"
        options={[
          {
            value: 'single',
            label: 'Single view',
            icon: './single.svg'
          },
          {
            value: 'split-horizontal',
            label: 'Split views horizontal',
            icon: './split-h.svg'
          },
          {
            value: 'split-vertical',
            label: 'Split views vertical',
            icon: './split-v.svg'
          }
        ]}
        onChange={value => updateViews(value)}
      />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>


## Constructor

```ts
import {SelectorWidget, type SelectorWidgetProps} from '@deck.gl/widgets';
new SelectorWidget<ValueT>({} satisfies SelectorWidgetProps<ValueT>);
```

## Types

### `SelectorWidgetProps` {#selectorwidgetprops}

The `SelectorWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `options` (`SelectorWidgetOption[]`, required) {#options}

Selectable options displayed in the popover menu.

#### `initialValue` (any, optional) {#initialvalue}

* Default: value of the first option

Initial selected value. If it does not match any option, the first option is displayed.

#### `onChange` (function, optional) {#onchange}

```ts
(value: ValueT) => void
```

Callback invoked when a new option is selected.

### `SelectorWidgetOption` {#selectorwidgetoption}

#### `value` (any, required) {#value}

Value returned from `onChange` when this option is selected.

#### `icon` (string, required) {#icon}

Data URL used as the option icon mask.

#### `label` (string, optional) {#label}

Text shown in the menu and used as the button tooltip when selected.

## Styles

The `SelectorWidget` uses the shared button and menu theme variables described in the [styling guide](./styling.md).


## Source

[modules/widgets/src/selector-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/selector-widget.tsx)
