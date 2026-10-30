# Styling Widgets

## Themes[​](#themes "Direct link to Themes")

The deck.gl widget system provides support for themes. The primary goal of widget themes is to allow applications to select and switch between dark and light modes, so that widgets match the overall look of the application.

Themes are global for a deck instance, i.e they apply to all widgets in all views. Even though widgets can be placed in different views, it is not possible to specify different themes for different views.

Default themes are provided for dark and light mode, however themes can be customized to offer applications some additional control of styling, see below.

### Built-In Themes[​](#built-in-themes "Direct link to Built-In Themes")

| Preview | Theme                                                   |
| ------- | ------------------------------------------------------- |
|         | ```
import {DarkTheme} from '@deck.gl/widgets';
```       |
|         | ```
import {LightTheme} from '@deck.gl/widgets';
```      |
|         | ```
import {DarkGlassTheme} from '@deck.gl/widgets';
```  |
|         | ```
import {LightGlassTheme} from '@deck.gl/widgets';
``` |

## Setting the Theme[​](#setting-the-theme "Direct link to Setting the Theme")

For applications that already implement theme switching in the non-deck parts of their UI, it is expected that deck.gl themes will be updated programmatically when the ambient UI theme is switched.

```
import {DarkTheme, LightTheme} from '@deck.gl/widgets';



new Deck({

  style: mode === 'dark' ? DarkTheme : LightTheme

})
```

For minimal applications that don't implement a UI outside of deck.gl, a [`ThemeWidget`](https://deck.gl/docs/api-reference/widgets/theme-widget.md) is provided that let users switch between dark and light mode themes.

```
import {ThemeWidget} from '@deck.gl/widgets';



new Deck({

  widgets=[new ThemeWidget()]

});
```

## Customizing Themes[​](#customizing-themes "Direct link to Customizing Themes")

New themes can be defined programmatically or via CSS.

deck.gl uses CSS variables to define themes. This section provides guidance on how to theme and style widgets at different levels of specificity.

This lets application customize the appearance of widgets beyond the default light and dark mode themes.

### Customizing themes in TypeScript[​](#customizing-themes-in-typescript "Direct link to Customizing themes in TypeScript")

```
import type {Theme} from '@deck.gl/widgets';

import {DarkTheme} from '@deck.gl/widgets';



const CustomTheme = {

  ...DarkTheme,

  ...

} satisfies Theme;
```

### Customizing themes in CSS[​](#customizing-themes-in-css "Direct link to Customizing themes in CSS")

Apply to all widgets with the `.deck-widget` selector.

```
.deck-widget {

    --button-size: 48px;

}
```

> Note: While variables can be globally applied using the `:root` selector, ensuring their availability throughout the entire document, this method is not recommended. Applying variables globally can lead to naming conflicts, especially in larger projects or when integrating with other libraries.

### Widget-type specific styling[​](#widget-type-specific-styling "Direct link to Widget-type specific styling")

The CSS variables for a specific type of widget using the `.deck-widget-[type]` selector.

```
.deck-widget-fullscreen {

    --button-size: 48px;

}
```

### Instance-specific Styling[​](#instance-specific-styling "Direct link to Instance-specific Styling")

Apply styles to a single instance of a widget using inline styles.

```
new FullscreenWidget({ style: {'--button-size': '48px'}})
```

To style hyphenated CSS properties (e.g. `background-color`, `border-color`, etc.), use the camelCase equivalent.

```
new FullscreenWidget({ style: {'backgroundColor': '#fff'}})
```

### Custom Class Theming[​](#custom-class-theming "Direct link to Custom Class Theming")

Define a custom class with your desired styles and apply it to a widget.

```
.my-class {

    --button-size: 48px;

}
```

```
new FullscreenWidget({ className: 'my-class'})
```

## Customizable CSS Variables[​](#customizable-css-variables "Direct link to Customizable CSS Variables")

We've provided a set of CSS variables to make styling UI Widgets more convenient. These variables allow for customization of widget sizes, colors, and other properties. Below is a list of these variables, their expected types, and default values.

Additionally, refer to each widget's API reference for variables specific to that widget.

### Size[​](#size "Direct link to Size")

