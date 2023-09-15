# @deck.gl/widgets

Widgets are UI components around the WebGL canvas to offer controls and information for a better user experience.

This module contains the following extensions:

- [FullscreenWidget](./fullscreen-widget.md)

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

## CSS Themeing

Define CSS variables to customize the appearance of widgets.

Apply to all wigdets with the `.deck-widget` selector:

```css
.deck-widget {
    --button-size: 48px;
}
```

Apply to one widget type with `.deck-widget-[type]` selector:

```css
.deck-widget-fullscreen {
    --button-size: 48px;
}
```

Apply to one instance of a widget with inline styles:

```js
new FullscreenWidget({ style: {'--button-size': '48px'}})
```

Apply a custom class to a widget:

```css
.my-class {
    --button-size: 48px;
}
```
```js
new FullscreenWidget({ className: 'my-class'})
```

### Size

| Name | Type | Default |
| ---- | ---- | ------- |
| `--button-size` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `28px` |
| `--button-border-radius` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `12px` |
| `--widget-margin` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `12px` |

### Color

| Name | Type | Default |
| ---- | ---- | ------- |
| `--button-background` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `#fff` |
| `--button-stroke` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `rgba(255, 255, 255, 0.3)` |
| `--button-inner-stroke` | [Border](https://developer.mozilla.org/en-US/docs/Web/CSS/border) | `unset` |
| `--button-shadow` | [Box Shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow) | `0px 0px 8px 0px rgba(0, 0, 0, 0.25)` |
| `--button-backdrop-filter` | [Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) | `unset` |
| `--button-icon-idle` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `rgba(97, 97, 102, 1)`
| `--button-icon-hover` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `rgba(24, 24, 26, 1)`
