# TableBufferPlanner

> The attribute manager uses an internal planner to translate binary table columns into GPU buffers.

The planner is designed to translate a columnar binary table on the CPU into GPU buffers. It intentionally lets users and layer authors think in terms of binary columnar table data rather than the details of how GPU memory is rendered.

A primary goal is to keep CPU-side binary table columns columnar on the GPU when possible:

* Separate non-interleaved column buffers are preferred because they let an application upload one column as-is.
* Interleaving is used only when the GPU binding model requires it, for example when attributes need to share limited vertex buffer slots, or when constants need to be represented as real buffers.

In deck.gl terms, a layer consumes rows, and each attribute is a column over those rows. The planner then decides how those columns should be represented as GPU buffers while preserving table semantics and staying within device limits.

The planner only decides buffer allocation and layout. `AttributeManager`, `DataColumn`, and `Attribute` remain responsible for populating buffers, handling accessor values, constants, typed array layout, shader attribute views, and fp64 high/low handling.

## Table Planner Modes

The table planner can handle two primary GPU rendering models:

* `table-with-shared-geometry`: instanced shaders where a single geometry is being reused to render each row;
* `table-with-row-geometries`: non-instanced shaders where a custom variable length geometry is provided for each table row.

The planner mode determines:

* how table columns are mapped to vertex and storage buffers.
* what one table row maps to at draw time.
* how constant columns are laid out in buffers.

| Planner mode                         | Row geometry                                         | Row data binding        | Constants step mode      | Constants length          |
| ------------------------------------ | ---------------------------------------------------- | ----------------------- | ------------------------ | ------------------------- |
| `table-with-shared-geometry`         | one separate shared geometry rendered once for each table row | `stepMode: 'instance'` (one step per table row) | `stepMode: 'vertex'`     | shared geometry vertex count |
| `table-with-row-geometries`          | a variable number of geometry vertices for each table row | `stepMode: 'vertex'` (multiple steps per table row) or **storage buffers** (one step per table row) | `stepMode: 'instance'`   | 1 (single instance)       |

`table-with-shared-geometry` is selected when `modelInfo.isInstanced !== false`. One separate shared geometry is rendered once for each table row. Examples include rendering a circle, icon, or line segment for each row in the table. Table columns are normally instance-rate attributes, while attributes that describe the shared geometry are vertex-rate attributes.

`table-with-row-geometries` is selected when `modelInfo.isInstanced === false`. Each table row owns or generates a variable number of geometry vertices, such as a polygon or path. Table columns that conceptually have one value per table row may need to be available at every generated vertex for that table row.

## Usage

`TableBufferPlanner` works from abstract table column descriptors. It does not know about `Attribute`, `DataColumn`, accessors, typed array normalization, or GPU buffer uploads. Callers describe the columns they want to render, then use the returned plan to allocate buffers, build model layouts, and decide which columns need planner-owned packing.

For a layer with shared instanced geometry, describe the reusable geometry as vertex-rate columns and table data as instance-rate columns:

```ts
const plan = TableBufferPlanner.getAllocationPlan({
  id: 'scatterplot',
  device,
  modelInfo: {isInstanced: true},
  generateConstantAttributes: device.type === 'webgpu',
  isTransitionAttribute: name => transitionManager.hasAttribute(name),
  columns: [
    {
      id: 'positions',
      byteStride: 8,
      byteLength: 8 * 4,
      rowCount: 4,
      stepMode: 'vertex'
    },
    {
      id: 'instancePositions',
      byteStride: 12,
      byteLength: 12 * objectCount,
      rowCount: objectCount,
      stepMode: 'instance',
      isPosition: true,
      supportsPackedBuffer: true,
      priority: 'high'
    },
    {
      id: 'instanceFillColors',
      byteStride: 4,
      byteLength: 4 * objectCount,
      rowCount: objectCount,
      stepMode: 'instance',
      supportsPackedBuffer: true
    }
  ]
});
```

The returned `plan.groups` are the GPU allocation groups to publish to the model. `plan.mappingsByColumnId` tells the caller which buffer group and shader-visible attribute name each source column maps to. `plan.packedColumnIds` tells the attribute manager which columns should compute CPU values but skip creating their own standalone GPU buffers.

