# useWidget

The `useWidget` hook is used to create React wrappers for normal (non-React) deck.gl widgets, or to create custom widgets with UI rendered by React.

## Usage

```tsx
// React wrapper usage
import DeckGL, {useWidget} from '@deck.gl/react';
import {CompassWidget as UniversalCompassWidget, type CompassWidgetProps} from '@deck.gl/react';

const CompassWidget = (props: CompassWidgetProps) => {
  const widget = useWidget(UniversalCompassWidget, props);
  return null;
}

<DeckGL>
  <CompassWidget/>
</DeckGL>
```

For a custom widget, React can be used to implement the UI itself. A widget class is used to hook into deck.gl apis, and a React [`portal`](https://react.dev/reference/react-dom/createPortal) is utilized to render the widget UI along-side other widgets.

```tsx
import React, {useMemo} from 'react';
import type {Widget} from '@deck.gl/core';
import DeckGL, {useWidget} from '@deck.gl/react';
import {createPortal} from 'react-dom';

class MyWidget implements Widget {
  constructor(props) {
    this.props = { ...props };
  }

  onAdd() {
    return this.props.element; // HTMLDivElement
  }
}

const MyReactWidget = (props) => {
  const element = useMemo(() => document.createElement('div'), []);
  const widget = useWidget(MyWidget, {...props, element});
  return createPortal(
    <div>Hello World</div>,
    element
  );
};

<DeckGL>
  <MyReactWidget/>
</DeckGL>
```

See a full example [here](../../developer-guide/custom-widgets/react-widgets.md).

## Signature

```tsx
useWidget<T extends Widget, PropsT extends {}>(
  WidgetClass: {new (props: PropsT): T},
  props: PropsT
): T
```

The hook creates an [`Widget`](../core/widget.md) instance, adds it to deck.gl, and removes it upon unmount.

Parameters:

 - `WidgetClass`: `{new (props: PropsT): T}` - called to create an instance of the control.
 - `props`: `PropsT` - props passed into the widget constructor on creation and `widget.setProps` on render.

Returns:

[`Widget`](../core/widget.md) - the widget instance of `WidgetClass`.

## Source

[modules/react/src/utils/use-widget.ts](https://github.com/visgl/deck.gl/tree/9.1-release/modules/react/src/utils/use-widget.ts)
