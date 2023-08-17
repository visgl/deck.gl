# FullscreenWidget

## Variables

### Size

| Name | Type | Default |
| ---- | ---- | ------- |
| `--button-size` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `28px` |
| `--button-border-radius` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `12px` |
| `--wdgt-margin` | [Dimension](https://developer.mozilla.org/en-US/docs/Web/CSS/dimension) | `12px` |

### Color

| Name | Type | Default |
| ---- | ---- | ------- |
| `--button-background` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `#fff` |
| `--button-stroke` | [Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) | `rgba(255, 255, 255, 0.3)` |
| `--button-inner-stroke` | [Border](https://developer.mozilla.org/en-US/docs/Web/CSS/border) | `unset` |
| `--button-shadow` | [Box Shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow) | `0px 0px 8px 0px rgba(0, 0, 0, 0.25)` |
| `--button-backdrop-filter` | [Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) | `unset` |

#### Examples

```js
{
    // Light Flat Theme
    '--button-background': '#fff',
    '--button-stroke': 'rgba(255, 255, 255, 0.3)',
    '--button-inner-stroke': 'unset',
    '--button-shadow': '0px 0px 8px 0px rgba(0, 0, 0, 0.25)',
    '--button-backdrop-filter': 'unset'
}
```

```js
{
    // Light Glass Theme
    '--button-background': 'rgba(255, 255, 255, 0.6)',
    '--button-stroke': 'rgba(255, 255, 255, 0.3)',
    '--button-inner-stroke': '1px solid rgba(255, 255, 255, 0.6)',
    '--button-shadow': '0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset',
    '--button-backdrop-filter': 'blur(4px)'
}
```

```js
{
    // Dark Flat Theme
    '--button-background': 'rgba(18, 18, 20, 1)',
    '--button-stroke': 'rgba(18, 18, 20, 0.30)',
    '--button-inner-stroke': 'unset',
    '--button-shadow': '0px 0px 8px 0px rgba(0, 0, 0, 0.25)',
    '--button-backdrop-filter': 'unset'
}
```

```js
{
    // Dark Glass Theme
    '--button-background': 'rgba(18, 18, 20, 0.75)',
    '--button-stroke': 'rgba(18, 18, 20, 0.30)',
    '--button-inner-stroke': '1px solid rgba(18, 18, 20, 0.75)',
    '--button-shadow': '0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset',
    '--button-backdrop-filter': 'blur(4px)'
}
```

