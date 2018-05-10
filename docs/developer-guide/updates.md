# Updates

One of the keys to getting good performance and desired behavior from deck.gl is to understand how and when deck.gl updates data.


## The Reactive Programming Paradigm

Before jumping into the details, it might be helpful review the reactive programming paradigm that the deck.gl is architecture is based on:

* In a reactive application, a complete UI description is "re-rendered" every time something in the application state changes (in the case of a deck.gl application, a new list of layers is created whenever something changes).
* The UI framework (in this case, deck.gl) makes the choices about what to update, by comparing (or "diffing") the newly rendered UI description with the last rendered UI description.
* The framework then the makes minimal necessary changes to account for the differences, and then redraws.
* The required changes are made to "WebGL state" in case of deck.gl, and to the Browser's DOM (HTML element tree) in case of React.


## Creating New Layers on Every Render?

The deck.gl model means that applications are expected to create a new set of on layers every time application state changes, which can seem surprisingly inefficient to someone who hasn't done reactive programming before. The trick is that layers are just descriptor objects that are very cheap to instantiate, and internally, the new layers are efficiently matched against existing layers so that no updates are performed unless actually needed.

So, even though the application creates new "layers", those layers are only "descriptors" containing props that specify what needs to be rendered and how. All calculated state (WebGL "programs", "vertex attributes" etc) are stored in a state object and this state object is moved forward to the newly matched layer on every render cycle.  The new layer ends up with the state of the old layer (and the props of the new layer), while the old layer is simply discarded for garbage collecion.


## Shallow Equality

Since the reactive programming frameworks conceptually render the entire UI every render cycle, and achieves efficiency by comparing and "diffing" changes between render cycles, it is important that comparisons are fast. Because of this, deck.gl uses shallow equality as the default comparison method except where otherwise specified.


## About WebGL State

Based on the way WebGL works there are two main types of state, and it is good to be somewhat aware of the difference between them:

* **Attributes** - (sometimes called **vertex attributes**) these are big buffers of memory that contain the geometry primitives that describe how the GPU should render your data. Updating of attributes is done by JavaScript looping over every element in your data. It is essentially a linear time operation (proportional to the number of `data` items you are passing to the layer) and care should taken to avoid unnecessary updates.

* **Uniforms and Settings** - These are single parameters (single values or small vectors) that are accessible to the GPU. They are very cheap to change and can essentially be changed on every render.

Some deck.gl props will cause attributes to be recalculated (mainly `data` props and accessors), and some will just affect uniforms and settings. You will want to develop an understanding for which props do what.


## Data Updates

Once a `data` change has been confirmed by deck.gl it will invalidate all attributes and completely regenerate them.


### Accessors

Accessors. Note that changing the value of an accessor (i.e. supplying a different function to the accessor prop) will not in itself trigger an attribute update. This is because the function identity is a poor indicator of whether an update is needed, and the convenience of using local functions as prop values.

Thus, the code below will not trigger expensive attribute updates, which is what most applications would expect

```js
new Layer({
  getColor: x => x.color, // this creates a new function every render
  getElevation: this._getElevation.bind(this) // bind generates a new function every render
})
```

However, neither will this code

```js
new Layer({
  getColor: pill === 'red' ? this._getRedPill() : this._getBluePill(), // Does not trigger an attribute update!!!
})
```

Here the `updateTriggers` mechanism comes to the rescue.


### Update Triggers

There is no way for deck.gl to know what the programmer intended just by looking at or comparing the functions that are supplied to a `Layer`s accessor props. Instead, the `updateTriggers` property gives you fine grained control, enabling you to tell deck.gl exactly which attributes need to change, and when. In this way you can trigger and update of say instance colors and elevations in response to e.g. a reaggregation operation (see the HexagonLayer) without recaclulating other attributes like positions, picking colors etc.

When the value in an `updateTrigger` change, any attributes that depend on that accessor will get invalidated and recalculated before next render cycle.

```js
new Layer({
  // This does not trigger an update when the value of "pill" changes...
  getColor: pill === 'red' ? this._getRedColors() : this._getBlueColors(),
  // ...but this does!
  updateTriggers: {
  	getColor: pill
  }
})
```

In the above code, deck.gl compares the value of the `getColor` update trigger with its previous value on every render, and whenever it changes, it will regenerate the colors attribute using the function supplied to `getColor` at that time.


### Supplying Attributes Directly

While the built-in attribute generation functionality is a major part of a `Layer`s functionality, it is possible for applications to bypass it, and supply the layer with precalculated attributes.


### shouldUpdateState

When rendering with many viewports there is a concern that `updateState` gets called many times per frame (potentially recalculating other things that have nothing to do with viewport updates, in less strictly coded layers). Because of this, since most layers do not need to update state when viewport changes, the `updateState` function is not automatically called on viewport change. To make sure it is called, the layer needs to override `shouldUpdateState`.

So layers that want `updateState` to be called when viewports change (like `ScreenGridLayer`) need to redefine `shouldUpdateState`. This will mean that even though all layer’s will have `shouldUpdateState` called every viewport every frame, only a few will typically get calls to `updateState`.



## Future Possibilities

The following optimizations have not yet been implemented.


### Caclulating attributes in workers

Some deck.gl applications use workers to load data and generate attributes to get the processing off the main thread. Modern worker implementations allow ownership of typed arrays to be transferred between threads which takes care of about half of the biggest performance problem with workers (deserialization of calculated data when transferring it between threads).


### Partial Updates

deck.gl currently doesn't implement support for partial updates. Each attribute is always updated completely. Investigations have been done, and for certain use cases it would be possible to let the application specify e.g. a range of changed indices, to significantly limit the work involved in update. However, a completely general solution is likely too complicated (e.g. handling deletions and additions in addition to just replacements), or even intractable (e.g. auto-detecting the changes in large arrays).

