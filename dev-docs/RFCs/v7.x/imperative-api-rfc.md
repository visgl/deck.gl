RFC: Improved Support for Imperative Style Programming in deck.gl

Abstract: This RFC proposes small API additions (New `Deck.updateLayers/addLayers/removeLayers` methods and alternate `updateTriggers` semantics) intended to simplify use of the deck.gl API in imperative (non-React) applications.


## Background

### Problem 1: Partially Updating Layers

Having to repeat all layer props (and worse, all layers) when changing one prop can get quite demanding for imperative applications.


```
// First time we set the props
fetch().then(data => {
  data = transformData(data);
  deck.setProps({
    layers: new ScatterplotLayer({
      data,
      getPosition: getPositionBinned
    }),
    ... // Other layers
  });
}

// Now we update the props
button.onClick(() => {
  deck.setProps({
    layers: new ScatterplotLayer({
      getPosition: getPositionByState, // I just want to change the accessor, but
      data // I have to repeat all props I already set, but they are out of scope now :(
    }),
    // Let's not talk about having to repeat all the other layers I might have created :( :(
  }
});
```

Naturally this can be handled e.g. by creating a global `getLayers` function but essentially it forces a "global" state model onto the app which is usually not the way smaller imperative apps are structured (once set, state is owned by components).


### Problem 2: The imperative awkwardness of `updateTriggers`

As the following example shows, having to specify an `updateTrigger` when imperatively saying "I am changing this", just seems excessively verbose and it is not exactly intutive to a new programmer that it would even be needed:

```
// First time we set the props
deck.setProps({
  layers: new ScatterplotLayer({
    data
    getPosition: getPositionBinned
  })
})

// Now we update the props
button.onClick(() => {
  deck.setProps({
    layers: new ScatterplotLayer({
      data
      getPosition: getPositionByState,
      updateTriggers: {
        getPosition: getPositionByState // Duh, I just told you two lines ago...
      }
    })
  })
})
```

Here the `updateTrigger` just seems to duplicate the programmer's intent. He/she would most likely not have explicitly taken the trouble of updating the `getPosition` accessor unless he intended to change the visualization.

The `updateTriggers` mechanism is highly tuned to the React use case, where the application keeps rendering the same props over and over again, and deck.gl needs to carefully balance between correctly detecting when props have changed, without spending excessive CPU cycles constantly doing deep comparisons of props.

In the imperative use case, the very act of setting new props means that something has probably changed. While deck.gl's "diffing" to avoid unnecessary updates in this case could probably be appreciated by an imperative programmer in certain cases, it is likely not something he/she necessarily expects nor would miss if it wasn't there.


## API Design Constraints

* ONE API Principle - See [API Evolution Roadmap](dev-docs/roadmaps/api-evolution-roadmap.md)

* **Layers are Immutable** -  The user would surely like to call `layer.setProps({...})` to partially update a layer but this is not possible in our current API model where layers are immutable descriptors. Instead of exploring the complexities of changing that model, a separate mechanism for updating layers is proposed.


## Proposals

This RFC proposes an `updateTriggers` overload (to set alternate semanatics) and new `Deck` method(s) (to partially update layers).


### Proposal: `Layer.updateTriggers: true`

In this propsal, we add the option of setting `updateTriggers` to `true` (pre-proposal, `updateTriggers` is expected to be an object). This way an imperative application has an easy way to force accessors to be value compared.

In addition, this could be the default behavior when calling `Deck.updateLayers` as that function is only available in imperative programs.


### Deck.updateLayers(layerMap : Object)

Updates specified props in existing layers, without changing any other props. Effectively clones the existing layer, overwriting the specified props.

```
deck.updateLayers({
  'scatterplot': {
    ...newProps
  }
});
```

The `updateLayers` function takes a map with layer id keys, where each value is a map of props to update for that layer.

* UpdateLayers can't remove existing layers

Remarks:

* If no corresponding layer exists, that update key will be ignored (a console warning may be emitted).
* Updating child layers is currently not supported - this will create state inconsistencies and should happen through a common prop forwarding scheme for sublayers (so that the update goes through the top-level layer).
* The applicatin's choice of whether to re-generate all props and layers or just update selected props in a few layers is mainly stylistic (deck.gl's highly optimized layer update engine typically makes the performance difference irrelevant).


### Deck.addLayers(layers)

> deck.updateLayers can't actually add layers...

* `updateLayers` currently only accepts prop objects. We could enable addition of new layers by accepting layer class instances as new layers `id: new ScatterplotLayer(id, ...)` if we found one of these we could just add/overwrite the layer instead of trying to update an existing layer.


### Deck.removeLayers(layerIds)

> If we are adding `addLayers`, we might as well add `removeLayers`.

* UpdateLayers could remove layers? - We could define `layer-id`: `null` to mean that layer should be removed.


## Impact

The new APIs/semantics proposed in this RFC will (reasonably) only be used in imperative applications. It will cause e.g. React and Pure JS code examples to look increasingly different, but this is probably justifiable given the big usability wins for the imperative use case.

And we already support partial prop updates of `Deck` props so why not for layer props... We may want to update our "ONE API" design rule to accommodate this.


## Concerns

This proposal does generate some concerns (but is put forward based on an assessment that the advantages outweigh the concerns)

* **React API confusion** - One concern that is based on interactions with multiple users is that "inexperienced" React programmers that are uncertain about the performance characteristics of deck.gl always generating all layers will try to use these methods to "optimize" their apps, defeating the "reactive" design of the deck.gl API. The docs should make it clear that this is not recommended.

* **API/example divergence** - Our functional/imperative examples will diverge further, making it harder to easily port an example from one "world" to the "other".

---

## Appendix: Rejected Alternatives

The API can be designed in a number of ways, the following alternatives were considered and rejected.


### Single `deck.update` method

More props might benefit from "similar partial" update support as `layers`, e.g. `effects`. Perhaps `deck.update` would be a more extensible API.

```
deck.update({
  layers: {
    'scatterplot': {
      ...newProps
    }
  },
  effects: {
    'lighting': {
      ...newProps
    }
  }
});
```

Rejected: A downside of this API is that we'd need to list which props we support. Or if this function supported most props, it could become a shadow API to parallel `deck.setProps`, which seems undesirable (e.g ONE API concerns). It also struggles with the add/remove layer cases...


### Update layers via a prop instead of a function?

```
deck.setProps({
  updateLayers: {
    'scatterplot': {
      ...newProps
    }
  }
});
```

Rejected: A weakness of the `updateLayers` prop as proposed above is that it is not really a proper "prop", e.g. in the sense that its effects are very state dependent, and it would be confusing to use in React applications.


### Update using actual layer instances rather than prop objects

```
deck.updateLayers([
  new ScatterplotLayer({id: ..., ...newProps})
});
```

We still want to only partially update props, so in this case, harvest the specified prop from the new layer instance and only update those using same method as above.

Rejected: Seems like it could be confusing to programmers, providing the full layer but only updating some things.


### Modify layer instances (deck.getLayer)

Again, work through actual layer instances instead of descriptors

```
deck.updateLayers([
  deck.getLayer('scatterplot-id').clone({
    ...newProps
  })
])
```

Rejected: looks clunky, requires double layer lookup?
