# Wrapping Widgets with React Components

Wrapping widgets in React components is a powerful way to render custom UI elements in deck.gl applications using the [React](https://react.dev/) UI framework. This guide will walk you through the process of rendering widget UI with React and best practices.

We recommend users writing their own widgets be familiar with implementing the `Widget` interface, consider reviewing the [Universal Widgets](./universal-widgets.md) guide.

## Why Use React with Widgets?

Widget UI implemented with React leverage the strengths of React’s component model, allowing:
 - **Easy Composition:** Reuse and combine components within the React ecosystem.
 - **React Lifecycle Integration:** Utilize React’s lifecycle hooks to manage state and updates.
 - **Declarative UI:** Define your UI in a predictable and straightforward manner using JSX.

Using React to render the UI for widgets is most suitable when you are working on React applications and do not intend to distribute your widget outside of your application.

## Writing a React Widget

### Prerequisites

Ensure your deck.gl project includes the `@deck.gl/react` package to utilize React-specific utilities, such as the [`useWidget`](../../api-reference/react/use-widget.md) hook. 

Install the package if it’s not already included:

```sh
npm install @deck.gl/react
```

### Example: Creating a Widget UI with React

Below is a step-by-step example of implementing a simple widget UI with React.

#### Define Your Widget Class

Start by creating the core widget class, which must implement the [Widget](../../api-reference/core/widget.md) interface.

```ts
import { WebMercatorViewport } from '@deck.gl/core';
import type { Widget, WidgetPlacement, Viewport } from '@deck.gl/core';
import DeckGL, { useWidget } from '@deck.gl/react';
import React, { useRef, RefObject } from 'react';

type RotateWidgetProps = {
  id?: string;
  placement?: WidgetPlacement;
  viewId?: string | null;
  ref: RefObject<HTMLDivElement>;
};

class RotateWidget implements Widget<RotateWidgetProps> {
  id = 'rotate-widget';
  props: RotateWidgetProps;
  placement: WidgetPlacement = 'top-right';
  viewId?: string | null = null;
  viewports: {[id: string]: WebMercatorViewport} = {};
  deck?: Deck<any>;

  constructor(props: RotateWidgetProps) {
    this.id = props.id ?? this.id;
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    this.props = {...props};
  }

  onAdd({deck}) {
    this.deck = deck;
    return this.props.ref.current;
  }

  setProps(props: Partial<RotateWidgetProps>) {
    // Handle when props change here.
    this.placement = props.placement ?? this.placement;
    this.viewId = props.viewId ?? this.viewId;
    Object.assign(this.props, props);
  }

  onViewportChange(viewport: Viewport) {
    if (viewport instanceof WebMercatorViewport) {
      this.viewports[viewport.id] = viewport;
    }
  }

  handleRotate(viewport: WebMercatorViewport, bearingDelta: number) {
    const nextBearing = viewport.bearing + bearingDelta;
    const initialViewState = {
      ...viewport,
      bearing: nextBearing
    };
    this.deck?.setProps({initialViewState});
  }

  handleCWRotate() {
    Object.values(this.viewports).forEach(viewport => this.handleRotate(viewport, 90));
  }

  handleCCWRotate() {
    Object.values(this.viewports).forEach(viewport => this.handleRotate(viewport, -90));
  }
}
```

#### Create a React Component

Wrap the widget class in a React component using the [`useWidget`](../../api-reference/react/use-widget.md) hook.

```tsx
const Rotate = (props: RotateWidgetProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useWidget(RotateWidget, { ...props, ref });

  return (
    <div ref={ref} style={{ padding: '10px', backgroundColor: '#f0f0f0', pointerEvents: 'auto' }}>
      <button onClick={() => widget.handleCCWRotate()} style={{ marginRight: '5px' }}>
        Rotate CCW
      </button>
      <button onClick={() => widget.handleCWRotate()}>
        Rotate CW
      </button>
    </div>
  );
};
```

This widget controls the bearing of the view its attached to.

#### Mount the Component as a Deck Child

The `<DeckGL/>` component needs to be the root component of any react components wrapping a widget in order to provide a context and render the component within deck's view system.

```tsx
<DeckGL>
  <Rotate/>
</DeckGL>
```

> Note: Currently, a widget component cannot be nested within a [JSX view](../../get-started/using-with-react.md#using-jsx-layers-and-views). Instead,set a [`viewId`](../../api-reference/core/widget.md#viewid) on the widget.

```jsx
<DeckGL>
  <MapView id='minimap'>
    <ScatterplotLayer/>
  </MapView>
  <Rotate viewId='minimap'/>
</DeckGL>
```

#### Styling Your React Component

##### Adding Inline Styles

A typical `style` prop in your React component could be used for inline styling overrides.

```tsx
export const Rotate = (props: RotateWidgetProps & {style: CSSProperties}) => {
  ...
  return <div style={{...props.style}}>...</div>
}
```

```tsx
<Rotate style={{ backgroundColor: 'blue', color: 'white' }} />
```

##### Adding CSS Classes

Alternatively, you could add a `className` to your React component along with styles to your stylesheet.

```tsx
import 'style.css';

export const Rotate = (props: RotateWidgetProps) => {
  ...
  return <div className="custom-rotate-widget">...</div>
}
```

```css
/* style.css */
.custom-rotate-widget {
  padding: 10px;
  background-color: #333;
  color: white;
}
```

##### Applying the deck.gl widget design system

Deck.gl ships a widget stylesheet as well. You can use this built-in [stylesheet](https://unpkg.com/deck.gl@latest/dist/stylesheet.css) by importing them into your application. This can be useful if you're already theming deck.gl widgets and want to reuse CSS styles and variables. See [Widget Overview](../../api-reference/widgets/overview.md#custom-class-theming) for a full list of built-in variables.

```tsx
import '@deck.gl/widgets/stylesheet.css';
import 'style.css';

export const Rotate = (props: RotateWidgetProps) => {
  const ref = useRef();
  const widget = useWidget(RotateWidget, { ref, ...props });
  return (
    <div ref={ref} className="deck-widget">
      <div className="deck-widget-button">
        <button className="deck-widget-icon-button">
          ...
        </button>
      </div>
    </div>
  )
}
```

```css
/* style.css */
.deck-widget {
    --button-corner-radius: 4px;
}
```
