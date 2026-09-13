# Writing Your Own Widget

Widgets are UI components that are deeply integrated with deck.gl's views and layers. A widget can be positioned relative to a view, react to viewport and layer changes, respond to picking events, and drive the view state. The [`@deck.gl/widgets`](../../api-reference/widgets/overview.md) module ships many ready-made widgets, and this guide covers how to write your own when none of them fit.

## What Is a Widget?

Every widget is a class that extends the [`Widget`](../../api-reference/core/widget.md) base class from `@deck.gl/core`. deck.gl calls a small set of lifecycle methods on the instance:

| Lifecycle method | When deck.gl calls it |
| --- | --- |
| `constructor(props)` | When the application creates the widget. |
| `onAdd({deck, viewId})` | Once, when the widget is added to a `Deck` instance. Return a root HTML element, or return nothing to let the base class create one. |
| `onRenderHTML(rootElement)` | Whenever the widget's HTML needs to be (re)rendered: after `onAdd`, after every `setProps`, and whenever the widget calls `this.updateHTML()`. |
| `setProps(props)` | When the application supplies new props. The base class applies `style` and `className` changes and calls `updateHTML()`. |
| `onViewportChange(viewport)` | When a viewport the widget is attached to changes. |
| `onRedraw({viewports, layers})` | Every time deck.gl redraws. |
| `onHover`, `onClick`, `onDragStart`, `onDrag`, `onDragEnd` | When the corresponding pointer event happens in a view the widget is attached to. |
| `onRemove()` | Once, when the widget is removed or the `Deck` is finalized. |

The base class also populates a few members once the widget is mounted: `deck`, `rootElement` and `widgetManager`. See the [Universal Widgets](./universal-widgets.md) guide for a walk-through of each method.

## Choosing an Approach

Widgets differ mainly in *where the UI is rendered*. Consider which approach suits your needs before getting started:

