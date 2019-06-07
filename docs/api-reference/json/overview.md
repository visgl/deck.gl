# @deck.gl/json

The deck.gl JSON module provides support for specifying deck.gl visualizations using [JSON formatted](https://www.json.org/) text files and strings.

## Use Case

Especially in the infovis space, there is a growing need to be able to generate powerful visualizations directly from the backend. Being able to describe a visualization in abstract terms and send it to the front-end for display without modifying JavaScript code can be valuable.

deck.gl supports a highly polished declarative system for describing layers, which the JSON API reuses with very few exceptions.

<div align="center">
  <div>
    <img src="https://raw.github.com/uber-common/deck.gl-data/master/images/docs/json-layers.gif" />
    <p><i>A JSON layer editor built on the @deck.gl/json module</i></p>
  </div>
</div>

See our [live demo](https://deck.gl/json).


## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@~7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/json@~7.0.0/dist.min.js"></script>
<!-- usage -->
<script type="text/javascript">
  const {_JSONConverter} = deck;
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
