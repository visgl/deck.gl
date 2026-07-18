# Best practice for handling insertion/deletes with _dataDiff and PolygonLayer

- Discussion: https://github.com/visgl/deck.gl/discussions/10220
- **Recommended action:** DRAFT NEW (unanswered)

## Question

A `PolygonLayer` with ~100k entities receives frequent updates including
additions and deletions. What's the best way to re-render efficiently — is
`_dataDiff` the right tool?

## Draft answer

`_dataDiff` is the right tool, with one important caveat about deletions. Some
background on what deck.gl does by default:

When the `data` reference changes (shallow comparison), deck.gl re-runs every
accessor for the whole array to rebuild GPU attributes. For 100k polygons that
tessellation pass is the expensive part. [`_dataDiff`](https://deck.gl/docs/api-reference/core/layer#_datadiff)
(experimental) lets you tell deck.gl *only these row ranges changed*, so it
rebuilds attributes just for those rows:

```js
let data = [...];

function updateItem(index, item) {
  data = data.slice();          // new array reference so deck.gl detects the change
  data[index] = item;
  deck.setProps({
    layers: [
      new PolygonLayer({
        data,
        _dataDiff: (newData, oldData) => [{startRow: index, endRow: index + 1}],
        getPolygon: d => d.contour,
        getFillColor: d => d.color
      })
    ]
  });
}
```

The catch with **insert/delete**: `_dataDiff` returns *row ranges*, and a delete
(or insert) in the middle shifts the index of every following element. If you
`splice()` out row 5 of 100k, rows 5…99999 are all "changed" and you're back to a
near-full rebuild. `_dataDiff` shines for in-place *edits* and for appends/pops at
the **end** of the array (only the tail range changes).

Recommended patterns for frequent mid-array deletes:

1. **Fixed slots + visibility flag (best for churn).** Keep the array length
   stable; instead of splicing, mark rows as removed and hide them with
   [`DataFilterExtension`](https://deck.gl/docs/api-reference/extensions/data-filter-extension)
   (`getFilterValue: d => d.active ? 1 : 0`, `filterRange: [1, 1]`). Deletes and
   re-adds become cheap uniform/attribute-slot updates with no index shifting,
   and `_dataDiff` ranges stay tight.
2. **Append-only + tombstone.** Add new polygons at the end (tail-only diff),
   never remove in place; periodically compact off-thread when the tombstone
   ratio is high.
3. If your `data` object identity is stable but its contents mutate, set a
   [`dataComparator`](https://deck.gl/docs/api-reference/core/layer#datacomparator)
   so deck.gl doesn't treat every render as a full data change.

Also relevant: `PolygonLayer` tessellates on the CPU, so if the polygons
themselves are static and only attributes like color change, drive those through
[`updateTriggers`](https://deck.gl/docs/api-reference/core/layer#updatetriggers)
rather than replacing `data`, and consider binary
[attributes](https://deck.gl/docs/api-reference/core/layer#dataattributes) for
the hot path. See the [Performance guide](https://deck.gl/docs/developer-guide/performance).

## Notes for reviewer

- **Confidence: high on mechanics, medium on the "best" pattern** (depends on the
  asker's insert/delete distribution, which isn't specified — the draft hedges by
  giving the index-shift caveat and two concrete patterns).
- Grounded in `docs/api-reference/core/layer.md`: `_dataDiff` returns
  `{startRow, endRow}` ranges and is **Experimental**; `dataComparator`;
  `updateTriggers` ("change of the `data` prop has higher priority than the
  `updateTriggers`").
- If the reviewer knows of a canonical example repo for `_dataDiff` churn, adding
  a link would strengthen this.
