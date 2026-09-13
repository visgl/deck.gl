# Preact Widgets

To create a reusable, universal widget that works with any JavaScript UI framework, you would normally implement it using the "raw" HTML DOM APIs. While this is the canonical approach, these APIs are quite verbose.
Instead, the built-in widgets in `@deck.gl/widgets` internally use the [Preact](https://preactjs.com/) UI library, which lets us develop widgets with the clarity of JSX and React-style code, while remaining completely framework agnostic in their external APIs.
This guide walks through using Preact to implement universal widgets, and how to reuse the UI components that ship with `@deck.gl/widgets`.

## Why Use Preact in a Widget?

Preact widgets leverage the strengths of React's component model in a lighter weight library, allowing:

 - **Easy Composition:** Reuse and combine components, including the button, menu and tooltip components used by the built-in widgets.
 - **Declarative UI:** Define your UI in a predictable and straightforward manner using JSX. Preact diffs the DOM for you, so re-rendering on every `onRedraw` is cheap.
 - **Small Size:** Preact is small enough to distribute with your widget in a library without meaningfully affecting bundle size.

Preact widgets are still universal widgets: the application using your widget does not need to use Preact, or any UI framework at all.

> Tip: Read more about the differences between Preact and React [here](https://preactjs.com/guide/v10/differences-to-react/).

## Writing a Preact Widget

### Prerequisites

Ensure your project includes the `preact` package.

```sh
npm install preact
```

When using the TypeScript compiler, add the following configuration to your `tsconfig.json` to transpile JSX to Preact-compatible JavaScript:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

> Note: Developer environments vary. Refer to the [Preact TypeScript](https://preactjs.com/guide/v10/typescript) documentation for additional environments.

### Rendering with Preact

Call Preact's `render` inside `onRenderHTML`. Because the root element is reused between renders, Preact updates only the parts of the DOM that changed:

```tsx
import {Widget} from '@deck.gl/core';
import type {WidgetProps, WidgetPlacement} from '@deck.gl/core';
import {render} from 'preact';

export type CounterWidgetProps = WidgetProps & {
  placement?: WidgetPlacement;
  viewId?: string | null;
};

export class CounterWidget extends Widget<CounterWidgetProps> {
  static defaultProps: Required<CounterWidgetProps> = {
    ...Widget.defaultProps,
    id: 'counter',
    placement: 'top-left',
    viewId: null
  };

  className = 'deck-widget-counter';
  placement: WidgetPlacement = 'top-left';
  count = 0;

  constructor(props: CounterWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<CounterWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement) {
    render(
      <button
        type="button"
        style={{pointerEvents: 'auto'}}
        onClick={() => {
          this.count++;
          this.updateHTML();
        }}
      >
        Clicked {this.count} times
      </button>,
      rootElement
    );
  }
}
```

Keep state on the widget class rather than in Preact hooks, and call `this.updateHTML()` when it changes. Widget state must survive re-renders triggered by `setProps`, and deck.gl needs to be able to read it (for example, through `getXxx()` methods).

### Reusing Built-in Components

`@deck.gl/widgets` exports the Preact components used by the built-in widgets. They are prefixed with an underscore because their API is experimental and may change between minor versions, but they are the quickest way to make a custom widget look and behave like the built-in ones:

| Component | Description |
| --- | --- |
| `_IconButton` | A themed button with an icon, `aria-label`, and a styled tooltip. Pass `icon` (a data URL used as a CSS mask), or `children` to render custom content. |
| `_ButtonGroup` | Groups `_IconButton`s vertically or horizontally, like the `ZoomWidget`. |
| `_Tooltip` | Wraps any trigger element with a themed tooltip positioned by floating-ui. See [Widget Tooltips](../../api-reference/widgets/tooltips.md#writing-tooltips-in-custom-widgets). |
| `_DropdownMenu`, `_SimpleMenu` | Themed menus used by the `SelectorWidget` and `ContextMenuWidget`. |
| `_RangeInput` | The themed slider used by the `TimelineWidget`. |

```tsx
import {_IconButton as IconButton, _ButtonGroup as ButtonGroup} from '@deck.gl/widgets';
import {render} from 'preact';

export class RotateWidget extends Widget<RotateWidgetProps> {
  onRenderHTML(rootElement: HTMLElement) {
    render(
      <ButtonGroup orientation="horizontal">
        <IconButton
          icon={ROTATE_CCW_ICON}
          label="Rotate counter-clockwise"
          onClick={() => this.rotate(-90)}
        />
        <IconButton
          icon={ROTATE_CW_ICON}
          label="Rotate clockwise"
          onClick={() => this.rotate(90)}
        />
      </ButtonGroup>,
      rootElement
    );
  }
}
```

Applications must import `@deck.gl/widgets/stylesheet.css` for these components to be styled. See [Styling Widgets](../../api-reference/widgets/styling.md) for the CSS variables they respond to.

## Example: Layer List Widget with Preact

Below is a comprehensive example of a layer list widget. It lists the top-level layers rendered in the view it is attached to, and lets the user toggle each layer's visibility. Since layers belong to the application, the widget does not modify them directly; instead it fires an `onLayerVisibilityChange` callback and the application re-renders its layers with the new `visible` value. This is the same controlled pattern the built-in widgets use.

```tsx
import {Widget} from '@deck.gl/core';
import type {Layer, Viewport, WidgetPlacement, WidgetProps} from '@deck.gl/core';
import {render} from 'preact';

export type LayerListWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. Default `null`. */
  viewId?: string | null;
  /** Called when the user toggles a layer's checkbox. */
  onLayerVisibilityChange?: (params: {layerId: string; visible: boolean}) => void;
};

export class LayerListWidget extends Widget<LayerListWidgetProps> {
  static defaultProps: Required<LayerListWidgetProps> = {
    ...Widget.defaultProps,
    id: 'layer-list',
    placement: 'top-left',
    viewId: null,
    onLayerVisibilityChange: () => {}
  };

  className = 'deck-widget-layer-list';
  placement: WidgetPlacement = 'top-left';
  layers: Layer[] = [];
  viewports: Viewport[] = [];

  constructor(props: LayerListWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<LayerListWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRedraw({viewports, layers}: {viewports: Viewport[]; layers: Layer[]}) {
    // Only show top-level layers, not the sublayers generated by composite layers
    const topLevelLayers = layers.filter(layer => !layer.parent);
    const changed =
      topLevelLayers.length !== this.layers.length ||
      topLevelLayers.some((layer, i) => layer !== this.layers[i]) ||
      viewports.length !== this.viewports.length ||
      viewports.some((viewport, i) => viewport.id !== this.viewports[i]?.id);

    if (changed) {
      this.layers = topLevelLayers;
      this.viewports = viewports;
      this.updateHTML();
    }
  }

  onRenderHTML(rootElement: HTMLElement) {
    const {layerFilter} = this.deck?.props ?? {};

    render(
      <div className="deck-widget-layer-list-panel">
        {this.viewports.map(viewport => {
          const layers = layerFilter
            ? this.layers.filter(layer =>
                layerFilter({layer, viewport, isPicking: false, renderPass: 'widget'})
              )
            : this.layers;
          return (
            <section key={viewport.id}>
              <h4>Layers in {viewport.id}</h4>
              <ul>
                {layers.map(layer => (
                  <li key={layer.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={layer.props.visible}
                        onChange={event =>
                          this.props.onLayerVisibilityChange({
                            layerId: layer.id,
                            visible: (event.target as HTMLInputElement).checked
                          })
                        }
                      />
                      {layer.id}
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>,
      rootElement
    );
  }
}
```

```css
.deck-widget-layer-list-panel {
  pointer-events: auto;
  padding: 8px 12px;
  background: var(--menu-background, #fff);
  color: var(--menu-text, rgb(24, 24, 26));
  border-radius: var(--button-corner-radius, 8px);
  box-shadow: var(--menu-shadow, 0px 0px 8px 0px rgba(0, 0, 0, 0.25));
  font-size: 12px;
}
```

Using the widget in an application:

```ts
const hidden = new Set<string>();

function renderLayers() {
  return [
    new ScatterplotLayer({id: 'points', visible: !hidden.has('points'), ...}),
    new GeoJsonLayer({id: 'boundaries', visible: !hidden.has('boundaries'), ...})
  ];
}

const deck = new Deck({
  layers: renderLayers(),
  widgets: [
    new LayerListWidget({
      onLayerVisibilityChange: ({layerId, visible}) => {
        if (visible) hidden.delete(layerId); else hidden.add(layerId);
        deck.setProps({layers: renderLayers()});
      }
    })
  ]
});
```

Remarks:

* Hidden layers are still passed to `onRedraw` with `props.visible === false`, so the list keeps showing them with their checkbox unchecked.
* `layerFilter` is the application's own filter; calling it with `renderPass: 'widget'` lets the widget mirror which layers are drawn in each view.
