import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {GimbalWidget} from '@deck.gl/widgets';

# GimbalWidget

Visualizes the orientation of an `OrbitView` using nested circles. Clicking resets `rotationOrbit` and `rotationX` to `0`.

<WidgetPreview cls={GimbalWidget}/>

```ts
import {GimbalWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

const deck = new Deck({
  widgets: [new GimbalWidget()]
});
```

## Props

- `id`: `'gimbal'`
- `label`: `'Gimbal'`
- `transitionDuration`: `200`

## Styles

| Name | Default |
| ---- | ------- |
| `--icon-gimbal-outer-color` | `rgb(68, 92, 204)` |
| `--icon-gimbal-inner-color` | `rgb(240, 92, 68)` |

