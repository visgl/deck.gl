# Preact Widgets

Preact widgets are an easy way to add dynamic UI elements into universal deck.gl widgets using the [Preact](https://preactjs.com/) UI library. This guide will walk you through the process of building Preact-based widgets and best practices.

## Why Use Preact Widgets?

Preact widgets leverage the strengths of React’s component model in a lighter weight library, allowing:

 - **Easy Composition:** Reuse and combine components.
 - **Declarative UI:** Define your UI in a predictable and straightforward manner using JSX.
 - **Small Size:** Preact is small enough that your code is the largest part of your application.

Preact widgets are suitable when you are working with any UI framework and is lightweight enough to distribute with your widget in a library.

> Tip: Read more about the differences between Preact and React [here](https://preactjs.com/guide/v10/differences-to-react/).

## Writing a React Widget

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

interface LayerListWidgetProps {
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
}

class LayerListWidget implements Widget<LayerListWidgetProps> {
  id = 'layer-list-widget';
  props: LayerListWidgetProps;
  placement: WidgetPlacement = 'top-left';
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
    }
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
    // Handle when props change here.
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    this.props = {...props};
    this.update();
  }

  onRedraw({layers}: {layers: Layer[]}) {
    this.layers = layers;
    this.update();
  }

  onViewportChange(viewport) {
    this.viewports[viewport.id] = viewport
  }

  private update() {
    const element = this.element;
    if (!element) {
      return;
    }
    let layers = this.layers
    if (this.deck?.props.layerFilter) {
      const ui = (
        {this.viewports.values().map(viewport => (
          <div>
            {viewport.id}
            <ul>
              {layers.filter(layer => (
                this.deck?.props.layerFilter({layer, viewport})
              )).map((layer) => {
                <li key={layer.id}>{layer.id}</li>
              })}
            </ul>
          </div>
        ))}
      );
      render(ui, element);
    } else {
      const ui = (
        <ul>
          {this.layers.map((layer) => (
            <li key={layer.id}>{layer.id}</li>
          ))}
        </ul>
      )
      render(ui, element);
    }
  }
}
```

This widget dynamically renders a list of layers and updates as the deck.gl state changes.
