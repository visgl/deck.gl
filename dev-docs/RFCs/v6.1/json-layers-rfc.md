# RFC: JSON Layers

* **Authors**: Ib Green
* **Date**: July 2018
* **Status**: **Preliminary Approval**


## Summary

This RFC proposes adding adaptor classes that accept JSON descriptions of views and layers and convert them to deck.gl views and layers. The JSON schema is proposed to be a "minimal" mapping of the current declarative deck.gl API.

<div align="center">
  <div>
    <img src="https://raw.github.com/uber-common/deck.gl-data/master/images/docs/json-layers.gif" />
    <p><i>PoC: JSON layer browser built on new @deck.gl/json module.</i></p>
  </div>
</div>


## Background

Especially in the infovis space, there is a growing need to be able to generate powerful visualizations directly from the backend. Being able to describe a visualization in abstract terms and send it to the front-end for display withouth having knowledge about how to code front-end applications can be valuable.

deck.gl already supports a highly polished declarative system for describing layers, so JSON layer support can reuse the existing documentation with very few exceptions.

Also, significant effort was already invested during the deck.gl v5 dev cycle to remove the need for callbacks when using deck.gl for basic use cases. The fact that many apps can be written declaratively.


## Proposals


### Follow our "One API" Principle

Ideally, we should view the support for JSON Layers simply as the "fourth incarnation" of the deck.gl API (next to vanilla JS, scripting and React). And as always, the rule that deck.gl fundamentally only has "one API" should still apply here. I.e. we should resist the temptation to define special semantics or props or API variants that work just in JSON:

* keep mappings between JSON props and JavaScript props and types as natural as possible
* When making changes and additions to the exposed functionality, consider doing these changes in `@deck.gl/core` or in all APIs.


### `@deck.gl/json` (New npm module)

We need to decide where to put JSON functionality and new classes. * Do they deserve their own module `@deck.gl/json`? As a "fourth" API, yes. But is there enough code / expected growth to justify it?


* The code is (currently) quite small, but still doesn't quite deserve to be in `@deck.gl/core` or `@deck.gl/layers`. (we need to keep the core small and generic, and the layers module should obviously only contain layers).
* Should we create a place for experimental code that is not a layer? E.g. `@deck.gl/addons` `@deck.gl/experimental` or `@deck.gl/json/addons`?
* The code has some commonality with the scripting API... compare and make a "symmetric" solution.



### `JSONConverter` (New Class)

Takes a JSON object descripting top level deck.gl props, view descriptors, layer descriptors, and layer and view catalogs, and instantiates.

Also supports an optional simple mapbox integration (leaving importing of mapbox-gl to the app!).

```js
import {JSONConverter} from '@deck.gl/json';
import {Deck} from '@deck.gl/core';
import mapboxgl from 'mapbox-gl';

import JSON from './us-map.json';

const jsonConverter = new JSONConverter({
  configuration: {
    layers: require('@deck.gl/layers')
  }
});

export const deckgl = new Deck({
  canvas: 'deck-canvas',
  mapContainer: 'map',
  mapboxgl
});

deck.gl.setProps(jsonConverter.convert(JSON))
```

### `JSONLayer` (New Class)

Takes an array of JSON layer descriptors, and a layer catalog. `JSONConverter` builds on this class, however using this class directly allows apps to mix in some JSON layers with programmatically generated layers.

```js
import {JSONLayer} from '@deck.gl/json';

const layers = [
  new JSONLayer({
  	configuration: {layers: require('@deck.gl/layers')},
  	json: require('./us-map.json')
  })
];
```


### Support for Non-Primitive Data Types

Strings, numbers, booleans, and objects and arrays are all supported natively in JSON. But for other data types, some conversion or support is typically necessary.


#### Classes

For classes, a `catalog` concept is being proposed. Maps of layer and view classes are supplied to the proposed `JSONConverter` component, and it uses these catalogs to convert JSON objects in the right places into objects:

```json
{
  "layers": {
  	"type": "ScatterplotLayer",
  	"data": "..."
  }
}
```

is replaced by the `JSONConverter` component with:

```js
new ScatterplotLayer({data})
```

When the JSONConverter component finds a "type" it looks into a "layer catalog" provided by the application, and similarly for views. This leaves the choice of what layers and views to bundle with the application, and makes it easy for apps to expose other classes.

> An open question is if other class catalogs should be supported, perhaps in specific or arbitrary positions in the tree.


#### Constants/Enumerations

Currently constants, e.g. `"coordinateSystem": "COORDINATE_SYSTEM.IDENTITY"` must be specified with their numeric counterparts: `"coordinateSystem": "0"`.

> A system for registering converter could be considered, but ideally it would be integrated with the prop types system.


