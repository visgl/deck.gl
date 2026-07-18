# Is there a way to disable on hover events

- Discussion: https://github.com/visgl/deck.gl/discussions/9898
- **Recommended action:** DRAFT NEW (the existing `pickable: false` reply is correct but doesn't address the "keep click, drop hover" ask; the asker's follow-up is valid)

## Question

Hovering over the map (without clicking) drives high CPU usage when many objects
are rendered. The asker wants to **disable hover-triggered work while keeping
click** — `pickable: false` disables both, which isn't what they want.

## Draft answer

Short version: in current deck.gl there isn't a separate "hover picking" switch —
hover and click picking are both gated by the single [`pickable`](https://deck.gl/docs/api-reference/core/layer#pickable)
prop, so you can't keep one without the other. What you're seeing is almost
certainly the picking-performance regression that landed in 9.2 (which @ibgreen
mentioned above), not an inherent cost of hover.

How picking actually runs: every pointer move over the canvas schedules one
picking pass that is executed on the next animation frame — this happens for any
`pickable` layer regardless of whether you've attached an `onHover`/`getTooltip`
handler or `autoHighlight`. So removing the hover handler won't remove the pass;
the lever is `pickable` itself.

What I'd recommend:

1. **Upgrade to v9.4.** Picking was reworked specifically to reduce this cost —
   from the [release notes](https://deck.gl/docs/whats-new): *"Picking has been
   optimized. Most layers now use shader builtins (`instance_index`) instead of
   picking color buffers, reducing GPU memory usage and layer initialization
   costs."* This directly targets the regression you're hitting.
2. **Keep `pickingRadius` at its default of `0`.** A non-zero radius makes each
   hover pass read a larger block of pixels. See [`pickingRadius`](https://deck.gl/docs/api-reference/core/deck#pickingradius).
3. If hover is genuinely never needed and cost is still too high, the only
   current lever is `pickable: false`. Note that even manual click picking via
   [`deck.pickObject()`](https://deck.gl/docs/api-reference/core/deck#pickobject)
   requires the layer to be `pickable: true`, so there's no way today to get
   click-only picking without the per-move hover pass.

```js
new Deck({
  // Smallest possible per-move pick cost
  pickingRadius: 0,
  layers: [
    new ScatterplotLayer({
      data,
      pickable: true,        // enables BOTH hover and click picking
      onClick: info => console.log(info.object)
      // no onHover / autoHighlight — but a pick pass still runs on pointer move
    })
  ]
});
```

Relevant docs: [Interactivity / Picking](https://deck.gl/docs/developer-guide/interactivity),
[`Deck` picking props](https://deck.gl/docs/api-reference/core/deck).

## Notes for reviewer

- **Confidence: medium-high on the mechanism, medium on the recommendation.**
  Verified in `modules/core/src/lib/deck.ts`: `_onPointerMove` sets
  `_pickRequest.event` on every move; `_onRenderFrame` → `_pickAndCallback()`
  runs the pick each frame when an event is queued, gated only by
  `_getInternalPickingMode()` (sync/async), **not** by the presence of hover
  handlers. So the common "just remove `onHover`" advice is inaccurate for v9.
- Existing thread: @ibgreen suggested `pickable: false` and flagged the 9.2
  picking regression — this draft builds on both rather than contradicting them.
- If the team considers a dedicated "hover picking disabled" prop worth having,
  this thread is a good candidate to link from a feature request.
