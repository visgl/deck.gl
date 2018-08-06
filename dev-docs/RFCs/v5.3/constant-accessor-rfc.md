# Constant Accessors Micro-RFC

* **Authors**: Xiaoji Chen
* **Date**: Apr 2018
* **Status**: **Implemented**

Overview:
* Allow users to supply constant attributes directly instead of using an accessor.


## Background

Many layers use accessors that return constants, for example:

```js
new ScatterplotLayer({
  radiusScale: 100,
  getPosition: d => d.position,
  getRadius: d => 1,
  getColor: d => [255, 200, 0]
});
```

The curent implementation to handle this use case has several problems:

* A large buffer is created and filled with the same value. This can be much more efficient if we switch to using generic attribute.
* Update triggers are required to change these constants, which has been a pain point for beginners.


## Proposal: New Constant Props

* Add a new value prop for every accessor prop, e.g.
  + `position` (Number[3]) - corresponds to `getPosition`
  + `radius` (Number) - corresponds to `getRadius`
  + `color` (Number[4]) - corresponds to `getColor`
* The value prop takes precedence over the accessor, i.e. if `radius` is provided, `getRadius` is ignored. This is so that layers are backward compatible.

The above example now becomes:

```js
new ScatterplotLayer({
  radiusScale: 100,
  getPosition: d => d.position,
  radius: 1,
  color: [255, 200, 0]
});
```

Core changes:

- `LayerManager` checks for value overrides of the specified accessors. The values are automatically applied as generic attributes if provided.
- Some composite layers need to update prop forwarding to include the new props.


## Alternative: Overloaded Accessors

* Allow values be provided to accessor props, e.g.
  + `getPosition` (Function | Number[3])
  + `getRadius` (Function | Number)
  + `getColor` (Function | Number[4])

The above example now becomes:

```js
new ScatterplotLayer({
  radiusScale: 100,
  getPosition: d => d.position,
  getRadius: 1,
  getColor: [255, 200, 0]
});
```

Core changes:

- `LayerManager` checks accessor types. The value is automatically applied as generic attributes, instead of calling the updater, if the accessor is not a function.
- Some composite layers need to modify their wrapped accessors, e.g.

```js
// TextLayer
return new MultiIconLayer({
  ...
  getSize: d => getSize(d.object)
});
```

Now becomes

```js
// TextLayer
return new MultiIconLayer({
  ...
  getSize: (typeof getSize === 'function')? d => getSize(d.object) : getSize
});
```