#### Functions: Support Declarative Syntax for Accessor-Style functions

In most cases, to meaningfully use deck.gl layers, the user must at least be able to configure accessor functions. Currently deck.gl does not support a fully "declarative" syntax for accessors.

Constant accessors are supported by default, function valued accessors are not. JSON cannot contain functions, however it can contain strings that can be parsed and used to generate functions.

While more advanced formats are possible in the future, the initial idea is to treat strings simply as object access "paths".

Examples:
* `'position'` will generate a function `x => x.position`
* `'props.color'` will generate a function `x => x.props.color`
* `'-'` (a dash, or maybe an equal sign) will generate a function `x => x`

Another problem is to determine which strings (layer props) should be parsed into functions. The prototype converts any string valued layer props that starts with `get`.  But since we have started build out a prop types system, it is suggested we extend this as needed and parse and generate functions based on prop types.

> Could we also support string accessors in non-JSON APIs? If we did, the JSON API would just leverage the core functionality. The conversion from strings to functions could be built into the prop type system? Better performance characteristics (e.g. shallow string comparison succeeds where shallow function comparison fails)?


## Testing

If anything, JSON support should enable new easy ways of testing. Especially existing render tests should be easy to adapt to JSON layers.


## Future Work

The functionality described in this RFC is just an initial implementation, there are a lot of additional capabilities that can be added.


### JSON Schemas

When defining a JSON based format, it is customary to define and publish a JSON schema, which enables a bunch of existing tooling e.g. for validation.

* Define JSON schema for deck.gl and upload to jsonschemas.org.
* Automatic generation of JSON schemas from prop types. There is already a base script in the `scripts` folder for traversing layer props. We could have consolidated set of tooling for automatically generating JSON schemas, Flow types, TypeScript types, React PropTypes etc.
* Publish JSON schemas for each version of deck.gl API, enabling JSON validators etc.

We might want to also look at other existing visualization schemas, such as Vega, Vega-lite, Plotly etc. It may be possible to support such schemas with additional adapter code.


### Error Handling

When asking users to provide data in a textual format such as JSON, there are many opportunities for the user to make mistakes tht are simple to solve but hard to find (compare with our support for GeoJSON, where we sometimes get questions from users who fail to render successfully due to some simple formatting issue in their data, where a simple error message from deck.gl could have saved them a lot of time).

We should have a plan for detecting errors and providing the best possible messages:

* **JSON parsing Errors** - The built-in `JSON.parse()` function is fast but notorious for giving poor error messages. There are JSON parsing modules on npm that do better, possibly at the cost of speed. Maybe an initial parse if JSON.parse, and a reparse with such a module in case of error?

* **Top Level Prop Validation** - P1 - Currently we have a roundaout React prop-types set of definitions. Not clear if we want to use this for non-React purposes, but it is an option. Maybe layer prop types system could be extended to cover this?

* **Layer Prop Validation** - P0 - This should almost certainly build on the nascent prop types system for layers, and the resulting error validation should be available to all incarnations of the API, not just the JSON layers.

* **View Prop Validation** - P1 - The prop system hasn't been extended to cover non-layer object props, such as `View`s, but perhaps this is a possibility. The `View` props are reportedly hard to understand for some users so error messages here would be really valuable. Ideally should be done in a way that covers all incarnations of the API.


**Showing Errors** - P2 - It would be really nice if we could show the user in an editor exacly where his problems are, but this would likely require more work. This feature would likely be JSON layer specific.

**Showing Errors** - P2 - It would be really nice if we could show the user in an editor exacly where his problems are, but this would likely require more work. This feature would likely be JSON layer specific.


### Declarative Interactivity

As JSON layers get more usage, users will ask for more functionality to be made available declaratively. In particular *interactivity* will be requested.

While some interactivity requirements are application specific and do not belong in a framework, some features may be small and helpful for other APIs (scripting, React) that they could make sense to build into deck.gl itself, and in fact deck.gl v5 already built in a few cases into the API, removing the need for callbacks for e.g. resize handling, basic viewport interaction, object hightlighting etc.

One of the first additional examples could be **hover tooltips**, which is a common feature in many visualizations. It will likely be needed in the JSON API and we could investigate whether it is something deck.gl should support more generically.

For more extensive, "programmable" declarative interactivity support, we would need to define some mechanisms in JSON to e.g. cross-reference values (set one layer prop to be the value of some other element). For this type of more advanced interactivity, it is probably best to implement (or at least closely study) a system that has already done the hard work to solve interactivity problems in a declarative JSON environment, such as a Vega. Again it is assumed that such an effort should remain separate from this RFC, as the scope will be much bigger, and the API will diverge considerably from the code deck.gl API.
