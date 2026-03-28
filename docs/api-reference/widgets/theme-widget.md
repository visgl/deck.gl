# ThemeWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

import {ThemeWidgetDemo} from '@site/src/doc-demos/widgets';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<ThemeWidgetDemo />

This widget changes the theme of deck.gl between light mode and dark mode. Click the widget to toggle the theme.

:::info

- The `ThemeWidget` is mainly intended for minimal applications and to help developers test theme changes. More advanced applications that already support theming in their non-Deck UI will likely want to control change of deck themes using the same mechanism that is used for the remainder of their UI.
:::

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {ThemeWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new ThemeWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {ThemeWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  widgets: [
    new ThemeWidget({placement: 'top-left'})
  ]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL, {ThemeWidget} from '@deck.gl/react';
import '@deck.gl/widgets/stylesheet.css';

function App() {
  return (
    <DeckGL>
      <ThemeWidget placement="top-left" />
    </DeckGL>
  );
}
```

  </TabItem>
</Tabs>

## Constructor

```ts
import {ThemeWidget, type ThemeWidgetProps} from '@deck.gl/widgets';
new ThemeWidget({} satisfies ThemeWidgetProps);
```

## Types

### `ThemeWidgetProps` {#themewidgetprops}

The `ThemeWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `lightModeTheme` (object, optional) {#lightmodetheme}

* Default: Light Glass Theme

Styles for light mode theme.

#### `darkModeTheme` (object, optional) {#darkmodetheme}

* Default: Dark Glass Theme

Styles for dark mode theme.

#### `initialThemeMode` (`'auto' | 'light' | 'dark'`) {#initialthememode}

* Default: `'auto'`

Set the initial theme. `'auto'` inspects `window.matchMedia('(prefers-color-scheme: dark)')`.

#### `lightModeLabel` (string, optional) {#lightmodelabel}

* Default: `'Light Mode'`

Tooltip message displayed while hovering a mouse over the widget when light mode is available.

#### `darkModeLabel` (string, optional) {#darkmodelabel}

* Default: `'Dark Mode'`

Tooltip message displayed while hovering a mouse over the widget when dark mode is available.

## Styles

| Name          | Type                     | Default                                 |
| ------------- | ------------------------ | --------------------------------------- |
| `--icon-sun`  | [SVG Data Url][data_url] | [Material Symbol Add][icon_sun_url]     |
| `--icon-moon` | [SVG Data Url][data_url] | [Material Symbol Remove][icon_moon_url] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[icon_sun_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:add:FILL@0;wght@600;GRAD@0;opsz@40
[icon_moon_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:remove:FILL@0;wght@600;GRAD@0;opsz@40

## Source

[modules/widgets/src/theme-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/theme-widget.tsx)