* **[Implement a universal widget](./universal-widgets.md)** - A "universal widget" renders its own UI inside `onRenderHTML` using DOM APIs. It is compatible with any deck.gl application and is UI framework agnostic. This is the best option for widgets intended to be shared across the deck.gl ecosystem.
* **[Use Preact in a universal widget](./preact-widgets.md)** - The built-in deck.gl widgets are universal widgets that use [Preact](https://preactjs.com/) internally. Preact lets you write JSX and reuse the same button, menu and tooltip components the built-in widgets use, while your widget remains framework agnostic from the outside.
* **[Render widget UI with React](./react-widgets.md)** - If you are developing a widget for a React application, you can hand an element to the widget and render into it with a React portal via the [`useWidget`](../../api-reference/react/use-widget.md) hook. The widget is tightly coupled to your React app but can share components and state with the rest of your UI.

Universal widgets (with or without Preact) can be used in any application, including React applications, and can be wrapped in React components. The reverse is not true: a widget whose UI is rendered by React can only be used in a React application.

## Creating a New Widget

A minimal widget defines its default props, a CSS class name, a placement, and how to render its HTML:

```ts
import {Widget} from '@deck.gl/core';
import type {WidgetProps, WidgetPlacement} from '@deck.gl/core';

export type HelloWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-left'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. Default `null`. */
  viewId?: string | null;
  /** Text to display. */
  text?: string;
};

export class HelloWidget extends Widget<HelloWidgetProps> {
  static defaultProps: Required<HelloWidgetProps> = {
    ...Widget.defaultProps,
    id: 'hello',
    placement: 'top-left',
    viewId: null,
    text: 'Hello, deck.gl!'
  };

  className = 'deck-widget-hello';
  placement: WidgetPlacement = 'top-left';

  constructor(props: HelloWidgetProps = {}) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<HelloWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onRenderHTML(rootElement: HTMLElement) {
    rootElement.textContent = this.props.text;
  }
}
```

```ts
new Deck({
  widgets: [new HelloWidget({text: 'Welcome', placement: 'bottom-right'})]
});
```

It's most convenient to use TypeScript, but widgets can also be implemented in JavaScript.

### Defining Widget Properties

The list of properties is the main API your new widget will provide to applications, so it makes sense to carefully consider what properties your widget should offer.

Every widget accepts the base [`WidgetProps`](../../api-reference/core/widget.md#widgetprops) (`id`, `style`, `className`, and the experimental `_container`). By convention, widgets with visible UI also accept `placement` and `viewId`. Extend `WidgetProps` with your own type:

```ts
import type {WidgetProps, WidgetPlacement} from '@deck.gl/core';

export type AwesomeWidgetProps = WidgetProps & {
  placement?: WidgetPlacement;
  viewId?: string | null;
  /** Your own props go here */
  label?: string;
  onSomethingHappened?: (value: number) => void;
};
```

Default values live on the static `defaultProps` object. The `Widget` constructor merges `defaultProps` with the props passed by the application, so `this.props` is always fully populated (its type is `Required<PropsT>`):

```ts
export class AwesomeWidget extends Widget<AwesomeWidgetProps> {
  static defaultProps: Required<AwesomeWidgetProps> = {
    ...Widget.defaultProps,
    id: 'awesome',
    placement: 'top-left',
    viewId: null,
    label: 'Awesome',
    onSomethingHappened: () => {}
  };
}
```

Remarks:

* `id` should default to a short, unique name for the widget type. Applications override it when they use more than one instance of the same widget.
* Use `undefined!` in `defaultProps` for optional props that have no meaningful default (for example, a controlled-mode prop that should be `undefined` when the widget is uncontrolled). Several built-in widgets follow this convention.
* Callback props should default to a no-op function so the widget can call them unconditionally.
* Mirror `placement` and `viewId` into the class members of the same name from `setProps`. deck.gl reads the *members* to decide where to mount the widget and which view's events it should receive.

### Controlled and Uncontrolled State

Widgets with internal state, such as a toggle or a slider, should follow the same conventions as the built-in widgets so applications can control, observe and intercept user interactions:

* Accept an `initialXxx` prop for uncontrolled usage and an `xxx` prop for controlled usage.
* Expose a `getXxx()` method that returns the controlled prop if set, otherwise the internal state.
* Fire an `onXxxChange(newValue)` callback whenever the user changes the value, and only update the internal state when the widget is uncontrolled.

See [Controlled vs Uncontrolled Mode](../../api-reference/widgets/overview.md#controlled-vs-uncontrolled-mode) for the application-facing description of this pattern, and the [Universal Widgets](./universal-widgets.md#managing-widget-state) guide for an implementation.

## Best Practices

- **Plan Your API:** Clearly define the properties and callbacks your widget will expose so that it is easy for developers to integrate into their applications. Follow the naming conventions of the built-in widgets (`label`, `tooltip`, `initial*`, `on*Change`).
- **Render from `onRenderHTML`:** Keep all DOM updates inside `onRenderHTML` and call `this.updateHTML()` whenever internal state changes. This keeps props, state and UI in sync.
- **Handle Lifecycle Events:** Register global listeners (for example on `document` or `window`) in `onAdd` and remove them in `onRemove`.
- **Prefer view state helpers:** Use `this.viewIds`, `this.getViewState()` and `this.setViewState()` to read and drive the camera instead of reaching into `deck.props`.
- **Optimize for Performance:** `onRedraw` and `onViewportChange` can be called on every animation frame. Compare against previous state and only call `updateHTML()` when something the user can see has changed.
- **Ensure Accessibility:** Use real `<button>` elements, set `aria-label`s, and make interactive elements keyboard reachable. See [Widget Tooltips](../../api-reference/widgets/tooltips.md#accessibility) for the patterns used by the built-in widgets.
- **Make Styling Customizable:** Give your root element a unique class name and read colors and sizes from [CSS variables](../../api-reference/widgets/styling.md) so applications can theme your widget along with the built-in ones.
