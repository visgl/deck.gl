# React Widgets

Rendering widget UI with [React](https://react.dev/) lets you build deck.gl widgets with the same components, hooks and state management as the rest of a React application. This guide walks through rendering widget UI with React using [`@deck.gl/react`](../../api-reference/react/overview.md) and a portal.

We recommend that users writing their own widgets be familiar with the `Widget` base class. Consider reviewing the [Universal Widgets](./universal-widgets.md) guide first.

## Two Ways to Use React with Widgets

There are two distinct patterns, and it is important to pick the right one:

1. **Wrap a universal widget in a React component.** The widget renders its own UI (with DOM APIs or [Preact](./preact-widgets.md)); React only manages its lifecycle and props. This is how the widgets exported from `@deck.gl/react/widgets` are made, and it takes one line:

   ```tsx
   import {createWidgetComponent} from '@deck.gl/react';
   import {SwitchWidget as DeckSwitchWidget} from './switch-widget';

   export const SwitchWidget = createWidgetComponent(DeckSwitchWidget);
   ```

   `SwitchWidget` is the toggle from [Managing Widget State](./universal-widgets.md#managing-widget-state), which renders its own button. Render it inside `DeckGL` like any other widget component: `<SwitchWidget onChange={setOn} />`. Use this whenever the widget already exists or should also work outside React. See [Custom classes](../../api-reference/react/components.md#custom-classes).

2. **Render the widget's UI with React.** The widget class hooks into deck.gl and hands its root element to React, which renders into it with a portal. This is the subject of the rest of this guide. It is most suitable when you are working on a React application and do not intend to distribute the widget outside of it.

## Why Render Widget UI with React?

Widget UI implemented with React leverages the strengths of React's component model, allowing:
 - **Easy Composition:** Reuse your application's component library and design system inside the widget.
 - **Shared State:** Read application state from React context or a store directly in the widget UI.
 - **Declarative UI:** Define your UI in a predictable and straightforward manner using JSX.

## Writing a React Widget

### Prerequisites

Ensure your deck.gl project includes the `@deck.gl/react` package, which provides the `DeckGL` component and the [`createWidgetComponent`](../../api-reference/react/components.md#custom-classes) factory.

Install the package if it's not already included:

```sh
npm install @deck.gl/react
```

### Example: Creating a Widget UI with React

Below is a step-by-step example of a widget that rotates the map with two buttons.

#### Define Your Widget Class

Start by creating the widget class, which must extend the [`Widget`](../../api-reference/core/widget.md) base class. The class is responsible for everything that touches deck.gl: view state, events, and lifecycle. It receives the element React will render into as a prop and returns it from `onAdd`. It also hands itself to React through an `onAttach` prop, so that React can call its methods.

```ts
import {Widget, FlyToInterpolator} from '@deck.gl/core';
import type {WidgetProps, WidgetPlacement} from '@deck.gl/core';

export type RotateWidgetProps = WidgetProps & {
  /** Widget positioning within the view. Default 'top-right'. */
  placement?: WidgetPlacement;
  /** View to attach to and interact with. Required when using multiple views. Default `null`. */
  viewId?: string | null;
  /** Degrees to rotate per click. Default 90. */
  step?: number;
  /** Called after each rotation. */
  onRotate?: (params: {viewId: string; bearing: number}) => void;
  /** The element React renders the widget's UI into. */
  element?: HTMLDivElement;
  /** Called with the widget when deck.gl adds it, and with `null` when deck.gl removes it. */
  onAttach?: (widget: RotateWidget | null) => void;
};

export class RotateWidget extends Widget<RotateWidgetProps> {
  static defaultProps: Required<RotateWidgetProps> = {
    ...Widget.defaultProps,
    id: 'rotate',
    placement: 'top-right',
    viewId: null,
    step: 90,
    onRotate: () => {},
    element: undefined!,
    onAttach: () => {}
  };

  className = 'deck-widget-rotate';
  placement: WidgetPlacement = 'top-right';

  constructor(props: RotateWidgetProps) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<RotateWidgetProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onAdd() {
    this.props.onAttach(this);
    // Hand deck.gl the element that React renders into
    return this.props.element;
  }

  onRemove() {
    this.props.onAttach(null);
  }

  onRenderHTML() {
    // React owns the contents of the root element; nothing to do here
  }

  rotate(delta: number) {
    for (const viewId of this.viewIds) {
      const viewState = this.getViewState(viewId);
      const bearing = (((viewState.bearing as number) ?? 0) + delta) % 360;
      this.setViewState(viewId, {
        ...viewState,
        bearing,
        transitionDuration: 300,
        transitionInterpolator: new FlyToInterpolator()
      });
      this.props.onRotate({viewId, bearing});
    }
  }
}
```

Remarks:

* `onRenderHTML` is abstract in `Widget` and must be implemented, even though React renders the UI.
* Because `onAdd` returns your own element, the base class does not create a root element for you. The `deck-widget` class, `props.className` and `props.style` are therefore *not* applied automatically; apply them in your React component instead (see [Styling](#styling-your-react-component) below).
* The `rotate` method uses the [view state helpers](./universal-widgets.md#controlling-the-view) on the base class, so it works with both controlled and uncontrolled view state.

#### Create a Widget Component

Make a component from the widget class with `createWidgetComponent`. It renders inside `DeckGL`, and its props are typed with the `RotateWidgetProps` the class takes, so `<RotateWidget step={45} />` is type checked:

```tsx
import {createWidgetComponent} from '@deck.gl/react';
import {RotateWidget as DeckRotateWidget} from './rotate-widget';

export const RotateWidget = createWidgetComponent(DeckRotateWidget);
```

#### Render the UI Beside `DeckGL`

Create the element once, render the widget component inside `DeckGL`, and render the UI into the element with a [portal](https://react.dev/reference/react-dom/createPortal) beside `DeckGL`:

```tsx
import {useState} from 'react';
import {createPortal} from 'react-dom';
import type {MapViewState} from '@deck.gl/core';
import {DeckGL} from '@deck.gl/react';
import {RotateWidget} from './rotate-widget-component';
import type {RotateWidget as DeckRotateWidget} from './rotate-widget';

const INITIAL_VIEW_STATE: MapViewState = {longitude: -122.4, latitude: 37.8, zoom: 11};

export function App() {
  const [element] = useState(() => document.createElement('div'));
  const [widget, setWidget] = useState<DeckRotateWidget | null>(null);

  return (
    <>
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
        <RotateWidget id="rotate" step={45} element={element} onAttach={setWidget} />
      </DeckGL>
      {createPortal(
        <div className="deck-widget">
          <button type="button" style={{pointerEvents: 'auto'}} onClick={() => widget?.rotate(-45)}>
            Rotate CCW
          </button>
          <button type="button" style={{pointerEvents: 'auto'}} onClick={() => widget?.rotate(45)}>
            Rotate CW
          </button>
        </div>,
        element
      )}
    </>
  );
}
```

Remarks:

* `DeckGL` renders its children with deck.gl's renderer, which only accepts deck.gl elements, so render the portal beside `DeckGL`. A portal inside `DeckGL` throws. A portal beside it is part of your application's React tree, so the UI can read its state and context.
* The component builds a new widget on every render. deck.gl keeps the first widget with each `id` and passes it the new props, so the widget passed to `onAttach` is the one deck.gl runs. Call its methods, and give the component an `id`.
* Widget containers have `pointer-events: none` so they do not block interaction with the map. Interactive elements must set `pointer-events: auto`.

To attach the widget to one view of several, set its [`viewId`](../../api-reference/core/widget.md#viewid). Nesting the component inside a view component does not attach it to that view.

```tsx
<DeckGL views={[new MapView({id: 'main'}), new MapView({id: 'minimap', ...})]}>
  <RotateWidget id="rotate" viewId="minimap" element={element} onAttach={setWidget} />
</DeckGL>
```

#### Reading Widget State in React

Widget lifecycle methods run outside React. To reflect deck.gl state in your JSX, mirror it into React state from the widget's callbacks:

```tsx
const [bearing, setBearing] = useState(0);

<>
  <DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
    <RotateWidget
      id="rotate"
      element={element}
      onAttach={setWidget}
      onRotate={params => setBearing(params.bearing)}
    />
  </DeckGL>
  {createPortal(<div className="deck-widget">Bearing: {bearing.toFixed(0)}°</div>, element)}
</>;
```

For state that changes every frame (for example the current zoom), subclass the widget and override `onViewportChange` to call a setter passed through props, and throttle updates as needed.

### Styling Your React Component

#### Adding Inline Styles

Pass inline styles to the root element you render into the portal, exactly as you would to a universal widget's `style` prop:

```tsx
createPortal(<div className="deck-widget" style={{backgroundColor: 'blue', color: 'white'}}>...</div>, element);
```

#### Adding CSS Classes

Alternatively, add a `className` to your root element along with styles in your stylesheet.

```tsx
import './style.css';

createPortal(<div className="deck-widget custom-rotate-widget">...</div>, element);
```

```css
/* style.css */
.custom-rotate-widget {
  padding: 10px;
  background-color: #333;
  color: white;
}
```

#### Applying the deck.gl Widget Design System

deck.gl ships a widget stylesheet that the built-in widgets rely on. You can reuse its classes and CSS variables so your widget matches the built-in ones and follows the application's theme. See [Styling Widgets](../../api-reference/widgets/styling.md) for the full list of variables.

```tsx
import '@deck.gl/widgets/stylesheet.css';

createPortal(
  // The widget supplies its own root, so add its class name here for CSS targeting
  <div className="deck-widget deck-widget-rotate">
    <div className="deck-widget-button-group horizontal">
      <div className="deck-widget-button">
        <button type="button" className="deck-widget-icon-button" aria-label="Rotate counter-clockwise" onClick={() => widget?.rotate(-90)}>
          ↺
        </button>
      </div>
      <div className="deck-widget-button">
        <button type="button" className="deck-widget-icon-button" aria-label="Rotate clockwise" onClick={() => widget?.rotate(90)}>
          ↻
        </button>
      </div>
    </div>
  </div>,
  element
);
```

```css
/* style.css */
.deck-widget-rotate {
  --button-size: 36px;
}
```

To show themed tooltips on your buttons, apply the `deck-widget-tooltip` class to your tooltip element, see [Widget Tooltips](../../api-reference/widgets/tooltips.md#writing-tooltips-in-custom-widgets).
