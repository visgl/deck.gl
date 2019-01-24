# H3HexagonLayer (Experimental)

Adapts the deck.gl HexagonLayer to work directly with data encoded by H3 hexagon ids, meaning that the application does not have to calculate hexagon centroid lat/longs.

Just add your hexagonId encoded data container to the data prop of the layer, and supply a couple of accessors to get the hexagonId (and color/elevation etc) for each object, and you have a highly peformant hexagon overlay.

Callbacks - Also sets the `hexagonId` field in the `onHover`/`onClick` callback `info` parameters. Since this field is calculated using math (rather than using WebGL picking). hexagonId will be present even when no corresponding hexagon is in the data set. You can check `info.index !== -1` to see if the selection matches an actual object.

## Accessors

The same properties and accessors as `HexagonCellLayer`

* `getHexagonId` - accessor, tells the layer how to get hexagonIds from the objects in the data container. Defaults to returning `object.hexagonId`.
