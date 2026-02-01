# RFC: Key-Based Attribute Transitions

* **Authors**:
* **Date**: February 2026
* **Status**: Draft
* **Related Issue**: [#2570](https://github.com/visgl/deck.gl/issues/2570)

## Summary

This RFC proposes adding support for custom key accessors in layer attribute transitions. Currently, transitions match objects by array index, causing incorrect animations when data is reordered, filtered, or when items are added/removed mid-array. This proposal introduces an optional `getKey` accessor that allows developers to specify object identity, enabling correct transitions regardless of array position.

## Background & Motivation

### Current Behavior

When a layer's data changes and transitions are enabled, deck.gl animates attribute values between the old and new states. The current implementation matches objects **by array index**:

```js
// Frame 1
data: [{ id: 'a', x: 0 }, { id: 'b', x: 10 }]

// Frame 2 - objects swapped
data: [{ id: 'b', x: 20 }, { id: 'a', x: 30 }]

// Current behavior: animates index 0→0 and 1→1
// - Object 'a' (was at x:0) animates to x:20 (wrong - that's 'b's position)
// - Object 'b' (was at x:10) animates to x:30 (wrong - that's 'a's position)
```

### Problems

1. **Sorting**: Any sort operation causes all objects to animate to wrong positions
2. **Filtering**: Removing an item causes subsequent items to animate incorrectly
3. **Insertions**: Adding items mid-array shifts all subsequent animations
4. **Real-time data**: Streaming data with unpredictable ordering cannot use transitions

### User Impact

Issue #2570 has 13+ reactions and has been open since 2019, indicating significant community demand. Current workarounds include:
- Maintaining stale objects with opacity 0 (wasteful)
- Padding arrays to keep indices stable (complex, error-prone)
- Disabling transitions entirely (poor UX)

## Proposal

### API Design

Add an optional `getKey` accessor to transition settings:

```js
new ScatterplotLayer({
  data,
  transitions: {
    // Simple form (existing) - no key, uses index matching
    getPosition: 1000,

    // Object form with key accessor (new)
    getPosition: {
      duration: 1000,
      easing: d3.easeCubicInOut,
      getKey: d => d.id  // NEW: specify object identity
    },

    // Also works with enter/onStart/onEnd callbacks
    getRadius: {
      duration: 500,
      getKey: d => d.id,
      enter: () => [0]  // New objects animate from radius 0
    }
  }
})
```

### Type Definitions

```typescript
// In transition-settings.ts

type KeyAccessor<DataT = any> = (object: DataT, objectInfo: AccessorContext<DataT>) => string | number;

export type TransitionSettings = {
  type?: 'interpolation' | 'spring';
  duration?: number;
  easing?: (t: number) => number;
  enter?: (value: number[]) => number[];
  onStart?: () => void;
  onEnd?: () => void;
  onInterrupt?: () => void;

  /**
   * Optional accessor to determine object identity across data updates.
   * When provided, transitions will correctly animate objects that change
   * position in the data array. Without this, objects are matched by index.
   *
   * @example
   * getKey: d => d.id
   * getKey: (d, {index}) => `${d.category}-${index}`
   */
  getKey?: KeyAccessor;
};
```

### Behavior

| Scenario | Without `getKey` | With `getKey` |
|----------|------------------|---------------|
| Object moves in array | Animates to wrong target | Animates correctly |
| Object added mid-array | Shifts subsequent animations | Only new object uses `enter` |
| Object removed | Shifts subsequent animations | Only removed object exits |
| Object unchanged but reindexed | Unnecessary animation | No animation (correctly detected as unchanged) |

### Edge Cases

1. **Duplicate keys**: If `getKey` returns duplicate values, fall back to index-based matching for duplicates and log a warning in development mode.

2. **Missing keys**: If `getKey` returns `undefined` or `null`, treat the object as new (use `enter` values).

3. **Key type coercion**: Keys are compared using strict equality. String `"1"` and number `1` are different keys.

4. **Partial transitions**: When only some attributes have `getKey`, only those attributes use key-based matching. Others continue to use index matching.

## Implementation

### Architecture Overview

```
Layer.updateState()
  → AttributeManager.update()
    → AttributeTransitionManager.update()
      → buildKeyMapping(oldKeys, newData, getKey)  // NEW
      → GPUTransition.start(settings, numInstances, keyMapping)
        → padBuffer(..., keyMapping)  // MODIFIED
          → reorderSourceBuffer(keyMapping)  // NEW
        → GPU shader (unchanged)
```

### Key Components

#### 1. Key Storage (AttributeTransitionManager)

Store previous keys per attribute to compare on next update:

```typescript
// attribute-transition-manager.ts

class AttributeTransitionManager {
  private previousKeys: Map<string, Map<string | number, number>> = new Map();

  update({attributes, transitions, numInstances, data}) {
    for (const attributeName in attributes) {
      const settings = attribute.getTransitionSetting(transitions);
      if (!settings) continue;

      let keyMapping: KeyMapping | undefined;

      if (settings.getKey) {
        const newKeys = this.buildKeyMap(data, settings.getKey);
        const oldKeys = this.previousKeys.get(attributeName);

        if (oldKeys) {
          keyMapping = this.computeKeyMapping(oldKeys, newKeys);
        }

        this.previousKeys.set(attributeName, newKeys);
      }

      this._updateAttribute(attributeName, attribute, settings, keyMapping);
    }
  }

  private buildKeyMap(data, getKey): Map<string | number, number> {
    const keyMap = new Map();
    let index = 0;
    for (const object of createIterable(data)) {
      const key = getKey(object, {index, data, target: []});
      if (keyMap.has(key)) {
        log.warn(`Duplicate transition key: ${key}`)();
      } else {
        keyMap.set(key, index);
      }
      index++;
    }
    return keyMap;
  }

  private computeKeyMapping(oldKeys, newKeys): KeyMapping {
    const mapping: KeyMapping = {
      // oldIndex → newIndex for objects that exist in both
      indexMap: new Map(),
      // indices of objects that are new (not in old data)
      newIndices: [],
      // indices of objects that were removed (not in new data)
      removedIndices: []
    };

    for (const [key, newIndex] of newKeys) {
      const oldIndex = oldKeys.get(key);
      if (oldIndex !== undefined) {
        mapping.indexMap.set(oldIndex, newIndex);
      } else {
        mapping.newIndices.push(newIndex);
      }
    }

    for (const [key, oldIndex] of oldKeys) {
      if (!newKeys.has(key)) {
        mapping.removedIndices.push(oldIndex);
      }
    }

    return mapping;
  }
}
```

#### 2. Buffer Reordering (gpu-transition-utils.ts)

Modify `padBuffer` to reorder source data according to key mapping:

```typescript
// gpu-transition-utils.ts

export function padBuffer({
  device,
  buffer,
  attribute,
  fromLength,
  toLength,
  fromStartIndices,
  getData = x => x,
  keyMapping  // NEW parameter
}: {
  // ... existing params
  keyMapping?: KeyMapping;
}): Buffer {

  // If no key mapping, use existing index-based logic
  if (!keyMapping) {
    return padBufferByIndex(/* existing implementation */);
  }

  // Key-based reordering
  const fromData = readBufferData(buffer, fromLength);
  const toData = new Float32Array(toLength);
  const size = attribute.size;

  // Copy data according to key mapping
  for (const [oldIndex, newIndex] of keyMapping.indexMap) {
    const srcOffset = oldIndex * size;
    const dstOffset = newIndex * size;
    for (let i = 0; i < size; i++) {
      toData[dstOffset + i] = fromData[srcOffset + i];
    }
  }

  // Fill new objects with enter values
  for (const newIndex of keyMapping.newIndices) {
    const enterValue = getData(newIndex);
    const dstOffset = newIndex * size;
    for (let i = 0; i < size; i++) {
      toData[dstOffset + i] = enterValue[i] ?? 0;
    }
  }

  return device.createBuffer({data: toData});
}
```

#### 3. Multi-Vertex Objects (Paths, Polygons)

For layers with `startIndices` (variable vertices per object), the mapping must account for vertex counts:

```typescript
function reorderWithStartIndices(
  fromData: TypedArray,
  fromStartIndices: number[],
  toStartIndices: number[],
  keyMapping: KeyMapping,
  size: number
): TypedArray {
  const toLength = toStartIndices[toStartIndices.length - 1] || 0;
  const toData = new Float32Array(toLength * size);

  for (const [oldIndex, newIndex] of keyMapping.indexMap) {
    const srcStart = fromStartIndices[oldIndex] * size;
    const srcEnd = fromStartIndices[oldIndex + 1] * size;
    const dstStart = toStartIndices[newIndex] * size;

    // Copy all vertices for this object
    const srcChunk = fromData.subarray(srcStart, srcEnd);
    toData.set(srcChunk, dstStart);

    // Handle vertex count changes (pad or truncate)
    const srcVertices = (srcEnd - srcStart) / size;
    const dstVertices = (toStartIndices[newIndex + 1] - toStartIndices[newIndex]);

    if (dstVertices > srcVertices) {
      // Pad with last vertex value
      const lastVertex = fromData.subarray(srcEnd - size, srcEnd);
      for (let v = srcVertices; v < dstVertices; v++) {
        toData.set(lastVertex, dstStart + v * size);
      }
    }
  }

  return toData;
}
```

### Performance Considerations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Build key map | O(n) | One pass through data |
| Compute mapping | O(n) | Map lookups are O(1) |
| Reorder buffer | O(n) | One pass, cache-friendly |
| Memory overhead | O(n) | Store key→index map between frames |

For a dataset of 100,000 objects:
- Key map: ~4-8MB (depending on key size)
- Mapping computation: <10ms
- Buffer reorder: <5ms

This is acceptable for most use cases. For very large datasets (1M+ objects), users can omit `getKey` to use the faster index-based path.

### Memory Management

- Key maps are stored per attribute with transitions
- Maps are cleared when layer is destroyed
- Maps are replaced (not accumulated) on each update

## Alternatives Considered

### 1. Layer-Level `getObjectKey` Prop

```js
new ScatterplotLayer({
  data,
  getObjectKey: d => d.id,  // Applies to all transitions
  transitions: { getPosition: 1000 }
})
```

**Pros**: Simpler API, single key for all attributes
**Cons**: Less flexible, keys may differ per attribute in some cases

**Decision**: Could add this as syntactic sugar later, but per-attribute keys are more flexible as the foundation.

### 2. Automatic Key Detection

Automatically use `data[].id` or `data[].key` if present.

**Pros**: Zero configuration for common cases
**Cons**: Magic behavior, may conflict with user's `id` field that isn't meant for transitions

**Decision**: Explicit is better than implicit for this feature.

### 3. D3-Style Join Semantics

Full enter/update/exit with separate callbacks and data binding.

**Pros**: Maximum flexibility, familiar to D3 users
**Cons**: Significant API complexity, major departure from current model

**Decision**: Out of scope. The `getKey` + existing `enter` callback covers most needs.

### 4. CPU-Side Transition Fallback

For key-based transitions, compute interpolation on CPU instead of GPU.

**Pros**: Simpler implementation
**Cons**: Performance regression for large datasets, inconsistent behavior

**Decision**: Rejected. GPU transitions should remain the default.

## Migration & Compatibility

### Breaking Changes

None. This is a purely additive feature.

### Deprecations

None.

### Backwards Compatibility

- Existing code without `getKey` behaves identically (index-based matching)
- The `getKey` accessor is optional at every level
- All existing transition options (`duration`, `easing`, `enter`, etc.) work with `getKey`

## Test Plan

### Unit Tests

1. `buildKeyMap` correctly extracts keys from data
2. `computeKeyMapping` handles:
   - Identical data (no changes)
   - Complete replacement (all new)
   - Reordering (same objects, different indices)
   - Mixed add/remove/reorder
3. `padBuffer` with `keyMapping` produces correct output
4. Multi-vertex objects (startIndices) reorder correctly
5. Duplicate key warning is logged
6. Missing keys use enter values

### Integration Tests

1. ScatterplotLayer with `getKey` animates correctly on reorder
2. PathLayer with `getKey` handles variable vertex counts
3. Mixed layers (some with `getKey`, some without) work together
4. Transition interruption with `getKey` behaves correctly

### Visual Tests

1. Add basemap-browser example demonstrating key-based transitions
2. Show side-by-side comparison of index vs key-based behavior

## Documentation

### API Reference Updates

- `Layer` class: document `getKey` in transitions section
- `TransitionSettings` type: add `getKey` property
- Add code examples for common patterns

### Guide Updates

- Update "Animations and Transitions" guide
- Add section on "Transitioning Dynamic Data"
- Include performance guidance for large datasets

## Open Questions

1. **Should `getKey` be inheritable?** If a layer has many transitioned attributes, repeating `getKey` is verbose. Consider allowing:
   ```js
   transitions: {
     getKey: d => d.id,  // Applies to all below
     getPosition: 1000,
     getRadius: 500
   }
   ```

2. **Exit animations?** Currently, removed objects simply disappear. Should we support exit transitions (e.g., fade out)? This would require keeping removed objects in the buffer temporarily.

3. **Spring transitions?** The RFC focuses on interpolation transitions. Spring transitions (`type: 'spring'`) would need similar changes to `GPUSpringTransition`.

## References

- [D3 selection.data()](https://github.com/d3/d3-selection#selection_data) - inspiration for key function API
- [React key prop](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key) - similar concept for virtual DOM reconciliation
- [Issue #2570](https://github.com/visgl/deck.gl/issues/2570) - original feature request
