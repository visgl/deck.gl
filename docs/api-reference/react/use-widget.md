# useWidget

The `useWidget` hook is used to create React wrappers for normal (non-React) deck.gl widgets, or to create custom widgets with UI rendered by React.

## Usage

```tsx
// React wrapper usage
import DeckGL, {useWidget} from '@deck.gl/react';
import {CompassWidget, type CompassWidgetProps} from '@deck.gl/react';

const ReactWrappedCompass = (props: CompassWidgetProps) => {
  const widget = useWidget(CompassWidget, props);
  return null;
}

<DeckGL>
  <ReactWrappedCompass/>
</DeckGL>
```

For a custom widget, React can be used to implement the UI itself. A widget class is used to hook into updates, and a React [`ref`](https://react.dev/reference/react/useRef) is utilized to layout the widget UI along-side other widgets.

```tsx
import type {Widget} from '@deck.gl/core';
import DeckGL, {useWidget} from '@deck.gl/react';

class MyWidget implements Widget {
  constructor(props) {
    this.props = { ...props };
  }

  onAdd() {
    return this.props.ref.current;
  }
}

const MyReactWidget = (props) => {
  const ref = useRef();
  const widget = useWidget(MyWidget, {...props, ref});
  return <div ref={ref}>Hello World</div>;
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

[modules/react/src/utils/use-widget.ts](https://github.com/visgl/deck.gl/blob/master/modules/react/src/utils/use-widget.ts)
