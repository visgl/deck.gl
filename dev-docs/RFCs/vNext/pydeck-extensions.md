# RFC: Syntactic sugar for @deck.gl/json

* **Authors**: Andrew Duberstein (@ajduberstein), Ib Green (@ibgreen)
* **Date**: January 3, 2020
* **Status**: Draft

## Overview

This RFC proposes a mechanism for adding additional layer modules to the existing `pydeck` without republishing.

## Motivation

One of the major advantages of deck.gl is that it is a toolbox on top of which additional custom layers can be built, for specific applications and use cases. Such layers can easily be imported in and used with any deck.gl JavaScript application, but today these layers are not easily usable.

## Background

Layer injection in pydeck is currently done [here](https://github.com/uber/deck.gl/blob/master/modules/jupyter-widget/src/create-deck.js). As can be seen it is a static process that depends on the layer modules being bundled during the pydeck build process.

## Proposals

### Dynamic script loading

loaders.gl has implemented a [dynamic script loading system](https://github.com/uber-web/loaders.gl/tree/master/modules/loader-utils/src/lib/library-utils) to support optional, on-demand loading of large loader libraries and worker threads.

This system could be copied / generalized to deck/pydeck so that a list of additional layer module URLs could be provided to pydeck and loaded dynamically.

Open questions:
- How would additional modules be specified once pydeck is open? Would pydeck export a python function to "install" additional layers?
- `JSONConfiguration` may need a method to inject new layers.

Concerns:
- Security implications would need to be understood and managed.

### Python module injection

If a developer wanted to publish a python module exposing the new layers, how would it inject them into the existing pydeck `JSONConfiguration`?
