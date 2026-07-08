# Widget Tooltip

`updateWidgetTooltip` adds delegated, theme-aware text tooltips to a custom widget.

```ts
import {Widget} from '@deck.gl/core';
import {updateWidgetTooltip} from '@deck.gl/widgets';
import {render} from 'preact';
import '@deck.gl/widgets/stylesheet.css';
```

## Usage

Call `updateWidgetTooltip` from `onAfterRenderHTML()`. Descendants with a `data-deck-widget-tooltip` attribute become tooltip anchors.

```tsx
class ResetWidget extends Widget {
  onRenderHTML(rootElement: HTMLElement) {
    render(
      <button
        aria-label="Reset view"
        data-deck-widget-tooltip="Reset view"
        onClick={() => this.resetView()}
      >
        Reset
      </button>,
      rootElement
    );
  }

  protected override onAfterRenderHTML = updateWidgetTooltip;
}
```

Tooltip labels are plain text. Set `aria-label` separately when the anchor needs an accessible name, such as an icon-only button. If an anchor also has a native `title`, the helper removes it to avoid competing browser tooltips. The helper shows tooltips on pointer hover and keyboard focus, and hides them on pointer leave, blur, Escape, or the next render.

## `updateWidgetTooltip`

Installs delegated tooltip event handling on a widget root and removes any visible tooltip from the previous render.

Parameters:

- `rootElement` (`HTMLElement`) - Widget root containing elements with `data-deck-widget-tooltip`.

The `.deck-widget-tooltip` style uses the standard widget theme variables. Applications may override `--tooltip-max-width` and `--tooltip-z-index` when needed.

## Source

[modules/widgets/src/lib/widget-tooltip.ts](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/lib/widget-tooltip.ts)
