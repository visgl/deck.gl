# @deck.gl/json

The deck.gl JSON module provides a `JSONConverter` class that converts textual JSON specifications into JavaScript objects, and functions.

Through a set of conventions, the JSON module allows the specification of _JavaScript class instances_, _React elements_, _enumerations_ and _functions_ (in addition to the basic types created during the JSON parsing process (i.e. arrays, objects, strings, numbers and booleans).

The set of classes, React components, functions, constants and enumerations that should be available to the JSONConverter must be provided via an application-provided configuration object.

## Use Cases

Especially in the infovis space, there is a growing need to be able to generate powerful visualizations directly from the backend. Being able to describe a visualization in abstract terms and send it to the front-end for display without modifying JavaScript code can be valuable.

## deck.gl Integration

deck.gl supports a declarative system for describing layers and their props, and this declarative API can be trivially exposed via the JSON API.

<div align="center">
  <div>
    <img src="https://raw.github.com/visgl/deck.gl-data/master/images/docs/json-layers.gif" />
    <p><i>A JSON layer editor built on the @deck.gl/json module</i></p>
  </div>
</div>

See our [live demo](https://deck.gl/playground).


The module was created to enable specifying deck.gl visualizations using [JSON formatted](https://www.json.org/) text files and strings, but is completely generic and



## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/json@^7.0.0/dist.min.js"></script>
<!-- usage -->
<script type="text/javascript">
  const {JSONConverter} = deck;
</script>
```

### Install from NPM

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/json
```

```js
import {JSONConverter} from '@deck.gl/json';
```

## Schema

The valid combinations are defined by the [documented API](/docs/api-reference/json/json-converter.md).

## Error Handling

Error detection is currently limited and error messages may not be very helpful.
