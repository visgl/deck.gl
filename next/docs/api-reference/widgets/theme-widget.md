# ThemeWidget

![from v9.2](https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square)

<!-- -->

This widget changes the theme of deck.gl between light mode and dark mode. Click the widget to toggle the theme.

info

* The `ThemeWidget` is mainly intended for minimal applications and to help developers test theme changes. More advanced applications that already support theming in their non-Deck UI will likely want to control change of deck themes using the same mechanism that is used for the remainder of their UI.

- JavaScript
- TypeScript
- React
- React Controlled

```
import {ThemeWidget} from '@deck.gl/widgets';

import {Deck} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new ThemeWidget({placement: 'top-left'})

  ]

});
```

```
import {ThemeWidget} from '@deck.gl/widgets';

import {Deck} from '@deck.gl/core';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  widgets: [

    new ThemeWidget({placement: 'top-left'})

  ]

});
```

```
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

```
import React, {useState} from 'react';

import DeckGL, {ThemeWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');



  return (

    <DeckGL>

      <ThemeWidget

        placement="top-left"

        themeMode={themeMode}

        onThemeModeChange={setThemeMode}

      />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {ThemeWidget, type ThemeWidgetProps} from '@deck.gl/widgets';

new ThemeWidget({} satisfies ThemeWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `ThemeWidgetProps`[​](#themewidgetprops "Direct link to themewidgetprops")

The `ThemeWidget` accepts the generic [`WidgetProps`](https://deck.gl/next/docs/api-reference/core/widget.md#widgetprops) and:

#### `lightModeTheme` (object, optional)[​](#lightmodetheme "Direct link to lightmodetheme")

* Default: Light Glass Theme

Styles for light mode theme.

#### `darkModeTheme` (object, optional)[​](#darkmodetheme "Direct link to darkmodetheme")

* Default: Dark Glass Theme

Styles for dark mode theme.

#### `initialThemeMode` (`'auto' | 'light' | 'dark'`)[​](#initialthememode "Direct link to initialthememode")

* Default: `'auto'`

Set the initial theme for uncontrolled usage. `'auto'` inspects `window.matchMedia('(prefers-color-scheme: dark)')`.

#### `themeMode` (`'light' | 'dark'`, optional)[​](#thememode "Direct link to thememode")

Controlled theme mode. When provided, the widget is in controlled mode and this prop determines the current theme. Use with `onThemeModeChange` to handle user interactions.

#### `onThemeModeChange` (Function, optional)[​](#onthememodechange "Direct link to onthememodechange")

```
(newMode: 'light' | 'dark') => void
```

* Default: `() => {}`

Callback when the user clicks the theme toggle button.

#### `lightModeLabel` (string, optional)[​](#lightmodelabel "Direct link to lightmodelabel")

* Default: `'Light Mode'`

Tooltip message displayed while hovering a mouse over the widget when light mode is available.

#### `lightModeTooltip` (string | HTMLElement | false, optional)[​](#lightmodetooltip "Direct link to lightmodetooltip")

* Default: value of `lightModeLabel`

Custom tooltip content when in light mode. Overrides the default label text in the tooltip. Pass `false` to disable.

#### `darkModeLabel` (string, optional)[​](#darkmodelabel "Direct link to darkmodelabel")

* Default: `'Dark Mode'`

Tooltip message displayed while hovering a mouse over the widget when dark mode is available.

#### `darkModeTooltip` (string | HTMLElement | false, optional)[​](#darkmodetooltip "Direct link to darkmodetooltip")

* Default: value of `darkModeLabel`

Custom tooltip content when in dark mode. Overrides the default label text in the tooltip. Pass `false` to disable.

## Styles[​](#styles "Direct link to Styles")

| Name          | Type                                                                                  | Default                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--icon-sun`  | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Light Mode](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:light_mode:FILL@0;wght@400;GRAD@0;opsz@40) |
| `--icon-moon` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Dark Mode](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:dark_mode:FILL@0;wght@400;GRAD@0;opsz@40)   |

## Source[​](#source "Direct link to Source")

[modules/widgets/src/theme-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/theme-widget.tsx)
