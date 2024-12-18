# React Widgets

React widgets are a powerful way to integrate custom UI elements into deck.gl applications using the [React](https://react.dev/) framework. This guide will walk you through the process of building React-based widgets and best practices.

We recommend users writing their own React widgets be familiar with implementing the `Widget` interface, consider reviewing the [Universal Widgets](./universal-widgets.md) guide.

## Why Use React Widgets?

React widgets leverage the strengths of React’s component model, allowing:
 - **Easy Composition:** Reuse and combine components within the React ecosystem.
 - **React Lifecycle Integration:** Utilize React’s lifecycle hooks to manage state and updates.
 - **Declarative UI:** Define your UI in a predictable and straightforward manner using JSX.

React widgets are most suitable when you are working on React applications and do not intend to distribute your widget outside of your application.

## Writing a React Widget

### Prerequisites

Ensure your deck.gl project includes the `@deck.gl/react` package to utilize React-specific utilities, such as the [`useWidget`](../../api-reference/react/use-widget.md) hook. 

Install the package if it’s not already included:

```sh
npm install @deck.gl/react
```

### Example: Creating a React Widget

Below is a step-by-step example of implementing a simple React widget.

#### Define Your Widget Class

Start by creating the core widget class, which must implement the [Widget](../../api-reference/core/widget.md) interface.

```ts
import type { Widget, WidgetPlacement } from '@deck.gl/core';
import { useWidget } from '@deck.gl/react';
import React, { useRef, RefObject } from 'react';

interface RotateWidgetProps {
    id?: string
    placement?: WidgetPlacement
    ref: RefObject<HTMLDivElement>
}

class RotateWidget {
  constructor(props: BearingWidgetProps) {
    this.id = props.id || 'bearing-widget';
    this.placement = props.placement || 'top-right';
    this.props = props;
    this.viewports = {};
  }

  onAdd({ deck }) {
    this.deck = deck;
    return this.props.ref.current;
  }

  onViewportChange(viewport) {
    this.viewports[viewport.id] = viewport;
  }

  handleRotate(viewport, bearingDelta) {
    const nextBearing = viewport.bearing + bearingDelta;
    const viewState = {
      ...viewport,
      bearing: nextBearing
    };
    this.deck.setProps({ viewState });
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
export const RotateReactWidget = (props: RotateWidgetProps) => {
  const ref = useRef();
  const widget = useWidget(RotateWidget, { ref, ...props });

  return (
    <div ref={ref} style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
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

#### Styling Your React Widget

##### Adding Inline Styles

Add the `style` prop in your React component for inline styling overrides.

```tsx
export const RotateReactWidget = (props: RotateWidgetProps) => {
  ...
  return <div style={{...props.style}}>...</div>
}
```

```tsx
<RotateReactWidget style={{ backgroundColor: 'blue', color: 'white' }} />
```

##### Adding CSS Classes

Add `className` to your React component and styles to your stylesheet.

```tsx
import 'style.css';

export const RotateReactWidget = (props: RotateWidgetProps) => {
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

Reuse the built-in deck.gl widget [stylesheet](https://unpkg.com/deck.gl@latest/dist/stylesheet.css) by importing them into your application. This can be useful if you're already theming deck.gl widgets and want to reuse CSS styles and variables. See [Widget Overview](../../api-reference/widgets/overview.md#custom-class-theming) for a full list of built-in variables.

```tsx
import '@deck.gl/widgets/stylesheet.css';
import 'style.css';

export const RotateReactWidget = (props: RotateWidgetProps) => {
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
