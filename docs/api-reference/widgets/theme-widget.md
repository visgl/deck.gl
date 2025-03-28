# ThemeWidget

<p class="badges">
  <img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />
</p>

This widget changes the theme of deck.gl between light mode and dark mode. Click the widget to toggle the theme.

:::caution

- The `ThemeWidget` is mainly intended for minimal applications and to help developers test theme changes. More advanced applications that already support theming in their non-Deck UI will likely want to control change of deck themes using the same mechanism that is used for the remainder of their UI.
  :::

## Props

#### `id` (string, optional) {#id}

Default: `'theme'`

The `id` must be unique among all your widgets at a given time. It's recommended to set `id` explicitly if you have multipe widgets of a given thpe.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `lightModeLabel` (string, optional) {#lightmodelabel}

Tooltip message displayed while hovering a mouse over the widget when out of fullscreen.

Default: `'Light Theme'`

#### `darkModeLabel` (string, optional) {#darkmodelabel}

Tooltip message displayed while hovering a mouse over the widget when fullscreen.

Default: `'Dark Theme'`

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the widget. camelCase CSS properties (e.g. `backgroundColor`) and kabab-case CSS variables are accepted (e.g. `--button-size`).

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-theme-widget`.

## Styles

| Name          | Type                     | Default                                 |
| ------------- | ------------------------ | --------------------------------------- |
| `--icon-sun`  | [SVG Data Url][data_url] | [Material Symbol Add][icon_sun_url]     |
| `--icon-moon` | [SVG Data Url][data_url] | [Material Symbol Remove][icon_moon_url] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[icon_sun_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:add:FILL@0;wght@600;GRAD@0;opsz@40
[icon_moon_url]: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:remove:FILL@0;wght@600;GRAD@0;opsz@40
