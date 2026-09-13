# React Widgets

Rendering widget UI with [React](https://react.dev/) lets you build deck.gl widgets with the same components, hooks and state management as the rest of a React application. This guide walks through rendering widget UI with React using the [`useWidget`](../../api-reference/react/use-widget.md) hook and a portal.

We recommend that users writing their own widgets be familiar with the `Widget` base class. Consider reviewing the [Universal Widgets](./universal-widgets.md) guide first.

## Two Ways to Use React with Widgets

There are two distinct patterns, and it is important to pick the right one:

1. **Wrap a universal widget in a React component.** The widget renders its own UI (with DOM APIs or [Preact](./preact-widgets.md)); React only manages its lifecycle and props. This is how the widgets exported from `@deck.gl/react` are implemented, and it is a two-line component:

   ```tsx
   import {useWidget} from '@deck.gl/react';
   import {ZoomWidget as _ZoomWidget, type ZoomWidgetProps} from '@deck.gl/widgets';

   export const ZoomWidget = (props: ZoomWidgetProps = {}) => {
     useWidget(_ZoomWidget, props);
     return null;
   };
   ```

   Use this whenever the widget already exists or should also work outside React.

2. **Render the widget's UI with React.** The widget class hooks into deck.gl and hands its root element to React, which renders into it via a portal. This is the subject of the rest of this guide. It is most suitable when you are working on a React application and do not intend to distribute the widget outside of it.

## Why Render Widget UI with React?

Widget UI implemented with React leverages the strengths of React's component model, allowing:
 - **Easy Composition:** Reuse your application's component library and design system inside the widget.
 - **Shared State:** Read application state from React context or a store directly in the widget UI.
 - **Declarative UI:** Define your UI in a predictable and straightforward manner using JSX.

## Writing a React Widget

### Prerequisites

Ensure your deck.gl project includes the `@deck.gl/react` package to utilize React-specific utilities, such as the [`useWidget`](../../api-reference/react/use-widget.md) hook.

Install the package if it's not already included:

```sh
npm install @deck.gl/react
```

### Example: Creating a Widget UI with React

Below is a step-by-step example of a widget that rotates the map with two buttons.

#### Define Your Widget Class

Start by creating the widget class, which must extend the [`Widget`](../../api-reference/core/widget.md) base class. The class is responsible for everything that touches deck.gl: view state, events, and lifecycle. It receives the element React will render into as a prop and returns it from `onAdd`.

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
};

/** Props only used by the React component, not exposed to applications */
type RotateWidgetInternalProps = RotateWidgetProps & {
  element: HTMLDivElement;
};

export class RotateWidget extends Widget<RotateWidgetInternalProps> {
  static defaultProps: Required<RotateWidgetInternalProps> = {
    ...Widget.defaultProps,
    id: 'rotate',
    placement: 'top-right',
    viewId: null,
    step: 90,
    onRotate: () => {},
    element: undefined!
  };

  className = 'deck-widget-rotate';
  placement: WidgetPlacement = 'top-right';

  constructor(props: RotateWidgetInternalProps) {
    super(props);
    this.setProps(this.props);
  }

  setProps(props: Partial<RotateWidgetInternalProps>) {
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    super.setProps(props);
  }

