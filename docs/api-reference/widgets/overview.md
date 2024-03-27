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

new FullscreenWidget({});
```

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^8.10.0/dist.min.js"></script>
<link src="https://unpkg.com/deck.gl@^8.10.0/widgets/stylesheet.css" rel='stylesheet' />
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.10.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/widgets@^8.10.0/dist.min.js"></script>
<link src="https://unpkg.com/deck.gl@^8.10.0/widgets/stylesheet.css" rel='stylesheet' />
```

```js
new deck.FullscreenWidget({});
```

## CSS Theming

Customizing the appearance of widgets can be achieved using CSS variables. This section provides guidance on how to theme widgets at different levels of specificity.

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