For row geometries, set `modelInfo.isInstanced: false`. Table data columns that vary once per source row may be expanded as vertex attributes today, or marked as planner-only storage buffer groups when `useStorageBuffers` is enabled:

```ts
const plan = TableBufferPlanner.getAllocationPlan({
  id: 'polygons-fill',
  device,
  modelInfo: {isInstanced: false},
  useStorageBuffers: device.type === 'webgpu',
  generateConstantAttributes: device.type === 'webgpu',
  isTransitionAttribute: () => false,
  columns: [
    {
      id: 'positions',
      byteStride: 12,
      byteLength: 12 * vertexCount,
      rowCount: vertexCount,
      stepMode: 'vertex',
      isPosition: true,
      supportsPackedBuffer: true
    },
    {
      id: 'fillColors',
      byteStride: 4,
      byteLength: 4 * polygonCount,
      rowCount: polygonCount,
      stepMode: 'vertex',
      supportsPackedBuffer: true,
      priority: 'high'
    }
  ]
});
```

When storage planning is enabled and the device limits allow it, `plan.storageColumnIds` identifies table columns assigned to `separate-storage-column` or `stacked-storage-columns` groups. Storage groups are currently planner output only; model binding code still needs a storage-buffer implementation before using them for rendering.

## TableBufferPlan

`TableBufferPlan` is the planner output consumed by the attribute manager and model-binding code. It contains ordered allocation groups, per-column reverse lookups, model binding mappings, and sets that identify columns represented by planner-owned vertex buffers or storage-buffer groups.

### Row Lookup Columns

In `table-with-row-geometries`, the planner can add generated columns that reconnect generated vertices to source table rows:

* `rowIndex: uint32`: the source row index for each generated vertex;
* `pickingColors: uint8x4`: the picking color encoded from the source row index. Shaders may consume only the first three components.

These generated columns are vertex-rate data columns. They are never packed into the one-row constants buffer and are not eligible for storage-buffer planning.

### Column Classes

The planner first classifies every attribute as a table column with one of these roles:

* `position-attribute-columns`: geometry-defining columns. Positions stay separate because they usually define the generated vertex count and precision behavior. A layer may have multiple named position columns, such as source and target positions; any `positions` column or `*Positions` column is treated as a position column.
* `interleaved-constant-attribute-columns`: columns whose value is the same for all logical rows. WebGPU does not support constant attributes directly, so constants are represented by a small real buffer with the opposite step mode from primary data.
* `data`: ordinary table columns that vary by row.
* `generated`: planner-owned helper columns such as `rowIndex` and generated `pickingColors`.
* `unmanaged-attribute-column`: columns that the attribute manager cannot safely own or pack.

Attributes remain unmanaged when packing would change behavior or when the attribute manager cannot own the CPU data. This includes indexed attributes, transition attributes, external GPU-buffer-only attributes, most `noAlloc` attributes, and unsupported double-precision non-position attributes. Generated CPU-backed picking colors are the `noAlloc` exception: they may be planner-managed to avoid consuming an unmanaged vertex-buffer slot.

### Position Columns

Position columns describe geometry and are treated specially because they affect vertex interpretation and precision. A column is considered a position column when `isPosition` is set by the caller. deck.gl's `AttributeManager` currently sets this for `positions` and `*Positions` attributes, which covers common columns such as `instancePositions`, `instanceSourcePositions`, and `instanceTargetPositions`.

For fp32 positions, the planner maps the source column directly to a position attribute column. The shader-visible attribute name is the source column id, and no extra low-part mapping is generated.

For fp64 positions, the source column may produce two shader-visible attribute mappings: the high component, named by the source column id, and the low component, named `${id}64Low`. The physical placement of the low component is not fixed:

* When the position column stays unmanaged, or when constant-buffer emulation is not enabled, the primary position buffer may publish both high and low component attributes together.
* When the planner owns the position column and constant buffers are enabled, the primary `position-attribute-columns` group publishes the high component, while `interleaved-constant-attribute-columns` may publish the low component as a small constant low-part column.

Callers should therefore read `plan.mappingsByColumnId` instead of assuming that `${id}64Low` is colocated with the primary position buffer. Multiple fp64 position columns can each produce their own low-part mapping.

### Buffer Groups

The planner emits buffer groups from the classified columns.

