# RFC: Data Loading Enhancements (for loaders.gl)

* **Author**: Ib Green
* **Date**: May 2019
* **Status**: **Draft**

## Abstract

This RFC suggests a number of improvements to loading support in deck.gl, in particular to support seamless optional integration with loaders.gl.

## Background

The vision of loaders.gl is that loaders are designed to be directly compatible with luma.gl and deck.gl and easy/intuitive to use is not fully realized in deck.gl v7.0.


### Problems

* No separation between loading and parsing - The application should not need reimplement parsing just to add a header to the `fetch` call.

- The main method for redefining loading.
There are some ways around this, like using fake urls and checking for them in the fetch method to

No good way to specify different loaders for different props.

## Proposal 1a: Separate fetching from parsing (fetch returns String/ArrayBuffer or Response)

The ability for app to redefine how data is loaded (or "fetched") is important.

Apps need to be able to do things like
- add request headers
- set CORS flags
- etc

There are many different techniques and libraries (`XMLHttpRequest`, company-internal libraries etc) that help users load data into the browser, we want to enable users to use the techniques that work for them.

It is desirable to be able to separate override fetching and loading, to support:
1. ability to override fetch with custom fetching logic (see more examples below),
2. integration with loaders.gl and

To achieve this, we redefine (extend) the semantics of the current `fetch` prop:

- if `props.fetch` returns a `String` `ArrayBuffer` or `Response` (or a promise resolving to these), we apply parsing to the result.
- if `props.fetch` returns e.g. an Array or Object deck.gl can assume that fetch did perform parsing and skip a

Note that the `fetch` prop remains backwards compatible by only considering `fetch` separated from parsing if it returns structured data.

Simple example that uses `fetch` with options

```js
  SomeLayer({
    data: INTERNAL_DATA_URL,
    fetch: url => fetch(url, {headers: {'Company-Access-Token': 'Secret-Value'}})
  })
```

Default fetch:
- The default fetch would change to just call `fetch`...

Design Notes:
- Backwards compatibility:  The main complication with redefining `fetch` was the current (7.1) `fetch` prop semantics (which are seeing modest use in our own code). Per the current semantics, a `props.fetch` override is expected to both fetch and parse.

## Proposal 1b: fetch overload - specify an options object for fetch (DECLARATIVE)

We could support a fetch overload that just takes an object with parameters to `fetch` (which would presumably be the most common use case for overriding fetch):

```js
  SomeLayer({
    data: INTERNAL_DATA_URL,
    fetch: {headers: {'Company-Access-Token': 'Secret-Value'}}
  })
```

Design notes:
- This overload would support declarative usage (json/pydeck/...).


## Proposal: Add `parse` prop to specify how data should be parsed

```js
import {parse, registerLoaders} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';
registerLoaders(CSVLoader);

new AnyLayer({
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  data: CSV_URL,
  // NEW: Accept a parse methods
  parse,
});
```

There are two ways to specify a custom loader that works with the deck.gl async prop loading:

- Defining a fetch function that loads and parses.

Do we expect `parse` functions to support different input data.


The `parse` prop is expected to be either a function or a (list of) loaders.gl loaders that can be passed to `parse`.

Design Notes:
- The requirement to wrap custom loaders as loaders.gl loader objects: loaders.gl `parse` is flexible and accepts a fetch response object as its preferred (most  flexiable/efficient input). It is fair to assume that not all custom loaders support a variety of objects. By registering a custom loaders



## Proposal 3a: Ability to override fetch per async prop

By supplying an object to fetch, different request options could be needed for different props (different resources may be served from different servers and they may need different headers etc):

```js
  SomeBitmapLayer({
    data: DATA_URL,
    bitmap: BITMAP_URL,
    fetch: {
      data: url => fetch(url, {headers: {...}})
      bitmap: url => fetch(url, {headers: {...}})
    }
  })
```

If an async prop isn't listed it will be fetched using the default fetch method.

```js
  SomeBitmapLayer({
    data: DATA_URL, // loaded with custom fetch
    bitmap: BITMAP_URL, // loaded with default fetch
    fetch: {
      data: url => fetch(url, {headers: {...}}),
    }
  })
```

Redefining default AND specific fetch
```js
  SomeBitmapLayer({
    data: DATA_URL, // loaded with custom fetch
    bitmap: BITMAP_URL, // loaded with default fetch
    fetch: {
      data: url => fetch(url, {headers: {...}}),
    }
  })
```

Design notes:
- This design conflict with the declarative `fetch` overrides (proposal 1b), as both represent Object overloads.

Alternative design, we could let async props be objects. But this would of course be an issue when we accept objects (like binary data).

```js
  SomeBitmapLayer({
    data: {
      url: DATA_URL,
      fetch: url => fetch(url, {headers: {...}}),
      parse: ...
    },
    bitmap: BITMAP_URL,
  })
```

