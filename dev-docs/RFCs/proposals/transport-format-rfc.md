# RFC: Transport Format RFC

* Authors: Xiaoji Chen
* Date: Jan, 2020
* Status: **Draft**

## Summary

This RFC proposes a generic transport format for generating/rendering data cross platforms.

## Background

In v7.3, deck.gl added the `@deck.gl/json` module. It supports generating serializable deck.gl props in non-JavaScript environments and send it to render on the client side. This format is currently used by `pydeck`, deck.gl's Python binding.

We have plans to add bindings for other languages, and potentially non-JS renderers. This calls for a more comprehensive format that can be easily generated, sent, and handled by multiple languages and platforms.

The JSON format has the following shortcomings:

- Efficiency: Serializing/deserializing large data objects with JSON is expensive in terms of both time and space. Network bandwidth, CPU time and memory are all valuable assets when it comes to web applications.
- Updates: It is not possible to update a layer without re-sending the entire snapshot. This is important for animation and/or live data visualization.

A hybrid transport format of both JSON and binary will help address these issues.

## Proposal

Expand the `JSONConverter.convert` API to accept a second argument:

```js
converter.convert(json, buffers);
```

Where `buffers` is a list/map of ArrayBuffers.

In `json`, binary data can be referenced using the following syntax:

```
@@binary[<id>]/<type>/<offset>/<length>
```

- `id`: key in `buffers`
- `type`: one of `int8`, `uint8`, `int16`, `uint16`, `int32`, `uint32`, `float32`, `float64`
- `offset` (optional): byte offset into the buffer, default `0`
- `length` (optional): byte length of the data, default to end of buffer

For example:

```json
{
  "@@type": "PointCloudLayer",
  "data": {
    "length": 10000,
    "attributes": {
      "getPosition": "@@binary[0]/float64",
      "getColor": "@@binary[1]/uint8>"
  }
}
```

### Use Case: get layer config and data separately from server

Pseudo messages from the server:

```
type: json
id: 1000
----
{
  "data": "@@binary[1001]/float64"
}
```

```
type: binary
id: 1001
----
<binary>
```

```
type: json
id: 1002
----
{
  "data": "@@binary[1003]/float64"
}
```

Client side:

```js
let json;
let dataBuffer = <ring buffer>;

function onMessage({data}) {
  if (data.type === 'json') {
    json = data.data;
  } else if (data.type === 'binary') {
    dataBuffer.push(data);
  }

  try {
    const buffers = {};
    dataBuffer.forEach(item => buffers[item.id] = item.data);
    const deckProps = converter.convert(json, buffers);
    deck.setProps(deckProps);
  } catch (err) {
    // Not fully loaded
  }
}
```
