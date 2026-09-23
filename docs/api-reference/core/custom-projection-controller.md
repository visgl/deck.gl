# CustomProjectionController (Experimental)

`CustomProjectionController` is the default controller for [CustomProjectionView](./custom-projection-view.md). It extends [Controller](./controller.md), using map-style gestures over a common-space ground plane.

This API is experimental and may change. Import it as `_CustomProjectionController` from `@deck.gl/core` or `deck.gl`.

## Usage

```js
import {
  _CustomProjectionView as CustomProjectionView,
  _CustomProjectionController as CustomProjectionController
} from '@deck.gl/core';

const view = new CustomProjectionView({
  projection: {forward: p => p.slice(), inverse: p => p.slice()},
  outputBounds: [-180, -90, 180, 90],
  controller: {
    type: CustomProjectionController, // Also selected by controller: true
    maxBounds: null,
    inertia: true
  }
});
```

## Options

Uses the shared [Controller options](./controller.md#options), including input toggles, `inertia`, `zoomAround`, and keyboard settings. Its default drag mode is `'pan'`.

- Drag to pan. Shift-drag or right-button drag changes pitch and bearing.
- Scroll, pinch and double-click to zoom; multi-touch gestures follow the shared controller settings.
- Arrow keys pan; +/- zoom. Modified arrow keys rotate according to the shared keyboard settings.
- `zoomAround` defaults to `'pointer'`. Set it to `'center'` to preserve the camera center when zooming.
- `maxBounds` defaults to `[[0, 0], [512, 512]]` in **common coordinates**, not longitude/latitude. Set it to `null` to disable bounds.
- `maxBoundsPadding` reserves space inside the viewport when fitting bounds, using the shared pixel/percentage padding format.

Navigation uses the [CustomProjectionView state](./custom-projection-view.md#view-state): `target`, `zoom`, `pitch` and `bearing`, along with their limits. Pitch is constrained to 0–85 degrees and bearing is normalized to `[-180, 180)`. The default discrete transition linearly interpolates these four properties over 300 ms, taking the shortest bearing path.

## Navigation and Bounds

Pan and zoom anchors are computed on the common-space plane Z `0`. The controller never needs `projection.inverse`, so navigation remains usable outside the inverse domain. The target's Z component is always reset to zero.

Bounds constrain the target and impose a minimum zoom to fit the unrotated viewport within the bounds. This fit uses neither pitch nor bearing, so rotation does not move the map merely to satisfy bounds. An explicit `maxZoom` caps the fit zoom. Bounds can prevent a dragged or zoomed anchor from staying exactly under the pointer; disable bounds when unrestricted anchoring is required.

## Customization

Extend `_CustomProjectionController` and pass the subclass through `controller: {type: MyController}`. See [Controller methods](./controller.md#methods) for event handling and transition hooks.

## Source

[modules/core/src/controllers/custom-projection-controller.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/controllers/custom-projection-controller.ts)