  onAdd() {
    // Hand deck.gl the element that React renders into
    return this.props.element;
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

#### Create a React Component

Wrap the widget class in a React component using the [`useWidget`](../../api-reference/react/use-widget.md) hook. The hook creates the widget instance once, adds it to the `DeckGL` parent, calls `setProps` on every render, and removes it on unmount. Render your UI into the element with a [portal](https://react.dev/reference/react-dom/createPortal):

```tsx
import React, {useMemo} from 'react';
import {createPortal} from 'react-dom';
import {useWidget} from '@deck.gl/react';
import {RotateWidget, type RotateWidgetProps} from './rotate-widget';

export const Rotate = (props: RotateWidgetProps = {}) => {
  const element = useMemo(() => document.createElement('div'), []);
  const widget = useWidget(RotateWidget, {...props, element});

  return createPortal(
    <div className={`deck-widget ${props.className ?? ''}`} style={props.style as React.CSSProperties}>
      <button type="button" style={{pointerEvents: 'auto'}} onClick={() => widget.rotate(-(props.step ?? 90))}>
        Rotate CCW
      </button>
      <button type="button" style={{pointerEvents: 'auto'}} onClick={() => widget.rotate(props.step ?? 90)}>
        Rotate CW
      </button>
    </div>,
    element
  );
};
```

Remarks:

* Widget containers have `pointer-events: none` so they do not block interaction with the map. Interactive elements must set `pointer-events: auto`.
* The component's props are typed with the same `RotateWidgetProps` the widget class exposes, so `<Rotate step={45} />` is type checked.
* `useWidget` returns the widget instance, so event handlers in your JSX can call its methods directly.

#### Mount the Component as a Deck Child

The [`<DeckGL/>`](../../api-reference/react/deckgl.md) component must be an ancestor of any component that calls `useWidget`. It provides the context that `useWidget` uses to register the widget.

```tsx
<DeckGL initialViewState={INITIAL_VIEW_STATE} controller>
  <Rotate />
</DeckGL>
```

> Note: A widget component cannot be nested inside a [JSX view](../../get-started/using-with-react.md#using-jsx-layers-views-and-widgets) such as `<MapView>`; widgets registered there are ignored. Place the widget component directly under `<DeckGL>` and set its [`viewId`](../../api-reference/core/widget.md#viewid) prop instead.

```tsx
<DeckGL views={[new MapView({id: 'main'}), new MapView({id: 'minimap', ...})]}>
  <MapView id="minimap">
    <ScatterplotLayer ... />
  </MapView>
  <Rotate viewId="minimap" />
</DeckGL>
```

> Note: When any React widget is in use, the `widgets` prop of `<DeckGL>` is ignored. Wrap universal widgets with `useWidget` (or use the components exported from `@deck.gl/react`) instead of mixing the two.

#### Reading Widget State in React

Widget lifecycle methods run outside React. To reflect deck.gl state in your JSX, mirror it into React state from the widget's callbacks:

```tsx
import React, {useMemo, useState} from 'react';

export const Rotate = (props: RotateWidgetProps = {}) => {
  const [bearing, setBearing] = useState(0);
  const element = useMemo(() => document.createElement('div'), []);
  const widget = useWidget(RotateWidget, {
    ...props,
    element,
    onRotate: params => {
      setBearing(params.bearing);
      props.onRotate?.(params);
    }
  });

  return createPortal(<div className="deck-widget">Bearing: {bearing.toFixed(0)}°</div>, element);
};
```

For state that changes every frame (for example the current zoom), subclass the widget and override `onViewportChange` to call a setter passed through props, and throttle updates as needed.

### Styling Your React Component

#### Adding Inline Styles

Forward the standard `style` prop to your root element so applications can pass inline overrides, exactly as they would to a universal widget:

```tsx
<Rotate style={{backgroundColor: 'blue', color: 'white'}} />
```

#### Adding CSS Classes

Alternatively, add a `className` to your root element along with styles in your stylesheet.

```tsx
import './style.css';

export const Rotate = (props: RotateWidgetProps) => {
  ...
  return createPortal(<div className="deck-widget custom-rotate-widget">...</div>, element);
};
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

export const Rotate = (props: RotateWidgetProps = {}) => {
  const element = useMemo(() => document.createElement('div'), []);
  const widget = useWidget(RotateWidget, {...props, element});
  return createPortal(
    <div className="deck-widget">
      <div className="deck-widget-button-group horizontal">
        <div className="deck-widget-button">
          <button type="button" className="deck-widget-icon-button" aria-label="Rotate counter-clockwise" onClick={() => widget.rotate(-90)}>
            ↺
          </button>
        </div>
        <div className="deck-widget-button">
          <button type="button" className="deck-widget-icon-button" aria-label="Rotate clockwise" onClick={() => widget.rotate(90)}>
            ↻
          </button>
        </div>
      </div>
    </div>,
    element
  );
};
```

```css
/* style.css */
.deck-widget-rotate {
  --button-size: 36px;
}
```

To show themed tooltips on your buttons, apply the `deck-widget-tooltip` class to your tooltip element, see [Widget Tooltips](../../api-reference/widgets/tooltips.md#writing-tooltips-in-custom-widgets).
