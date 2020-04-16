# RFC: pydeck dynamic injection of JavaScript layer modules

* **Authors**: Andrew Duberstein (@ajduberstein), Ib Green (@ibgreen)
* **Date**: January 3, 2020
* **Status**: Draft

## Overview

This RFC proposes a mechanism for adding additional layer modules to the existing `pydeck` without republishing.

Also, this RFC concludes that for now, attempting to support standard script loading systems is too demanding, and we can instead impose special module build requirements on the author of a layer module as long as we provide a convenient way for users to import that module in pydeck.

## Motivation

One of the major advantages of deck.gl is that it is a toolbox on top of which additional custom layers can be built, for specific applications and use cases. Such layers can easily be imported in and used with any deck.gl JavaScript application, but today these layers are not easily usable.

(Note: This mechanism could be generally applicable to all client-side bindings that use the deck.gl"JavaScript renderer").

## Background

Layer injection in pydeck is currently done [here](https://github.com/visgl/deck.gl/blob/master/modules/jupyter-widget/src/create-deck.js). As can be seen it is a static process that depends on the layer modules being bundled during the pydeck build process.

## Prior Art

commonjs and AMD are two ways to package up JS modules so that they can be imported in other applications. Supporting generic imports of these modules is quite complicated (e.g. see the length of the Observable article that discusses [script loading](https://addyosmani.com/writing-modular-js/)).

## Proposals


### Dynamic script loading

loaders.gl has implemented a [dynamic script loading system](https://github.com/visgl/loaders.gl/tree/master/modules/loader-utils/src/lib/library-utils) to support optional, on-demand loading of large loader libraries and worker threads.

This system could be copied / generalized to deck/pydeck so that a list of additional layer module URLs could be provided to pydeck and loaded dynamically.

Open questions:
- How would additional modules be specified once pydeck is open? Would pydeck export a python function to "install" additional layers?
- `JSONConfiguration` may need a method to extend definition.
- Should dynamic extensibility be built on the pydeck level or the deck.gl or @deck.gl/json level?

Concerns:
- Security implications would need to be understood and managed.

### Python module injection

If a developer wanted to publish a python module exposing the new layers, how would it inject them into the existing pydeck `JSONConfiguration`?

### Packaging JS Layer Modules for Use with pydeck

Would need to be built the way deck.gl scripts are built

Ensure external code is not bundled twice.

Register layers on a global (sub object of deck object)?

Documentation is needed (should be shared with deck.gl scripting API).
