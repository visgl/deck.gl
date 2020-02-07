# RFC: Integrate Aggregation Layers with Attribute Manager

* Authors: Ravi Akkenapally
* Date: October 22, 2019
* Status: **Draft**
* POC: https://github.com/uber/deck.gl/pull/3777

> I am currently experimenting with all required integrations with `Layer` and `AttributeManager` and it is likely some of these proposed solutions could change.


## Overview

`GPUGridAggregator` first introduced in 6.0 has been updated to support CPU and GPU Grid aggregation, multiple coordinate systems and aggregation of multiple weights. Several layers in `@deck.gl/aggregation-modules`, `ScreenGridLayer`, `GPUGridLayer` and `ContourLayer` use `GPUGridAggregator` to perform aggregation to a grid.

Since 6.0, several new features/improvements have happened in other parts of deck.gl, like `extensions` (data filtering, `fp64`  support), `prop types` and `AttributeManager` (like binary data support and optimizations like using const attributes, etc).


## Problem

All new features mentioned above are tied to the `Layer` and `AttributeManager`. In all aggregation layers, aggregation is performed as offline rendering (not part of `Layer.model` and `Layer.draw()`), and `GPUGridAggregator` performs this by building attributes and `Model` object outside of `AttributeManager` and `Layer` lifecycle methods, hence these new features are not available for aggregation layers.


## Proposal

Introduce new composite layer `AggregationLayer`, which owns `GPUGridAggregator`, intercepts required layer lifecycle methods and also setups all attributes using `AttributeManager`. And all of the layers that use `GPUGridAggregator`, must be a `Composite Layer` and extend from `AggregationLayer` to achieve aggregation.

### AggregationLayer

#### Attributes setup

`AttributeManager` is only available for `Layer` and it's subclasses and not available for a `CompositeLayer`. We can create an instance of `AttributeManager` in `AggregationLayer` and provide it to all aggregation layers which can be used for all offline renderings performed for aggregation.

#### Model setup

When an `extension` is enabled, new `attributes`, `uniforms` and shader `modules` need to used in the `Model` construction. These new parameters can be queried in `AggregationLayer` and used to create `Model` object for `GPUGridAggregator`.

When `extension` parameters change, `Layer` will gather new uniforms from corresponding `module` object. We can perform this task in `AggregationLayer` and update `GPUGridAggregator`'s' `Model` object.

#### State tracking

`GPUGridAggregator` maintains its own state and performs least required actions when any state is changed. Given, now we have to integrate with `Layer` lifecycle methods, some of this code may have to be moved from `GPUGridAggregator` into `AggregationLayer` and/or add new methods to `GPUGridAggregator` for state updates.


## Conclusion

Integrating `GPUGridAggregator` with `AttributeManager` and `Layer` lifecycle methods, enable extension like `data-filtering` and all current and future features of `AttributeManager`.
