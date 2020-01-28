# RFC: Syntactic sugar for @deck.gl/json

* **Authors**: Andrew Duberstein (@ajduberstein)
* **Date**: October 10, 2019
* **Status**: Draft


## Overview

This is a proposal for adding syntactic sugar to the @deck.gl/json expression parser which will let the user distinguish
between the keyword `type` and a string named `type`.


## Motivation

The keyword `type` occurs as a field name in many data sets, and is also of course a Javascript keyword.
Users may want `type` to be interpreted as one or the other but currently can't specify which.

The GeoJSON standard includes type in the top-level JSON, so most GeoJSON data sets break when ingested by the deck.gl/json API.

## Prior Art

We should likely avoid conflicting with [JSON pointer syntax](https://www.baeldung.com/json-pointer) and JSON Paths. It seems like `_`, `__`, and `@@` would be acceptable characters. We are already using `__` in deck.gl to represent internal fields, so it seems like the least ambiguity comes from use of `@@`. 

## Proposal

deck.gl/json will use `@@type` to indicate the Javascript `type` keyword.

Additionally, add a syntax for expressions, e.g, `@@=` prefix: `@@=[lng, lat]`, so that we didn't need to know any information about prop types to deduce which strings to parse as expressions.
