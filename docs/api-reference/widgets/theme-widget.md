import BrowserOnly from '@docusaurus/BrowserOnly';
import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {_ThemeWidget} from '@deck.gl/widgets';

# ThemeWidget (Experimental)

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

This widget changes the theme of deck.gl between light mode and dark mode. Click the widget to toggle the theme.

:::info

- The `ThemeWidget` is mainly intended for minimal applications and to help developers test theme changes. More advanced applications that already support theming in their non-Deck UI will likely want to control change of deck themes using the same mechanism that is used for the remainder of their UI.
:::

## Usage

<BrowserOnly>{() => <WidgetPreview cls={_ThemeWidget}/>}</BrowserOnly>

```ts
import {_ThemeWidget as ThemeWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

new Deck({
  widgets: [new ThemeWidget()]
});
```

### `ThemeWidgetProps` {#themewidgetprops}

The `ThemeWidget` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `lightModeTheme` (object, optional) {#lightmodetheme}

* Default: Light Glass Theme

Styles for light mode theme.

#### `darkModeTheme` (object, optional) {#darkmodetheme}

* Default: Dark Glass Theme

Styles for dark mode theme.

#### `initialTheme` (`'auto' | 'light' | 'dark'`) {#initialtheme}

* Default: `'auto'`

Set the initial theme. `'auto'` inspects `window.matchMedia('(prefers-color-scheme: dark)')`.

#### `lightModeLabel` (string, optional) {#lightmodelabel}

* Default: `'Light Theme'`

Tooltip message displayed while hovering a mouse over the widget when out of fullscreen.

#### `darkModeLabel` (string, optional) {#darkmodelabel}

* Default: `'Dark Theme'`

Tooltip message displayed while hovering a mouse over the widget when fullscreen.

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