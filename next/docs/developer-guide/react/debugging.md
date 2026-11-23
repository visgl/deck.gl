# Debugging

`@deck.gl/react` sits between React and deck.gl. When something looks wrong, first find out which side of that boundary it comes from:

* **The React side.** What the renderer received from your components and sent to deck.gl.
* **The deck.gl side.** What deck.gl did with it: which layers it created, updated, kept or removed.

## Logs[​](#logs "Direct link to Logs")

The renderer and deck.gl write to the same deck.gl `log`. Turn it on in the browser console:

```
deck.log.enable();

deck.log.level = 3;
```

At level 3, the renderer logs:

* `DeckGL root created` and `DeckGL root unmounted` when a root mounts and unmounts;
* `DeckGL commit` for each React commit, with the `layers`, `views` and `widgets` it sends to deck.gl.

At level 4, it also logs `DeckGL configure` with the props of every configure, including updates where only props such as `layers` change.

At the same levels, deck.gl logs its side:

| Level | deck.gl messages                                                                           | What they tell you                              |
| ----- | ------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 1     | `Initializing ScatterplotLayer({id: 'points'})`, `Finalizing ...`                          | A layer was created or removed                  |
| 2     | `Updating ScatterplotLayer({id: 'points'}) because: dataChanged`, `Updating 3 deck layers` | A layer was updated, and which change caused it |
| 4     | `Matched ScatterplotLayer({id: 'points'}), state transfered`, `... does not need update`   | A layer was matched with the previous render    |

deck.gl's lifecycle messages are only in development builds. To get them in a production build, see deck.gl's [Debugging](https://deck.gl/next/docs/developer-guide/debugging.md) page, which also covers GPU-level debugging with luma.gl.

The `debug` prop on `DeckGL` is passed to deck.gl unchanged. It does not turn on the renderer's logs.

## Layers that rebuild on every render[​](#layers-that-rebuild-on-every-render "Direct link to Layers that rebuild on every render")

If `Initializing` and `Finalizing` appear for the same layer on every render, deck.gl can't match it with its previous version. Usually the layer's `id` changes between renders. deck.gl matches layers by `id`, so a changing one rebuilds the layer and its GPU resources every time.

A layer without an `id` gets one from its place in the React tree. In a list without keys, inserting or removing an item moves those ids, so the layers rebuild or take over each other's state. Outside production builds, the renderer warns `Two layers share the id ...` when two layers reach deck.gl with one id, naming both, and deck.gl warns `Multiple new layers with same id`. See [Ids](https://deck.gl/next/docs/api-reference/react/components.md#ids).

## React DevTools[​](#react-devtools "Direct link to React DevTools")

The renderer registers with [React DevTools](https://react.dev/learn/react-developer-tools). In the Components tab, the tree inside each `DeckGL` root shows every `<deckLayer>`, `<deckView>`, `<deckWidget>` and `<deckEffect>` element, with its props and the components that render it. Use it to check which component produced a layer, and which props it had when it was rendered.

## Errors[​](#errors "Direct link to Errors")

An error thrown while rendering inside `DeckGL` is rethrown from the `DeckGL` component. The nearest error boundary around `DeckGL` handles it, and the framework's development error overlay shows it. This includes errors the renderer raises itself, for example when `<deckLayer>` receives something other than a deck.gl `Layer`.

An error boundary placed inside `DeckGL` catches errors from its own children first. Its fallback can only render native elements or `null`.

Errors that deck.gl raises at runtime take a different path. A layer whose data fails to load, an async prop that rejects, or a lost WebGL context goes to deck.gl's `onError` prop, and deck.gl keeps rendering the other layers. These errors never reach an error boundary. Pass `onError` to `DeckGL` to report them or to show them to users; by default deck.gl only logs them.

```
<DeckGL onError={(error, layer) => reportError(error, {layer: layer?.id})}>{/* ... */}</DeckGL>
```

So an app that wants to catch every error needs both: an error boundary around `DeckGL` for errors from the React tree, and `onError` for errors from deck.gl. This matches `@deck.gl/react/legacy`, where `onError` also carries only deck.gl's errors.
