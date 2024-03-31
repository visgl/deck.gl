# JSONConverter

> NOTE: This component is only intended to support **official deck.gl API props** via JSON. In particular, it is not intended to evolve an implementation of alternate JSON schemas. Support for such schemas should be developed independently, perhaps using the source code of this component as a base. See the [JSON Layers RFC](https://github.com/visgl/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md) for more on this.

Converts a JSON description of a deck.gl visualization into properties that can be passed to the `Deck` component.

Requirements on the JSON description:

* Expected to contain at minimum "layers" and "initialViewState" fields.
* The JSON for each layer should be formatted as in described in JSONLayer.


## Usage

```js
import {JSONConverter} from '@deck.gl/json';

import json from './us-map.json';

const configuration = {
  layers: require('@deck.gl/layers')
};

const new jsonConverter = new JSONConverter({configuration});

const deck = new Deck({
  canvas: 'deck-canvas',
  json
});

deck.setProps(jsonConverter.convert(json));
```


## Properties


#### `json` (object | string) {#json}

A JSON string or a parsed JSON structure.
All properties in this object, after processing, are passed to a [Deck](../core/deck.md) instance as props.

## Configuration

See more details in the [Configuration Reference](./conversion-reference.md) section.