| Name                     | Type                                                                    | Default |
| ------------------------ | ----------------------------------------------------------------------- | ------- |
| `--button-size`          | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `28px`  |
| `--button-corner-radius` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `8px`   |
| `--widget-margin`        | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `12px`  |
| `--icon-size`            | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `75%`   |

### Color[​](#color "Direct link to Color")

| Name                       | Type                                                                                | Default                               |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------- |
| `--button-background`      | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)               | `#fff`                                |
| `--button-stroke`          | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)               | `rgba(255, 255, 255, 0.3)`            |
| `--button-inner-stroke`    | [Border](https://developer.mozilla.org/en-US/docs/Web/CSS/border)                   | `unset`                               |
| `--button-shadow`          | [Box Shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow)           | `0px 0px 8px 0px rgba(0, 0, 0, 0.25)` |
| `--button-backdrop-filter` | [Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) | `unset`                               |
| `--button-icon-idle`       | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)               | `rgba(97, 97, 102, 1)`                |
| `--button-icon-hover`      | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)               | `rgba(24, 24, 26, 1)`                 |
| `--button-text`            | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)               | `rgb(24, 24, 26)`                     |

### Menu[​](#menu "Direct link to Menu")

| Name                     | Type                                                                                | Default                               |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------- |
| `--menu-gap`             | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension)             | `4px`                                 |
| `--menu-background`      | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)               | `#fff`                                |
| `--menu-backdrop-filter` | [Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) | `unset`                               |
| `--menu-border`          | [Border](https://developer.mozilla.org/en-US/docs/Web/CSS/border)                   | `unset`                               |
| `--menu-shadow`          | [Box Shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow)           | `0px 0px 8px 0px rgba(0, 0, 0, 0.25)` |
| `--menu-text`            | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)               | `rgb(24, 24, 26)`                     |
| `--menu-item-hover`      | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)               | `rgba(0, 0, 0, 0.08)`                 |

### Tooltip[​](#tooltip "Direct link to Tooltip")

| Name                  | Type                                                                    | Default |
| --------------------- | ----------------------------------------------------------------------- | ------- |
| `--tooltip-max-width` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `240px` |
| `--tooltip-z-index`   | Number                                                                  | `1000`  |

### Range input[​](#range-input "Direct link to Range input")

| Name                              | Type                                                                    | Default |
| --------------------------------- | ----------------------------------------------------------------------- | ------- |
| `--range-step-button-size`        | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `24px`  |
| `--range-track-size`              | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `16px`  |
| `--range-thumb-size`              | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `10px`  |
| `--range-track-color`             | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)   | `#888`  |
| `--range-thumb-color`             | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)   | `#444`  |
| `--range-decoration-active-color` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)   | `gold`  |

### Icon[​](#icon "Direct link to Icon")

Refer to each widget's API reference for icon variable names.

#### Replacing Icons[​](#replacing-icons "Direct link to Replacing Icons")

Users can to customize icons to better align with their design preferences or branding. This section provides a step-by-step guide on how to replace and customize these icons.

1. **Prepare Your Icons:** Ensure your icons are available as [SVG Data Url](https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url). These will be used for a CSS [mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image).
2. **Icon Replacement:** Use CSS variables, such as `--icon-fullscreen-enter`, to replace the default icons with your customized ones.
3. **Color Customization:** The original color embedded in your SVG will be disregarded. However, it's crucial that the SVG isn't transparent. Customize the color of your icon using the appropriate CSS variable, such as `--button-icon-idle`.

widget-icon-overrides.css

```
.deck-widget {

    --icon-fullscreen-enter: url('path_to_your_svg_icon.svg');

    --button-icon-idle: blue;

}
```

#### Icon Recommendations[​](#icon-recommendations "Direct link to Icon Recommendations")

If possible, make the new icon re-colorable, resizable, and replaceable with CSS.

* Give the SVG a black fill for color masking
* Convert your SVG to CSS with a convertor like [this](https://www.svgbackgrounds.com/tools/svg-to-css/).
* Remove height and width attributes (widget sets to 100%)
* Add css to the stylesheet like [this](https://github.com/visgl/deck.gl/blob/9752123d560ed9cf7cda62b6e83104b9a930e0df/modules/widgets/src/stylesheet.css#L132)
* Use a unique CSS class name and variable for the icon.

For consistency with the other icons in the core set, you can use [Google Symbols](https://fonts.google.com/icons).
