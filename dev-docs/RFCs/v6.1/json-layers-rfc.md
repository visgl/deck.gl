# RFC: JSON Layers

* **Authors**: Ib Green
* **Date**: July 2018
* **Status**: Draft Proposal


## Summary

This RFC proposes adding adaptor classes that accept JSON descriptions of views and layers.


## Background

Especially in the infovis space, there is a growing need to be able to generate powerful visualizations directly from the backend. Being able to describe a visualization in abstract terms and send it to the front-end for display withouth having knowledge about how to code front-end applications can be valuable.

deck.gl already supports a highly polished declarative system for describing layers, so JSON layer support can reuse the existing documentation with very few exceptions.

Also, significant effort was already invested during the deck.gl v5 dev cycle to remove the need for callbacks when using deck.gl for basic use cases. The fact that many apps can be written declaratively.


## Proposals

### `JSONLayer` (New Class)

Takes an array of JSON layer descriptors, and a layer catalog.

```js
import {JSONLayer} from '@deck.gl/experimental-layers';

const layers = [
  new JSONLayer({
  	layerCatalog: require('@deck.gl/layers'),
  	json: require('./us-map.json')
  })
];
```


### `JSONDeck` (New Class)

Takes a JSON object descripting top level deck.gl props, view descriptors, layer descriptors, and layer and view catalogs, and instantiates.

Also supports an optional simple mapbox integration (leaving importing of mapbox-gl to the app!).

```js
import {JSONDeck} from '@deck.gl/experimental-layers';
import mapboxgl from 'mapbox-gl';

import json from './us-map.json';

export const deckgl = new JSONDeck({
  canvas: 'deck-canvas',
  mapContainer: 'map',
  mapboxgl,
  layerCatalog: require('@deck.gl/layers'),
  json
});
```


### Support Declarative Syntax for Accessor-Style functions

In most cases, to meaningfully use deck.gl layers, the user must at least be able to configure accessor functions. Currently deck.gl does not support a fully "declarative" syntax for accessors.

Constant accessors are supported by default, function valued accessors are not. JSON cannot contain functions, however it can contain strings that can be parsed and used to generate functions.

While more advanced formats are possible in the future, the initial idea is to treat strings simplh as object access "paths".

Examples:
* the string `'position'` will generate a function `x => x.position`
* `'props.color'` will generate a function `x => x.props.color`
* The empty string `''` will generate a function `x => x`

A second key problem is to determine which strings (layer props) should be parsed into functions? Since we have started build out a prop types system, it is suggested we extend this as needed and parse and generate functions based on prop types.


## Error Handling

When asking users to provide data in a textual format such as JSON, there are many opportunities for the user to make mistakes tht are simple to solve but hard to find (compare with our support for GeoJSON, where we sometimes get questions from users who fail to render successfully due to some simple formatting issue in their data, where a simple error message from deck.gl could have saved them a lot of time).

We should have a plan for detecting errors and providing the best possible messages:

* **JSON parsing Errors** - The built-in `JSON.parse()` function is fast but notorious for giving poor error messages. There are JSON parsing modules on npm that do better, possibly at the cost of speed. Maybe an initial parse if JSON.parse, and a reparse with such a module in case of error?

* **Top Level Prop Validation** - P1 - Currently we have a roundaout React prop-types set of definitions. Not clear if we want to use this for non-React purposes, but it is an option. Maybe layer prop types system could be extended to cover this?

* **Layer Prop Validation** - P0 - This should almost certainly build on the nascent prop types system for layers, and the resulting error validation should be available to all incarnations of the API, not just the JSON layers.

* **View Prop Validation** - P1 - The prop system hasn't been extended to cover non-layer object props, such as `View`s, but perhaps this is a possibility. The `View` props are reportedly hard to understand for some users so error messages here would be really valuable. Ideally should be done in a way that covers all incarnations of the API.


**Showing Errors** - P2 - It would be really nice if we could show the user in an editor exacly where his problems are, but this would likely require more work. This feature would likely be JSON layer specific.


## Open Questions

### Where to put the new classes?

* They are quite small. Don't quite deserve to be in core/layers, and don't quite deserve their own module.
* Perhaps in a `@deck.gl/addons` `@deck.gl/experimental` or `@deck.gl/experimental-layers/addons`?
* They are being incubated in a separate infovis repo, but that is not public yet.

Note, there could be changes to e.g. error handling etc that must be done in the `core` and `layers` modules.


### Any reason to support string accessors in non-JSON APIs?

* Better performance characteristics? String comparison succeeds where function comparison fails.
* The conversion from strings to functions could be built into the prop type system?


### Future Extensions / Interactivity

As JSON layers get more usage, users will ask for more functionality to be made available declaratively. In particular *interactivity* will be requested.

An example could be **hover tooltips**, which is a common feature in many visualizations.

Some of these requirements should naturally be implemented by applications, but some features may be small and helpful for other APIs (scripting, React) that they could make sense to build into deck.gl itself.

For extensive interactivity support is probably best to implement a system that has already done the hard work to solve interactivity problems in a declarative JSON environment , such as a Vega. Again it is assumed that such an effort should remain separate from this RFC, as the scope will be much bigger, and the API will diverge considerably from the code deck.gl API.


## (Philosophical) Final Thoughts

Ideally, we should view the support for JSON Layers simply as the "fourth incarnation" of the deck.gl API (next to vanilla JS, scripting and React). And as always, the rule that deck.gl fundamentally only has "one API" should still apply here.

