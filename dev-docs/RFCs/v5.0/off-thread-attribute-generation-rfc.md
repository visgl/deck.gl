# RFC: Off-Thread Attribute Generation

* **Author**: Xiaoji Chen
* **Date**: Aug, 2017
* **Status**: Deferred

Notes:
* This RFC was deferred to limitations that were discovered during the review, which reduce the use case. With more effort these limitations could be removed in the futre.
* This RFC assumes that the `dataUrl` RFC has been approved and implemented. Parts of that RFC were originally part of this RFC, but broken out as that proposal has a much wider applicability independently of the features described here.


## Motivation

As I was working on performance-sensitive applications, I observed that loading very large data objects into a layer causes the main thread to freeze.

There are several areas that may become computationally intensive as the size of the data grow:
* **JSON.parse** - For example, downloading a 50M point cloud file in JSON format cause the UI to be inresponsive for several seconds, and most of that time is spent parsing the text string.
* **Data transformation** - If the raw data is not an array that maps 1-to-1 with layer geometries (which is, most of the time), pre-processing is necessary before passing it into the data prop.
* **Attribute updates** - Some core layers have relatively heavy attribute updaters, for example `PolygonLayer` (triangulation) and `GridLayer` (aggregation). Moreover, users may provide complex accessors that further impact the performance.

The proposed solution is to offer an option to move the above processes off the main thread. By doing so we improve the UI responsiveness and potentially the performance by processing data in parallel.

## Proposed Implementation

I have successfully moved the data processing for PointCloudLayer into a worker in a reference application. The key in doing so is utilizing `transferList` in passing messages among threads. Serialization typically defeats the advantages of off-thread processing when exchanging large data objects. The `transferList` interface avoids serialization by passing typed arrays by reference.


### Layer life cycle changes

* (Main) If a layer’s dataRequest prop is specified, when it changes, LayerManager creates a one-time Promise that downloads it as ArrayBuffer. Mark the layer’s life cycle as PENDING_PROCESSING and skip rendering.
* (Main) When the download resolves, create a worker thread using webworkify or similar techniques. Pass the ArrayBuffer as rawData, the layer constructor and all of its props into the worker.
* (Worker) If dataRequest specifies the data type to be json (default) or text, convert rawData using DataView and TextDecoder. Transform the result with dataConverter.
* (Worker) Assign the transformed result to the data prop of the layer, and initialize it.
* (Worker) When initialization is done. Post rawData and the calculated attributes back to the main thread.
* (Main) Save rawData in layer state. Call AttributeManager to update all attributes using custom buffers. Update the layer’s life cycle to INITIALIZED and treat as regular layer.
* (Main) If attribute update is triggered: Create a new worker (step 2).


### Limitations

* Though layer initialization is accelerated, updates may now be slower because of the message exanchage between threads.
* Does not work on composite layers (which importantly/unfortunately includes the GeoJsonLayer).
