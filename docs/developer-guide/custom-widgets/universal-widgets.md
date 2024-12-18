# Universal Widgets

Widgets in deck.gl allow developers to create custom UI elements that are deeply integrated into the deck.gl rendering system. This guide covers the steps to implement widgets that are framework-agnostic, ensuring compatibility across various applications.

## Implementing the Widget Lifecycle Functions

The widget lifecycle functions define how a widget initializes, updates, and cleans up its integration with deck.gl.

### Adding a Widget

[`onAdd({deck, viewId}): HTMLElement?`](../../api-reference/core/widget.md#onadd) - This method provides deck.gl with the root DOM element of your widget. This element is positioned based on `placement` and `viewId` members.

```ts
import { type Widget } from '@deck.gl/core'

class AwesomeWidget implements Widget {
  onAdd({ deck, viewId }) {
    const element = document.createElement('div');
    // Initialize and style your element
    return element
  }
}
```

### Updating Properties

[`setProps(props)`](../../api-reference/core/widget.md#setprops) - This method is called whenever widget properties are updated. Use this to apply changes dynamically.

```ts
class AwesomeWidget implements Widget {
  setProps(props: Partial<ZoomWidgetProps>) {
    Object.assign(this.props, props);
  }
}
```

### Handling Viewport Changes

[`onViewportChange(viewport: Viewport)`](../../api-reference/core/widget.md#onviewportchange) - Widgets can listen to viewport updates via the `onViewportChange` method. You can target specific viewports or listen to all. 

Specific viewport:

```ts
class AwesomeWidget implements Widget {
  viewId = 'minimap'

  onViewportChange(viewport: Viewport) {
    // Handle updates for the "minimap" viewport
  }
}
```

All viewports:

```ts
class AwesomeWidget implements Widget {
  viewId = null

  onViewportChange(viewport: Viewport) {
    // Handle updates for all viewports
  }
}
```

### Redrawing Widget

[`onRedraw({viewports, layers})`] - This method is invoked when deck.gl performs rendering. This is useful for updating the widget UI to correspond to changes in layers or viewports, such as a `HeatmapLayer`'s `colorRange` prop.

```ts
class AwesomeWidget implements Widget {
  onRedraw({ viewports, layers }) {
    // Update widget visuals
  }
}
```

### Removing Widget

[`onRemove()`](../../api-reference/core/widget.md#onremove) - If implemented, this method is called when your widget is removed. This is a good time to clean up resources.

```ts
class AwesomeWidget implements Widget {
  onRemove() {
    // Cleanup code
  }
}
```

-----

## Handling View Interaction Events

A widget can update in response to a user interacting with the deck.gl view the widget is attached to. 

```ts
class AwesomeWidget implements Widget {
  viewId = 'minimap'

  onClick(info, event) {
    // Called when a click event occurs in the minimap view.
  }
}
```

See [`Methods`](../../api-reference/core/widget.md#methods) for a complete list.

## Customizing Styles

A good universal widget provides users with ways to customize the styles of any elements it creates. Three common ways to do with are:

- Inline styles prop
- CSS class prop
- CSS variables

### Inline Styles Prop

Define a prop for overriding styles inline

```ts
interface AwesomeWidgetProps {
  style?: Partial<CSSStyleDeclaration>;
}
```

Apply the styles to your widget

```ts
import {
  type Widget,
  _deepEqual as deepEqual,
  _applyStyles as applyStyles,
  _removeStyles as removeStyles
} from '@deck.gl/core'

class AwesomeWidget implements Widget {

  constructor(props: AwesomeWidgetProps) {
    ...
    this.props = {
      ...props,
      style: props.style || {}
    }
  }

  onAdd() {
    const {style} = this.props;
    const element = document.createElement('div');
    applyStyles(element, style);
    ...
  }
  
  setProps(props: Partial<AwesomeWidgetProps>) { 
    const el = this.element;
    if (el) {
      if (!deepEqual(oldProps.style, props.style, 1)) {
        removeStyles(el, oldProps.style);
        applyStyles(el, props.style);
      }
    }
    ...
  }

}
```

### CSS Class Prop

Define a prop for adding a CSS class

```ts
interface AwesomeWidgetProps {
  /**
   * Additional CSS class.
   */
  className?: string;
}
```

Apply the CSS class to your widget

```ts
import { type Widget } from '@deck.gl/core'

class AwesomeWidget implements Widget {

  onAdd() {
    const {className} = this.props;
    const element = document.createElement('div');
    if (className) element.classList.add(className);
    ...
  }
  
  setProps(props: Partial<AwesomeWidgetProps>) {
    const oldProps = this.props;
    const el = this.element;
    if (el) {
      if (oldProps.className !== props.className) {
        if (oldProps.className) el.classList.remove(oldProps.className);
        if (props.className) el.classList.add(props.className);
      }
    }
    ...
  }
}
```

### CSS Variables

Define variables in the widget's CSS stylesheet

```css
.my-awesome-widget {
  background-color: var(--primary-color, rebeccapurple);
}
```

Override in user's application

```css
.my-awesome-widget {
    --primary-color: chartreuse;
}
```

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

class LayerListWidget implements Widget {
  id = 'layer-list-widget';
  props: ZoomWidgetProps;
  placement: WidgetPlacement = 'top-left';
  viewId?: string | null = null;
  viewports: {[id: string]: Viewport} = {};
  layers: Layer[] = [];
  deck?: Deck<any>;
  element?: HTMLDivElement;

  constructor(props: AwesomeWidgetProps) {
    this.id = props.id || 'layer-list-widget';
    this.placement = props.placement || 'top-left';
    this.viewId = props.viewId || null;

    this.props = { 
      ...props,
      style: props.style || {}
    }
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const {style, className} = this.props;
    const element = document.createElement('div');
    element.classList.add('deck-widget', 'deck-widget-zoom');
    if (className) element.classList.add(className);
    applyStyles(element, style);
    this.deck = deck;
    this.element = element;
    this.update();
    return element;
  }

  onRedraw({layers}: {layers: Layer[]}) {
    this.layers = layers;
    this.update();
  }

  onViewportChange(viewport) {
    this.viewports[viewport.id] = viewport
  }

  update() {
    const element = this.element;
    if (!element) {
      return;
    }
    let layers = this.layers
    if (this.deck?.props.layerFilter) {
      const ui = (
        {viewports.values().map(viewport => (
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