| Group kind                                    | Shape                                                        |
| --------------------------------------------- | ------------------------------------------------------------ |
| `interleaved-shared-geometry-columns`         | interleaved vertex-rate attribute columns for reusable shared geometry |
| `position-attribute-columns`                  | position attribute columns, including fp64 high position components |
| `interleaved-constant-attribute-columns`      | interleaved constant attribute columns and fp64 low columns  |
| `separate-attribute-column`                   | one non-interleaved vertex buffer for one ordinary attribute column |
| `interleaved-attribute-columns`               | interleaved fallback for lower-priority attribute columns when vertex buffer slots are scarce |
| `separate-storage-column`                     | optional WebGPU storage buffer for one original table column |
| `stacked-storage-columns`                     | optional WebGPU storage buffer containing multiple whole-column slices |
| `unmanaged-attribute-column`                  | unmanaged attribute column that keeps its existing allocation path |

For `table-with-shared-geometry`, ordinary table columns are instance-rate. The planner assigns them to `separate-attribute-column` groups while vertex buffer slots are available, then packs lower-priority columns into `interleaved-attribute-columns`. Constants use a vertex-rate `interleaved-constant-attribute-columns` buffer sized to the shared geometry vertex count, so each instance reuses the same constant values across its vertices.

For `table-with-row-geometries`, generated vertices are the primary vertex stream. Positions and generated row lookup columns are vertex-rate. Ordinary constants use a single-entry instance-rate `interleaved-constant-attribute-columns` buffer, so constant values are not expanded across every generated vertex.

### Optional Storage Buffers

`useStorageBuffers?: boolean` lets the planner mark eligible inline row-geometry data columns as storage buffers on WebGPU. This is currently a planner-only allocation mode; attribute population and model binding do not consume it yet.

Storage-buffer planning exists to keep GPU storage identical to CPU storage for binary table columns. Instead of expanding one row value across every generated vertex for that row, the column can remain a contiguous source table column. A shader can use the vertex-rate `rowIndex` attribute to index the storage column and recover the source row value.

Storage buffer planning is intentionally narrow:

* it only applies on WebGPU;
* it only applies in `table-with-row-geometries`;
* it applies to non-position, non-constant data columns;
* generated per-vertex row lookup columns such as `rowIndex` and `pickingColors` remain vertex-rate attributes;
* each `separate-storage-column` group contains exactly one source column, preserving the original column bytes and row indexing;
* each `stacked-storage-columns` group contains multiple source columns as contiguous column slices, with one byte offset per column; it does not interleave columns by row;
* `stacked-storage-columns` column starts use conservative 256-byte alignment so future binding and shader paths can satisfy WebGPU storage-buffer offset requirements;
* unmanaged attribute column exclusions still apply.

The planner observes WebGPU storage buffer limits before emitting storage groups:

* `maxStorageBuffersPerShaderStage` limits how many columns can become storage buffers;
* `maxStorageBufferBindingSize` limits the byte length of each storage buffer.

Each storage-eligible column gets a `separate-storage-column` group while storage bindings are available. If storage bindings are scarce, the planner reserves one binding for `stacked-storage-columns` and concatenates remaining storage-eligible columns into that buffer as whole-column byte ranges. Each range starts on a 256-byte boundary. Columns that do not fit the storage binding count or binding-size limits fall back to ordinary vertex buffer allocation.

The first implementation does not use dynamic storage buffer offsets, but the overflow layout already keeps column boundaries conservatively aligned.

### Buffer Updates

Packed groups use a shared interleaved `Uint8Array` owned by the attribute manager. The manager allocates the group and tracks byte stride, byte offsets, and GPU buffer state. Each `Attribute` writes only its own column into that shared array. On layout changes, resizes, or new groups, the manager repacks the whole group. Otherwise it rewrites only the changed attributes in the group, then uploads the packed buffer once.

Storage-buffer groups are planner output only for now. They describe future columnar bindings; current attribute population does not upload or bind them as storage buffers.

### WebGPU Constraints

The planner exists largely because WebGPU is stricter than WebGL:

* render pipelines have a fixed maximum number of vertex buffer slots, typically 8;
* attributes sharing one vertex buffer must be interleaved and observe alignment rules;
* constant attributes must be represented by real buffers;
* storage-buffer planning must observe per-stage storage binding counts and maximum storage binding sizes.
