# Universal Widgets

Widgets in deck.gl allow developers to create custom UI elements that are deeply integrated into the deck.gl rendering system. This guide covers the steps to implement widgets that are framework-agnostic, ensuring compatibility across various applications.

## Implementing the Widget Lifecycle Functions

The widget lifecycle functions define how a widget initializes, updates, and cleans up its integration with deck.gl.

### Constructing a Widget

[`constructor(props: PropsT`)] - Initialize the widget's members with a constructor.

```ts
import type { Widget, WidgetPlacement } from '@deck.gl/core'

class AwesomeWidget implements Widget<AwesomeWidgetProps> {
  id = 'awesome-widget';
  props: AwesomeWidgetProps;
  placement: WidgetPlacement = 'top-left';
  viewId?: string | null = null;

  constructor(props: AwesomeWidgetProps) {
    // Required members
    this.id = props.id ?? this.id;
    this.props = {
      ...props,
      // Apply additional defaults
      style: props.style ?? {}
    }

    // Optional members
    this.viewId = props.viewId ?? this.viewId;
    this.placement = props.placement ?? this.placement;
  }
}
```

> Warning: Avoid directly mutating the `props` object. Instead, apply modifications to a copy, e.g. `this.props = {...props, props.style || {}}` 

### Adding a Widget

[`onAdd({deck, viewId}): HTMLElement?`](../../api-reference/core/widget.md#onadd) - This method provides deck.gl with the root DOM element of your widget. This element is positioned based on `placement` and `viewId` members.

```ts
import { type Widget } from '@deck.gl/core'

class AwesomeWidget implements Widget<AwesomeWidgetProps> {
  onAdd({ deck, viewId }) {
    const element = document.createElement('div');
    // Initialize and style your element
    return element
  }
}
```

### Updating Properties

[`setProps(props: Partial<PropsT>)`](../../api-reference/core/widget.md#setprops) - This method is called whenever widget properties are updated. Use this to apply changes dynamically.

```ts
class AwesomeWidget implements Widget<AwesomeWidgetProps> {
  setProps(props) {
    Object.assign(this.props, props);
  }
}
```

### Handling Viewport Changes

[`onViewportChange(viewport: Viewport)`](../../api-reference/core/widget.md#onviewportchange) - Widgets can listen to viewport updates via the `onViewportChange` method. A widget writer can target specific viewports by setting `viewId` or listen to all. Using props, an author could also choose to allow users to configure this targeting.

Specific viewport:

```ts
class AwesomeWidget implements Widget {
  viewId = 'minimap'

  onViewportChange(viewport) {
    // Handle updates for the "minimap" viewport
  }
}
```

All viewports:

```ts
class AwesomeWidget implements Widget {
  viewId = null

  onViewportChange(viewport) {
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

class AwesomeWidget implements Widget<AwesomeWidgetProps> {

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
  
  setProps(props) { 
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

class AwesomeWidget implements Widget<AwesomeWidgetProps> {

  onAdd() {
    const {className} = this.props;
    const element = document.createElement('div');
    if (className) element.classList.add(className);
    ...
  }
  
  setProps(props) {
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

## Example: Layer Loading Widget in Vanilla JS

Below is a comprehensive example demonstrating a widget indicating whether or not all asynchronous layers are loading implemented without any UI framework. 

```ts
import {
  _deepEqual as deepEqual,
  _applyStyles as applyStyles,
  _removeStyles as removeStyles
} from '@deck.gl/core'
import type {
  Deck, Viewport, Widget, WidgetPlacement, Layer
} from '@deck.gl/core'

interface LayerLoadingWidgetProps {
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

class LayerListWidget implements Widget<LayerLoadingWidgetProps> {
  id = 'layer-loading-widget';
  props: LayerLoadingWidgetProps;
  placement: WidgetPlacement = 'top-left';
  layers: Layer[] = [];
  deck?: Deck<any>;
  element?: HTMLDivElement;

  constructor(props: LayerLoadingWidgetProps) {
    this.id = props.id ?? this.id;
    this.placement = props.placement ?? this.placement;

    this.props = { 
      ...props,
      style: props.style ?? {}
    }
  }

  onAdd({deck}: {deck: Deck<any>}): HTMLDivElement {
    const {style, className} = this.props;
    const element = document.createElement('div');
    element.classList.add('deck-widget', 'deck-widget-layer-loading');
    if (className) element.classList.add(className);
    applyStyles(element, style);
    this.deck = deck;
    this.element = element;
    this.update();
    return element;
  }

  setProps(props: Partial<LayerLoadingWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.props = {...props};
  }

  onRedraw({layers}: {layers: Layer[]}) {
    this.layers = layers;
    this.update();
  }

  update() {
    const element = this.element;
    if (!element) {
      return;
    }

    // Clear the element content
    element.innerHTML = '';

    // Check if all layers are loaded
    let loaded = this.layers?.every(layer => layer.isLoaded);

    // Add a status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.textContent = loaded ? 'All layers loaded' : 'Loading layers...';
    statusIndicator.style.fontWeight = 'bold';
    statusIndicator.style.color = loaded ? 'green' : 'red';
    element.appendChild(statusIndicator);

    // Add a list of layers with their load status
    const layerList = document.createElement('ul');
    for (const layer of this.layers) {
      const listItem = document.createElement('li');
      listItem.textContent = `${layer.id}: ${layer.isLoaded ? 'Loaded' : 'Loading'}`;
      listItem.style.color = layer.isLoaded ? 'green' : 'red';
      layerList.appendChild(listItem);
    }

    element.appendChild(layerList);
  }
}
```

This widget provides a visual representation of layer load statuses and updates as the deck.gl state changes.
