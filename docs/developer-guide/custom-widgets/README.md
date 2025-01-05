# Writing Your Own Widget

## Preparations

There are many ways to build a widget in deck.gl, and it’s helpful to consider which approach best suits your needs before getting started. Below are guides for commonly used approaches: 

* **[Implement a universal widget](./universal-widgets.md)** - A "universal widget" is a widget compatible with any deck.gl application and is UI framework agnostic. This is the best option for developing widgets intended to work across the deck.gl ecosystem.
* **[Use Preact in a universal widget](./preact-widgets.md)** - Preact is a lightweight virtual DOM library commonly used to implement dynamic widget UI. It enables you to create highly interactive widgets without tightly coupling their internals to an application’s UI framework.
* **[Wrap widgets in a React component](./react-widgets.md)** - If you are developing a custom Widget for a React application, you can use React to build the UI. This approach allows you to use React components and can coexist alongside other widgets.

## Creating The Widget class

Your widget class must implement the [Widget](../../api-reference/core/widget.md) interface.

```ts
import type {Widget} from '@deck.gl/core';

class AwesomeWidget implements Widget {
  id = 'awesome-widget';
  props;
  constructor(props) {
      this.id = props.id ?? this.id;
      this.props = { ...props };
  }
  onAdd() {...}
  onRemove() {...}
}
```

It's most convenient to use TypeScript, but widgets can also be implemented in JavaScript.

### Defining Widget Properties

The list of properties is the main API your new widget will provide to
applications. So it makes sense to carefully consider what properties
your widget should offer.

You also need to define the default values of the widget's properties.

```ts
import type {WidgetPlacement} from '@deck.gl/core'

type AwesomeWidgetProps = {
  id?: string;
  /**
   * Widget positioning within the view. Default: 'top-left'.
   */
  placement?: WidgetPlacement;
  /**
   * View to attach to and interact with. Required when using multiple views. Default: null
   */
  viewId?: string | null;
  ...
}

class AwesomeWidget implements Widget<AwesomeWidgetProps> {
  id = 'awesome-widget';
  props: AwesomeWidgetProps;
  placement: WidgetPlacement = 'top-left';
  viewId?: string | null = null;

  constructor(props: AwesomeWidgetProps) {
    this.id = props.id ?? this.id;
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;

    this.props = { ...props }
  }
}
```

## Best Practices

- **Plan Your API:** Clearly define the properties and events your widget will expose so that its easy for developers to integrate into their applications.
- **Handle Lifecycle Events:** Implement lifecycle methods like `onAdd`, `onRemove`, and `setProps` to manage the widget's updates effectively.
- **Optimize for Performance:** Minimize unnecessary DOM re-renders and resource usage by carefully managing state updates.
- **Ensure Accessibility:** Provide options for styling and interactions that respect user preferences, such as keyboard navigation and screen reader support.