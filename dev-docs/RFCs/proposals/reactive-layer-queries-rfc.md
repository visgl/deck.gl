# RFC: Reactive layer queries

- Status: Draft
- Date: November 18, 2026

## Motivation

An earthquake map might load a year of observations once, show only large earthquakes at low zoom, and reveal smaller ones as the user zooms in. Fetching the same observations again on each zoom would waste bandwidth. Running a local SQL query on every camera update would also waste work when the magnitude threshold stays the same.

## Proposed layer props

| Prop | Meaning |
| --- | --- |
| `dataQuery?: string` | SQL over the source described by `data`. A source-capable loader can push supported filters and projections into the read. |
| `reactiveQuery?: string` | SQL over the loaded Arrow table. Its result supplies the layer's effective data for rendering and picking. |
| `reactiveQueryParameters?: SQLParameters` | Named SQL values supplied by the application. Each statement depends only on the names it references. Keys are case-sensitive and omit the leading colon. |

Both statements use `FROM data`. In `dataQuery` this refers to the original source. In `reactiveQuery` it refers to the table produced by `dataQuery`, or to the normally loaded table when `dataQuery` is omitted. Columns used by the second statement must appear in that input table. Omitting `reactiveQuery` passes the source result straight to the layer. Omitting both preserves the existing data path.

The parameter map is shared so an application can bind source filters as well as interactive filters. Putting a parameter in `dataQuery` explicitly opts into requerying the source when that value changes. Parameters are bound as typed values through math.gl. A referenced name with no binding is a query error.

## Supplying viewport parameters

The application selects a view and derives SQL values from its view state. For example, in a controlled map, the application stores the zoom from `onViewStateChange` and supplies the following props when it constructs the next layer with the same ID:

```ts
const queryProps = {
  data: earthquakesUrl,
  loaders: [ParquetLoader],
  dataQuery: `
    SELECT longitude, latitude, magnitude
    FROM data WHERE event_year = :year
  `,
  reactiveQuery: 'SELECT * FROM data WHERE magnitude >= :minMagnitude',
  reactiveQueryParameters: {
    year: selectedYear,
    minMagnitude: viewState.zoom < 6 ? 5 : 2
  }
};
```

Panning leaves both bindings unchanged. Zooming from 5 to 6 changes only `minMagnitude` and reruns the local query. Zooming from 7 to 8 changes neither binding. Changing the year reruns the source query and then filters the new table at the current threshold.

For a spatial filter, the application can derive bounds from its chosen viewport and supply individual values such as `south` and `north` for a predicate like `latitude BETWEEN :south AND :north`. Recompute bounds when that viewport resizes as well as when its camera moves. deck.gl injects no implicit camera parameters. In a multi-view application, a shared layer has one query result across its views. Applications that need distinct results can supply separate layer IDs and bindings for each view and select the appropriate layer with `layerFilter`.

## Execution and invalidation

| Update | Source stage | Reactive stage |
| --- | --- | --- |
| First load or a change to the source data, loader, or effective load options | Load or run `dataQuery` | Run on the resulting table |
| Add, edit, or remove `dataQuery`, or change a value it references | Read the source using the new configuration | Run on the resulting table |
| Add or edit `reactiveQuery`, or change a value referenced only there | Reuse the loaded table | Run with current bindings |
| Remove `reactiveQuery` | Reuse the loaded table | Expose that table directly |
| Change an unused binding, supply equivalent values in a new object, or redraw with unchanged inputs | Reuse the loaded table | Reuse the current result |

If both queries reference a changed name, run the source stage first, then run the reactive stage once on its result. A new table delivered by the source also invalidates the reactive result. For a streaming source that publishes cumulative table snapshots, apply the reactive query to the latest snapshot so operations such as aggregates see all available rows.

Discover names with `getSQLParameterNames` when a statement changes. On a parameter update, call `prepareSQLParameters` with the previous snapshot and use `areSQLParametersEqual` with each statement's referenced names. Compare against the inputs that produced the current result. A changed binding should trigger the layer's data update path only when it yields a new effective table. [math.gl parameter snapshot API](https://github.com/visgl/math.gl/pull/604)

During an asynchronous source read, a change confined to the reactive stage leaves the read in flight. Apply the latest reactive SQL and bindings when the table arrives. If a newer source read supersedes it, discard the obsolete completion. Publish only results that still match the current source and reactive inputs, and report query errors through the layer error path.

## Validation

Use an instrumented source loader and verify both query execution counts and rendered rows. Exercise the zoom transitions above, a year change, a parameter shared by both statements, and an unused binding. Remove the reactive query and verify that all source rows become available without another read. Delay two source reads and complete them in reverse order while changing the magnitude threshold. The final rows must match the newest year and threshold.
