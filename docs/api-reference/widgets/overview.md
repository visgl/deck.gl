# @deck.gl/widgets

Widgets are UI components around the WebGL2/WebGPU canvas to offer controls and information for a better user experience.

This module contains the following widgets:

- [FullscreenWidget](./fullscreen-widget.md)
- [ZoomWidget](./zoom-widget.md)
- [CompassWidget](./compass-widget.md)


## Installation

### Install from NPM

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/widgets
```

```js
import {FullscreenWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new FullscreenWidget();
```

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<link href="https://unpkg.com/deck.gl@^9.0.0/dist/stylesheet.css" rel='stylesheet' />
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/widgets@^9.0.0/dist.min.js"></script>
<link href="https://unpkg.com/@deck.gl/widgets@^9.0.0/dist/stylesheet.css" rel='stylesheet' />
```

## Using Widgets

```ts
import {Deck} from '@deck.gl/core';
import {
  CompassWidget,
  ZoomWidget,
  FullscreenWidget,
  ScreenshotWidget,
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    ...
  ],
  widgets: [
    new ZoomWidget(),
    new CompassWidget(),
    new FullscreenWidget(),
    new ScreenshotWidget()
  ]
});
```

The built-in widgets support both dark and light color scheme changes and can be wired up to dynamically respond to color scheme changes like so:

```ts
import {Deck} from '@deck.gl/core';
import {
  CompassWidget,
  ZoomWidget,
  FullscreenWidget,
  ScreenshotWidget,
  DarkGlassTheme,
  LightGlassTheme
} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

/* global window */
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const widgetTheme = prefersDarkScheme.matches ? DarkGlassTheme : LightGlassTheme;

new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [ ... ],
  widgets: [
    new ZoomWidget({style: widgetTheme}),
    new CompassWidget({style: widgetTheme}),
    new FullscreenWidget({style: widgetTheme}),
    new ScreenshotWidget({style: widgetTheme})
  ]
});
```

## CSS Theming

Customizing the appearance of widgets beyond light and dark mode can be achieved using CSS variables. This section provides guidance on how to theme widgets at different levels of specificity.

### Global Theming

Apply to all widgets with the `.deck-widget` selector.

```css
.deck-widget {
    --button-size: 48px;
}
```

> Note: While variables can be globally applied using the `:root` selector, ensuring their availability throughout the entire document, this method is not recommended. Applying variables globally can lead to naming conflicts, especially in larger projects or when integrating with other libraries.

### Type-specific Theming

Theme a specific type of widget using the `.deck-widget-[type]` selector.

```css
.deck-widget-fullscreen {
    --button-size: 48px;
}
```

### Instance-specific Theming

Apply styles to a single instance of a widget using inline styles.

```js
new FullscreenWidget({ style: {'--button-size': '48px'}})
```

To style hyphenated CSS properties (e.g. `background-color`, `border-color`, etc.), use the camelCase equivalent.

```js
new FullscreenWidget({ style: {'backgroundColor': '#fff'}})
```

### Custom Class Theming

Define a custom class with your desired styles and apply it to a widget.

```css
.my-class {
    --button-size: 48px;
}
```
```js
new FullscreenWidget({ className: 'my-class'})
```

## Customizable CSS Variables

We've provided a set of CSS variables to make styling UI Widgets more convenient. These variables allow for customization of widget sizes, colors, and other properties. Below is a comprehensive list of these variables, their expected types, and default values:

### Size

| Name | Type | Default |
| ---- | ---- | ------- |
| `--button-size` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `28px` |
| `--button-border-radius` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `8px` |
| `--widget-margin` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `12px` |

### Color

| Name | Type | Default |
| ---- | ---- | ------- |
| `--button-background` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `#fff` |
| `--button-stroke` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `rgba(255, 255, 255, 0.3)` |
| `--button-inner-stroke` | [Border](https://developer.mozilla.org/en-US/docs/Web/CSS/border) | `unset` |
| `--button-shadow` | [Box Shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow) | `0px 0px 8px 0px rgba(0, 0, 0, 0.25)` |
| `--button-backdrop-filter` | [Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) | `unset` |
| `--button-icon-idle` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `rgba(97, 97, 102, 1)` |
| `--button-icon-hover` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `rgba(24, 24, 26, 1)` |
| `--icon-compass-north-color` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `#F05C44` |
| `--icon-compass-south-color` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `#C2C2CC` |

### Icon

| Name | Type | Default |
| ---- | ---- | ------- |
| `--icon-fullscreen-enter` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Fullscreen](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:fullscreen:FILL@0;wght@400;GRAD@0;opsz@40) |
| `--icon-fullscreen-enter` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Fullscreen Exit](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:fullscreen_exit:FILL@0;wght@400;GRAD@0;opsz@40) |
| `--icon-zoom-in` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Add](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:add:FILL@0;wght@600;GRAD@0;opsz@40) |
| `--icon-zoom-out` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Remove](https://fonts.google.com/icons?selected=Material+Symbols+Rounded:remove:FILL@0;wght@600;GRAD@0;opsz@40) |
| `--icon-camera` | [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url) | [Material Symbol Photo Camera](https://fonts.google.com/icons?selected=Material+Symbols+Outlined:photo_camera:FILL@0;wght@400;GRAD@0;opsz@24&icon.query=picture&icon.size=24&icon.color=%23000000) |

#### Replacing Icons

Users can to customize icons to better align with their design preferences or branding. This section provides a step-by-step guide on how to replace and customize these icons.

1. Prepare Your Icons:
  - Ensure your icons are available as [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url). These will be used for a CSS [mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image).
2. Icon Replacement:
  - Use CSS variables, such as `--icon-fullscreen-enter`, to replace the default icons with your customized ones.
3. Color Customization:
  - The original color embedded in your SVG will be disregarded. However, it's crucial that the SVG isn't transparent.
  - Customize the color of your icon using the appropriate CSS variable, such as `--button-icon-idle`.

Example:
```css
.deck-widget {
    --icon-fullscreen-enter: url('path_to_your_svg_icon.svg');
    --button-icon-idle: blue;
}
```

#### Icon Recommendations

If possible, make the new icon re-colorable, resizable, and replaceable with CSS.

- Give the SVG a black fill for color masking
- Convert your SVG to CSS with a convertor like [this](https://www.svgbackgrounds.com/tools/svg-to-css/).
- Remove height and width attributes (widget sets to 100%)
- Add css to the stylesheet like [this](https://github.com/visgl/deck.gl/blob/9752123d560ed9cf7cda62b6e83104b9a930e0df/modules/widgets/src/stylesheet.css#L132)
- Use a unique CSS class name and variable for the icon.

For consistency with the other icons in the core set, you can use [Google Symbols](https://fonts.google.com/icons).
