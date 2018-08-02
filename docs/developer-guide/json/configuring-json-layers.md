# Configuring JSON Layers (Experimental)

## Object catalogs

The JSON framework inspects the "raw" parsed JSON data structure before supplying it to deck.gl as props. One thing this conversion process needs to is to replace certain objects in the structure with instances of objects. This happens by default for layers and views:

```json
{
  "layers": {
  	"type": "ScatterplotLayer",
  	"data": "..."
  }
}
```

is replaced by the `JSONDeck` component with

```js
new ScatterplotLayer({data})
```

When the `JSONDeck` component finds a "type" field it looks into a "layer catalog".
