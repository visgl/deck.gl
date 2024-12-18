# Writing Your Own Widget

## Preparations

There are a many ways to build a widget in deck.gl, and it is helpful to consider what approach will serve you best before starting. We've provided guides for commonly used approaches: 

* **[Implement a universal widget](./universal-widgets.md)** - A universal widget is compatible with any deck.gl application and is UI framework agnostic. This option is best for developing widgets to be used throughout the deck.gl ecosystem.
* **[Create a react widget](./react-widgets.md)** - A react widget utilizes the convenience of react to develop the UI for your widget. It is tightly coupled to your react application, being mounted in the same root as the rest of your UI. This option is best for developing widgets custom to your react application. 


## Creating The Widget class

Your widget class must implement the [Widget](../../api-reference/core/widget.md) interface.

```ts
import type {Widget} from '@deck.gl/core';

class AwesomeWidget implements Widget {
    constructor(props) {
        this.id = props.id || 'awesome-widget';
        this.props = { ...props };
    }
    onAdd() {...}
    onRemove() {...}
}
```

It's most convenient to use TypeScript, but it can also be implemented in JavaScript.

### Defining Widget Properties

The list of properties is the main API your new widget will provide to
applications. So it makes sense to carefully consider what properties
your widget should offer.

You also need to define the default values of the widget's properties.

```ts
import type {WidgetPlacement} from '@deck.gl/core'

interface AwesomeWidgetProps {
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

class AwesomeWidget implements Widget {
  constructor(props: AwesomeWidgetProps) {
    this.id = props.id || 'awesome-widget';
    this.placement = props.placement || 'top-left';
    this.viewId = props.viewId || null;

    this.props = { ...props }
  }
}
```

## Best Practices

- **Plan Your API:** Clearly define the properties and events your widget will expose so that its easy for developers to integrate into their applications.
- **Handle Lifecycle Events:** Implement lifecycle methods like `onAdd`, `onRemove`, and `setProps` to manage the widget's updates effectively.
- **Optimize for Performance:** Minimize unnecessary DOM re-renders and resource usage by carefully managing state updates.
- **Ensure Accessibility:** Provide options for styling and interactions that respect user preferences, such as keyboard navigation and screen reader support.