```js
  SomeBitmapLayer({
    data: DATA_URL, // loaded with custom fetch
    bitmap: BITMAP_URL, // loaded with default fetch
    fetch: {
      data: url => fetch(url, {headers: {...}}),
    }
  })
```


## Proposal 3c: Ability to override parse per async prop

Sometimes, a loader called by the parse function needs contextual information. For instance, the ScenegraphLoader cannot work without a `gl` context being passed in.

Design Notes:
- Can we make any changes to loaders.gl so that layers can rely on the globally registered loaders to minimize the need to make special loader lists for specific
- Sometimes the layer may just need to pass some options to the pre-registered loader. CSV header flag, gl context to scenegraph laoder.


## Proposal 4: Add 'onData' callback

The new `onData` callback is called whenever the layer sees new `data`, either as a result of an async load completing, or just as a result of new sync data being supplied to the layer.

This allows app to use the convenience of async `data` URL props, even when they need to do some final processing, perhaps extract some small piece of information from the data to update the view state.

For instance, the `PointCloudLayer` example uses the bounding box of the point cloud to initialize `viewState` for the `OrbitController`.

BEFORE:
```js
const data = await fetch(LAZ_SAMPLE);
_setViewStateFromPointCloud(data)); // Calculate View State from header

new PointCloudLayer({
  data
});
```

AFTER:
```js
new PointCloudLayer({
  data: LAZ_SAMPLE,
  // NEW: Provide a callback to let application react to loaded/parsed/transformed data
  onData: data => this._setViewStateFromPointCloud(data)
});
```

Design Notes:
- It is assumed that the `onData` callback should be called only once during batched streaming (when all batches have arrived). The batched loading RFC might add an `onDataBatch` callback that is called after each batch.
- Why support onLoad callbacks for the `data` prop only? This callback was added to let apps react to the completed loading of async `data` props. Like other affordances for async props, one can imagine that similar callbacks could be useful for other async props...
- The original proposed callback name was `onDataLoaded`. Reviewers pointed out that it would be useful to call this function should be called even when pre-parsed data is supplied. The new name (`onData`) reflects this change. Other options: `onDataAvailable`, `onDataUpdated`.


## Proposal 5: Make PointCloudLayer accept a "Geometry-shaped" object

Today custom code is required to extract the positions attribute etc and pass in as top-level props, see the PointCloudLayer example.

BEFORE:
```js
fetch(LAZ_SAMPLE).then(...); // Extract numInstances and positions, calculate View State

new PointCloudLayer({
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  numInstances: state.pointsCount,
  instancePositions: state.points
});
```

AFTER:
```js
import {parse, registerLoaders} from '@loaders.gl/core';
import {LAZLoader} from '@loaders.gl/las';
registerLoaders(LAZLoader);

new PointCloudLayer({
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  data: LAZ_SAMPLE,
  parse // NEW: See above
});
```

## Proposal: Update deck.gl/json to use loaders.gl integration

Instead of importing d3-csv etc.


## Ideas: Potential Proposals

These ideas still need some work to become formal proposals

### Idea: Allow fetch/parse to be redefined on deck.gl level.

Instead of having to pass `fetch` and `parse` to each layer, maybe just allow the user to set defaults on `Deck`.

### Idea: loaders.gl loader modules autoregister their loaders

This is a proposal for loaders.gl, but mentioned here for completeness:

Many apps could be slightly more elegant if loaders.gl loader modules auto-registered their loaders. With the right deck.gl integration, simply importing a loader module would make that loader available to the async props of deck.gl layers.

Comparing the point cloud example above:

```js
import {LAZLoader} from '@loaders.gl/las';

new PointCloudLayer({
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  data: LAZ_SAMPLE
});
```

While such "pre-registration" would be trivial to implemented, there are some concerns:

- Which loader(s) to register: The default main-thread loader, the streaming loader, the  worker thread loader. All of them?
- Tree-shaking: A loader module could export multiple loaders. By auto registering all of them, we might defeat tree-shaking (a modest concern, since we are already publishing loaders a-la-carte).
- Increased dependency: Currently simple loader modules can be written without importing any loaders.gl helper libraries (`@loaders.gl/loader-utils`). If the loader modules have to import `registerLoaders` that changes. This is a design simplicity/elegance in loaders.gl  that matters to some people, that would be lost for this convenience.
- Manual registration code? - To avoid having to import `@loaders.gl/loader-utils` in each loader module, we could just ask each loader to push their loader a global array. But even then, the global scope must be determined, normally by helper function in loaders.gl.


## Rejected Proposals

## Rejected Proposal: Ability to specify different defaultProps for fetch

Assuming we make it easy to write custom loaders, there does not seem to be a strong use case for layers providing different defaults for fetch.

```js
const defaultProps = {
  bitmap: {async: true},
  fetch: {
    data: url => d3.csv(url)
  }
}
```

Design Notes:
- We would need to clarify how individual fetch functions are merged between defaults and overrides.
