# useWidget

The `useWidget` hook is used to create React wrappers for custom deck.gl widgets.

```tsx
import DeckGL, {useControl} from '@deck.gl/react';
import {CompassWidget as VanillaCompassWidget, CompassWidgetProps} from '@deck.gl/widgets';

export const CompassWidget = (props: CompassWidgetProps = {}) => {
  const widget = useWidget(VanillaCompassWidget, props);
  return null;
};

<DeckGL>
  <CompassWidget/>
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
