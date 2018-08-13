# Configuring JSON Layers (Experimental)

## Class catalogs

The JSON framework inspects the "raw" parsed JSON data structure before supplying it to deck.gl as props. One thing this conversion process needs to is to replace certain objects in the structure with instances of objects. This happens by default for layers and views:

```json
{
  "layers": {
  	"type": "ScatterplotLayer",
  	"data": "..."
  }
}
```

is replaced by the `JSONConverter` component with

```js
new ScatterplotLayer({data})
```

When the `JSONConverter` component finds a "type" field it looks into a "layer catalog".


## Enumeration Catalogs

A map of enumerations that should be made available to the JSON string resolver.


## API Summary

### configuration : Object

Object with the following fields.

* `layers` - Allows the application to specify which layer types the `JSONConverter` can use. Expects a map from layer names to layer classes. No layers are supported by default.
* `views` - Allows the application to specify which view types the `JSONConverter` can use. Expects a map from view names to view classes. Can be ommitted as the standard views in `@deck.gl/core` module are supported by default.
* `enumerations` - a map of enumerations that should be made available to the JSON string resolver.
* `classes` - a map of general classes that should be made available to the JSON class resolver.
