# Preact Widgets

Normally we want to to create a reusable, universal widget that can work with any JavaScript UI framework, we would implement it using the "raw" HTML DOM APIs. While this is the canonical approach, these APIs are quite verbose. 
Instead, the core widgets provided by deck.gl widgets are internally using the [Preact](https://preactjs.com/) UI library, which lets us develop widgets with the clarity of JSX and react style code, while remaining completely framework agnostic in their external APIs. 
This guide will walk you through the process of using Preact to implement universal widgets and best practices.

## Why Use Preact Widgets?

Preact widgets leverage the strengths of React’s component model in a lighter weight library, allowing:

 - **Easy Composition:** Reuse and combine components.
 - **Declarative UI:** Define your UI in a predictable and straightforward manner using JSX.
 - **Small Size:** Preact is small enough that your code is the largest part of your application.

Preact widgets are suitable when you are working with any UI framework and is lightweight enough to distribute with your widget in a library.

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

> Note: Developer environments vary. Refer to the [Preact Typescript](https://preactjs.com/guide/v10/typescript) documentation for additional environments.

## Example: Layer List Widget with Preact

Below is a comprehensive example demonstrating a layer list widget implemented using Preact for dynamic UI rendering:

```tsx
import {
  _deepEqual as deepEqual,
  _applyStyles as applyStyles,
  _removeStyles as removeStyles
} from '@deck.gl/core'
import type {
  Deck, Viewport, Widget, WidgetPlacement, Layer
} from '@deck.gl/core'
import {render} from 'preact';

type LayerListWidgetProps = {
  id?: string;
  /**
   * Widget positioning within the view. Default: 'top-left'.
   */
  placement?: WidgetPlacement;
  /**
   * View to attach to and interact with. Required when using multiple views. Default: null
   */
  viewId?: string | null;
  /**
   * CSS inline style overrides.
   */
  style?: Partial<CSSStyleDeclaration>;
  /**
   * Additional CSS class.
   */
  className?: string;
};

class LayerListWidget implements Widget<LayerListWidgetProps> {
  id = 'layer-list-widget';
  props: LayerListWidgetProps;
  placement: WidgetPlacement = 'top-left';
  viewId?: string | null = null;
  viewports: {[id: string]: Viewport} = {};
  layers: Layer[] = [];
  deck?: Deck<any>;
  element?: HTMLDivElement;

  constructor(props: LayerListWidgetProps) {
    this.id = props.id ?? this.id;
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;

    this.props = {
      ...props,
      style: props.style ?? {}
    };
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const {style, className} = this.props;
    const element = document.createElement('div');
    element.classList.add('deck-widget', 'deck-widget-layer-list');
    if (className) element.classList.add(className);
    applyStyles(element, style);
    this.deck = deck;
    this.element = element;
    this.update();
    return element;
  }

  setProps(props: Partial<LayerListWidgetProps>) {
    const oldProps = this.props;
    const el = this.element;
    // Handle when CSS changes.
    if (el) {
      if (oldProps.className !== props.className) {
        if (oldProps.className) el.classList.remove(oldProps.className);
        if (props.className) el.classList.add(props.className);
      }
      if (!deepEqual(oldProps.style, props.style, 1)) {
        removeStyles(el, oldProps.style);
        applyStyles(el, props.style);
      }
    }
    // Handle when props change.
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    Object.assign(this.props, props);
    this.update();
  }

  onRedraw({layers}: {layers: Layer[]}) {
    this.layers = layers;
    this.update();
  }

  onViewportChange(viewport) {
    this.viewports[viewport.id] = viewport;
  }

  private update() {
    const element = this.element;
    if (!element) {
      return;
    }
    const layers = this.layers;
    if (this.deck?.props.layerFilter) {
      const ui = (
        <>
          {Object.values(this.viewports).map(viewport => (
            <>
              <h4>Layers in {viewport.id}</h4>
              <ul>
                {layers
                  .filter(layer =>
                    this.deck?.props.layerFilter?.({
                      layer,
                      viewport,
                      isPicking: false,
                      renderPass: 'widget'
                    })
                  )
                  .map(layer => (
                    <li key={layer.id}>{layer.id}</li>
                  ))}
              </ul>
            </>
          ))}
        </>
      );
      render(ui, element);
    } else {
      const viewportNames = Object.keys(this.viewports).join(', ');
      const ui = (
        <>
          <h4>Layers in {viewportNames} view</h4>
          <ul>
            {this.layers.map(layer => (
              <li key={layer.id}>{layer.id}</li>
            ))}
          </ul>
        </>
      );
      render(ui, element);
    }
  }
}
```

This widget dynamically renders a list of layers and updates as the deck.gl state changes.
