# RFC: dataUrl Layer property

* **Authors**: Xiaoji Chen and Ib Green
* **Date**: Aug 2017, updated Jan 2018
* **Status**: **Implemented**

Notes:
* Originally broken out from the [Off-thread Attribute Generation RFC]().


## Abstract

This RFC makes the proposal that we allow deck.gl layers to be instantiated directly with URLs (and optionally when required some additional request options such as headers, CORS flags etc), and deck.gl will then handle the async loading on behalf of the user, automatically displaying the data when loaded.


## Motivation

deck.gl makes it easy to visualize big data, just instantiate a layer with a `data` prop pointing to your data, and supply a few simple accessors to describe the structure of your data, and you are done.

However, the user still needs to load the data in the first place before he or she can pass it to the layer. Depending on a users skill level, this can be anything from a minor 5-minute routine exercise, to something of a knock-out blow (learning about requests and XHR, installing and tinkering with npm modules, figuring out how to deal with an async loading in Redux, etc).


## What's New

### Layer Class now accepts data URLs

* **data** - Can now accept `Array`, `String` (URL) or `Promise` (that resolves to string).
* **dataTransform** - `Function` that receives the value of data and returns an Array. Default to IDENTITY.
* **fetch** (`Function`|`String`) (Default: 'json') - function used to load data. Defaults to `fetch` with JSON parsing.
    - `Function` returning `Promise` that resolves to data.
    - `String` specifying 'json', 'text' or 'binary'. A default fetch function converting data accordingly will be used.

Remarks:
* Request parameters - Often special headers and options must be set on the request for it to succeed. By supplying your own function  in the `fetch` prop you gain full control.
* Data transformation - If your raw data is not an array that maps directly to layer geometries, the `dataConverted` prop allows you to do any necessary post-processing on the loaded data.


### Layer class API changes

| Prop | Current | Proposed |
| --- | --- | --- |


## Impact Analysis

| Area           | Impact |
| ---            | --- |
| updateTriggers | No impact identified |
| transitions    | Minimal impact. The result of a load should trigger a transition as usual. |


### Load process

* If data url is specified (a `String` or a `Promise`), when it is set, or when it changes, LayerManager records a Promise for the download.
* Prop override keeps returning the old data value.
* Promise is completed.
* Transform the result with dataConverter.
* Use the transformed result instead of the data prop of the layer, and initialize it.


## Challenges

### Async Deep Layer Updates (Open)

Concerns:
* Currently "deep" layer updates (i.e attribute updates) are only triggered when a new layer list is supplied to the layer manager.
* A layer can "dirty" itself to force a redraw to reflect updated uniforms, but can not trigger an update of its attributes / rerender of its sublayers.

Solution:
* Implement a mechanism allowing layers to trigger a deep update.
* Ideally should work with change flags system.
* Ideally avoid doing long updates inside animation timer. Need to trigger outside, or set a flag/timer and handle outside.


### Prop Overriding? (Solved)

Concerns:
* Without prop overriding, support data urls would require all layers to "opt in" by switching to a new method `layer.getData()` can be confusing and error prone (wrong data shown).
* Without prop overriding, allowing `data` to contain urls directly (i.e. instead of `dataUrl`) can cause crashes for non participating layers

Solution:
* The reason for these problems is that current layers look for `props.data`. It is necessary to override this prop. The proof-of-concept PR change the props object to a class and defining accessors that refer to layer state.



### Changing the URL, while still loading data (Solved)

Concerns:
* quick changing of a URL could cause exessive/incorrectly ordered updates.

Solution: We ignore any results except the last.
* Maintain a counter, bump it each time we initiate a load.
* Capture the counter value in the promise (function closure)
* Only update data if promise matches counter. Maybe issue a warning if multiple promises are pending?

Note:
* Not clear that we can cancel pending fetches (the fetch cancel API is a bit complex, maybe we can call a cancel callback to let the app handle it) but at least we can ignore their results.


### Node vs Browser (Open, lower priority)

* isomorphic fetch
* luma.gl has functions that work on both sides...


# Ideas

## Automatic Type Analysis

Integrate type analyzer library (support an `auto` fetch prop to autodetect JSON / CSV etc)?
* Add `csv`, `tsv` etc values to `DeckGL.fetch` prop (maybe using d3-dsv)?


## Support other Async Props

Make the loading mechanisms here available to other props that are typically asynchronously loaded
* Bitmaps -
* Texture Atlases -
* Fonts -

