# Debugging

React Fiber sits between React and deck.gl. When something looks wrong, first find out which side of that boundary it comes from:

- **The React side.** What the renderer received from your components and sent to deck.gl.
- **The deck.gl side.** What deck.gl did with it: which layers it created, updated, kept or removed.

## Logs

React Fiber and deck.gl write to the same deck.gl `log`. Turn it on in the browser console:

```js
deck.log.enable();
deck.log.level = 3;
```

At level 3, the renderer logs:

- `DeckGL root created` and `DeckGL root unmounted` when a root mounts and unmounts;
- `DeckGL commit` for each React commit, with the `layers`, `views` and `widgets` it sends to deck.gl.

At level 4, it also logs `DeckGL configure` with the props of every configure, including updates where only props such as `layers` change.

At the same levels, deck.gl logs its side:

| Level | deck.gl messages | What they tell you |
| --- | --- | --- |
| 1 | `Initializing ScatterplotLayer({id: 'points'})`, `Finalizing ...` | A layer was created or removed |
| 2 | `Updating ScatterplotLayer({id: 'points'}) because: dataChanged`, `Updating 3 deck layers` | A layer was updated, and which change caused it |
| 4 | `Matched ScatterplotLayer({id: 'points'}), state transfered`, `... does not need update` | A layer was matched with the previous render |

deck.gl's lifecycle messages are only in development builds. To get them in a production build, see deck.gl's [Debugging](https://deck.gl/docs/developer-guide/debugging) page, which also covers GPU-level debugging with luma.gl.

The `debug` prop on `DeckGL` is passed to deck.gl unchanged. It does not turn on React Fiber's logs.

## Layers that rebuild on every render

If `Initializing` and `Finalizing` appear for the same layer on every render, deck.gl can't match it with its previous version. Usually the layer has no stable `id`. deck.gl matches layers by `id`, so a missing or changing one rebuilds the layer and its GPU resources every time.

Outside production builds, React Fiber warns `ScatterplotLayer needs a stable id` when a layer or view keeps deck.gl's default id. deck.gl warns `Multiple new layers with same id` when two layers share one. See [Native elements](../api-reference/native-elements.md).

## React DevTools

The renderer registers with [React DevTools](https://react.dev/learn/react-developer-tools). In the Components tab, the tree inside each `DeckGL` root shows every `<deckLayer>`, `<deckView>`, `<deckWidget>` and `<deckEffect>` element, with its props and the components that render it. Use it to check which component produced a layer, and which props it had when it was rendered.

## Errors

An error thrown while rendering inside `DeckGL` is rethrown from the `DeckGL` component. The nearest error boundary around `DeckGL` handles it, and the framework's development error overlay shows it. This includes errors the renderer raises itself, for example when `<deckLayer>` receives something other than a deck.gl `Layer`.

An error boundary placed inside `DeckGL` catches errors from its own children first. Its fallback can only render native elements or `null`.

Errors that deck.gl raises at runtime take a different path. A layer whose data fails to load, an async prop that rejects, or a lost WebGL context goes to deck.gl's `onError` prop, and deck.gl keeps rendering the other layers. These errors never reach an error boundary. Pass `onError` to `DeckGL` to report them or to show them to users; by default deck.gl only logs them.

```tsx
<DeckGL onError={(error, layer) => reportError(error, {layer: layer?.id})}>{/* ... */}</DeckGL>
```

So an app that wants to catch every error needs both: an error boundary around `DeckGL` for errors from the React tree, and `onError` for errors from deck.gl. This matches `@deck.gl/react`, where `onError` also carries only deck.gl's errors.
