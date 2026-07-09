# Widget Tooltips

<img src="https://img.shields.io/badge/from-v9.5-green.svg?style=flat-square" alt="from v9.5" />

Built-in button widgets ship with styled tooltips that appear on hover and keyboard focus. These replace the slow native browser title tooltips with themed, customizable alternatives.

## Customizing Built-in Tooltips

### Overriding tooltip text

Each button widget accepts a tooltip prop that overrides the default label:

```ts
new ZoomWidget({ zoomInTooltip: 'Zoom In (Ctrl+Plus)' })
new FullscreenWidget({ enterTooltip: 'Go Fullscreen (F)' })
```

### Overriding with custom HTML

For rich content (e.g. keyboard shortcut badges), pass an `HTMLElement`:

```ts
const tip = document.createElement('span');
tip.innerHTML = 'Zoom In <kbd>⌘+</kbd>';
new ZoomWidget({ zoomInTooltip: tip })
```

### Disabling tooltips

Pass `false` to suppress the tooltip for a specific button:

```ts
new ZoomWidget({ zoomInTooltip: false })
new CompassWidget({ tooltip: false })
```

### Styling tooltips

Tooltip appearance inherits the widget theme via CSS variables. You can customize them globally or per-widget:

```css
.deck-widget {
  --tooltip-max-width: 300px;
  --tooltip-z-index: 2000;
}
```

| Name | Type | Default |
| ---- | ---- | ------- |
| `--tooltip-max-width` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `240px` |
| `--tooltip-z-index` | Number | `1000` |

Tooltips also inherit the following [menu variables](./styling.md#menu): `--menu-background`, `--menu-shadow`, `--menu-backdrop-filter`, `--menu-text`.

## Writing Tooltips in Custom Widgets

### Using Preact (with \_Tooltip component)

If your custom widget uses Preact for rendering, import the `_Tooltip` component:

```tsx
import {_Tooltip as Tooltip} from '@deck.gl/widgets';
import {render} from 'preact';

class MyWidget extends Widget {
  className = 'my-widget';
  placement = 'top-left';

  onRenderHTML(rootElement) {
    render(
      <Tooltip content="My tooltip text">
        <button aria-label="My Action" onClick={...}>
          Do thing
        </button>
      </Tooltip>,
      rootElement
    );
  }
}
```

#### TooltipProps

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `content` | `string \| ComponentChildren` | — | Tooltip content to display |
| `placement` | `Placement` | `'right'` | Position relative to the trigger (uses [@floating-ui/dom](https://floating-ui.com/docs/computePosition#placement) placement values) |
| `children` | `ComponentChildren` | — | The trigger element |

### Without Preact (CSS class + your own logic)

For custom widgets using vanilla JS, React, or any other framework, implement your own show/hide behavior and apply the `.deck-widget-tooltip` CSS class to get consistent theming:

```ts
class MyWidget extends Widget {
  className = 'my-widget';
  placement = 'top-left';

  onRenderHTML(rootElement) {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', 'My Action');
    btn.setAttribute('aria-describedby', 'my-tooltip');

    const tooltip = document.createElement('div');
    tooltip.id = 'my-tooltip';
    tooltip.className = 'deck-widget-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = 'My Action';
    tooltip.hidden = true;

    btn.addEventListener('pointerenter', () => { tooltip.hidden = false; });
    btn.addEventListener('pointerleave', () => { tooltip.hidden = true; });

    rootElement.replaceChildren(btn, tooltip);
  }
}
```

The `.deck-widget-tooltip` class provides themed background, shadow, text color, font, border-radius, and max-width — matching the rest of the widget UI. You are responsible for:

- Positioning (consider [@floating-ui/dom](https://floating-ui.com/docs/getting-started) or CSS anchor positioning)
- Show/hide behavior (pointer events, focus, keyboard dismiss)

## Accessibility

Built-in widget tooltips follow these accessibility practices:

- Buttons use `aria-label` for screen reader announcements
- Tooltip elements have `role="tooltip"`
- Triggers link to their tooltip via `aria-describedby`
- Tooltips appear on keyboard focus (`:focus-visible`)
- Pressing `Escape` dismisses the tooltip

Custom widget authors should follow the same patterns.

## Tooltip override props by widget

| Widget | Tooltip prop(s) |
| ------ | --------------- |
| ZoomWidget | `zoomInTooltip`, `zoomOutTooltip` |
| FullscreenWidget | `enterTooltip`, `exitTooltip` |
| CompassWidget | `tooltip` |
| GimbalWidget | `tooltip` |
| ScreenshotWidget | `tooltip` |
| ResetViewWidget | `tooltip` |
| ThemeWidget | `lightModeTooltip`, `darkModeTooltip` |
| IconWidget | `tooltip` |
| ToggleWidget | `tooltip`, `onTooltip` |

All tooltip props accept `string | HTMLElement` and default to the widget's label prop value.
