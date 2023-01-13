# Data Sources and Data Views

# Summary

This RFC proposes defining a system of data sources and data views that will let us separate out complex big data loading logic from deck.gl layers, refine the APIs, and make this logic available to applications for use in analytics and data processing.

## Background

When dealing with really big spatial data, one quickly gets into situations where the total amount of data exceeds the clients capabilities. Over time, the geospatial community have developed a variety of techniques for dealing with this problem (and new techniques are constantly being announced).

| **Technique**                                   | **Example**                   | **Parametrized** |
| ----------------------------------------------- | ----------------------------- | ---------------- |
| Arbitrary rectangular 2D Viewport based queries | WMS (OGC Web Mapping Service) | Y                |
| Regular 2D Tile based queries                   | MVT (Mapbox Vector Tiles)     | N                |
| Arbitrary 2D regions                            | COG (Cloud-Optimized GeoTIFF) | Y\*              |
| Regular 3D Tiles                                | potree                        | N                |
| Dynamic 3D Tiles                                | 3D Tiles, I3S                 | N                |

- The parametrized column indicates whether those services always return the same data (such as mapbox vector tiles) or if the data depends on the query parameters (WMS).

| **Query Pattern**                                              | **Example**                   | **Parametrized** |
| -------------------------------------------------------------- | ----------------------------- | ---------------- |
| Single query against custom Viewport                           | WMS (OGC Web Mapping Service) | Y                |
| Multiple queries against regular (pre-computable) tile indices | MVT (Mapbox Vector Tiles)     | N                |
| Multiple queries against non-regular tile indices              | 3D tiles                      |

## Data View

Common to essentially all big data management techniques is the idea of being able to load and work on limited subsets of the (here referred to as "Data Views").

A data view can be seen as a subset of the overall data resulting from loading the data that matches a certain set of constraints:

A data view query is typically defined by parameters like:

- bounds
- time range
- layers / bands / ...
- data source specific (keywords etc)

For some datasets, such a data view represents the overall

## Spatial Views for visualization

For views corresponding to imperative data queries, it is less relevant to cache data, however for visualization purposes it is quite important to ensure that data is not unnecessarily reloaded.

The use case that is assumed here is that the application wants to connect one or more visualization "layers" to the data source, and also potentially render these layers in one or more "views" (representing the spatial boundaries of what is displayed).

For data sources that serve different data dependent on layer parameters, the layer would have a certain set of query parameters, however this could vary between layers - so data sharing between layers may not be taken for granted.

The DataViewManager proposal below addresses this use case.

## Proposals

## Proposal: DataSource Class (P1)

Since there are a number of different ways big data is served (flat file, WMS, MVT, GeoTIFF) etc, it would be useful to have some abstraction around a data source. This would allow adapters for various data sources to be created and used interchangeably.

The challenges here are to create a heavy class hierarchy and to minimize the amount of assumptions that is made about a data source. New data sources can be different in surprisingly subtle ways, so the less assumed, the more future proof the system is.


## Proposal DataView class (P2)

We could support a "lazy API" - the approach is to allow applications to create DataView instances that store parameters for a query and spatial extents and pass them around without actually loading the data until it is accessed. 

This is often interesting when wishing to emulate an existing API, such as DataFrames.

However, at the moment, no such existing API has been identified and the `DataViewManager` class seems more directly useful.

## Proposal: DataViewManager Class (P0)

We would provide a class that based on a dataSource maintained a number of queries into that dataSource (parameters) and a number of spatial extents (representing views).

Each deck.gl layer initialized with a DataViewManager would register a query (forwarding any layer props that affect what data is loaded), and then views would be updated to match the current views).

Loading for each layer(query)/view combination would happen asynchronously. Partial (tiles) and full loads of a view would trigger a callback so that the layer can rerender.

In partial pseudo-code:

```typescript
class DataViewManager {
  queries: Record<name, Query>; // Non spatial
  spatialViews: Record<name, Views>; // Spatial extents

  constructor(dataSource: DataSource) {
    dataSource = dataSource;
  }

  addQuery(name, parameters, onQueryChanged);
  updateQuery(name);
  removeQuery(name);

  addSpatialView(name, bounds, onViewUpdated, onViewLoaded);
  updateSpatialView(name, bounds);
  removeSpatialView(name);

  // Synchronously query the available data
  // Usually called by layers in response to onDataChanged callback
  getLoadedData(queryName: string, viewName: string): DataT | null;

  // Application can also make direct queries against the data source
  // For a tiled data source this could often result in tiles already cached by
  // the views being returned
  queryData(parameters, bounds): Promise<DataT>;
}
```

Concern: Layer filters

One limitation with this `layers`x`views` approach is that it doesn't take layer filters into consideration. It could be possible to forward the `layerFilter` callbacks, though the layer filtering system in deck.gl is something of a hack.

Instead of adding support for the "legacy" deck.gl props directly, perhaps the DataViewManager API should focus on just letting the application specify which layers (queries) one is interested in on each view, and leave it to deck.gl to translate its props and callbacks into simple id lists.

Concern: Request scheduling and cancellation

Request scheduling and cancellation are tricky topics. it would likely make sense to build on the loaders.gl `RequestScheduler` class though there are still corner cases that need to be covered in the application. 


## Proposal: Integration with the deck.gl resource system (P1)

deck.gl has introduced an experimental resource management system to handle a couple of important requirements:

- Data sharing between layers - A useful technique in deck.gl is to create multiple layers visualizing the same dataset, composing their visuals to achieve the intended effect (e.g. a smaller circle inside a bigger circle can be achieved by using two `ScatterplotLayer` with different radius props. However unless the application loads and manages the data itself, deck.gl may end up loading the same data twice.
- Access to data outside of layers - Applications may well want to query their data sources directly, not just pass them to deck.gl. The resource system doesn't appear to address this today but should be easily extendable to do so.

Now, it would appear that `DataSource` instances proposed in this RFC could be made to fit perfectly as "resources" in the deck.gl resource manager, and it could make sense that the implementation of this PR would include an overhaul of the resource system and graduating it to production status.

Question: If the resource system can be made completely UI-independent, consider moving it out of `@deck.gl/core` into a more basic unit (or perhaps even into a loaders.gl module?).



## Excluded use cases

The big data support here is primarily focused on data with clear spatial extents. There are many approaches to dealing with big data, in particular when that data is not spatially organizable.

- Streaming processing - large datasets can sometimes be processed row by row by streaming them through memory. This is not covered by data view solution.


## Existing Code: DataViewManager

The 3D tiles team has already had to tackle the layer x viewport caching problem. 

There is some non-generic code for this in loaders.gl, e.g.: https://github.com/visgl/loaders.gl/blob/master/modules/tiles/src/tileset/traversers/i3s-pending-tiles-register.ts

Ideally, if this RFC is implemented, the DataView classes described here could be leveraged and some of that code could be removed.


## Prior Art: Data View

The Data View concept is not new. There are many instances of prior art:

- pyspark - as a random example, pyspark allows DataFrame compatible objects to be created that don't load data until actually accessed.
