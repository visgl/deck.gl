# Stateful components and declarative aggregation (POC)

Repeated construction should describe new props without recreating retained resources.
This draft introduces `StatefulComponent` between `Component` and `Layer`, then uses it
for an independently diffed Cartesian grid computation.

## Boundaries

`Component` keeps its existing props/defaults/clone responsibilities. `StatefulComponent`
adds retained state, state adoption, existing deck.gl prop comparisons, and explicit
owner-driven update/finalize hooks. `Layer` delegates state transfer and prop comparisons
to that base while retaining its established scheduling, attribute invalidation, transitions,
projection handling, and rendering lifecycle. This is an incremental extraction; layer
initialization and finalization have not been routed through the new component hooks.

The host calls `updateComponent(previous, requestUpdate)`. Matching ID and constructor
preserve resources; replacements finalize the previous component. Async-prop completion
requests another host update. Old descriptors retain references for asynchronous work but
cannot finalize the current descriptor's resources. Descriptors are owned by one host slot;
sharing one live stateful descriptor between owners is outside this prototype.

## Example

```typescript
import {_AggregatedLayer, _GridAggregation} from '@deck.gl/aggregation-layers';
import {ColumnLayer} from '@deck.gl/layers';

new _AggregatedLayer({
  id: 'population',
  aggregation: new _GridAggregation({
    data,
    cellSize: 1000,
    getPosition: d => d.position,
    getWeight: d => d.population,
    updateTriggers: {getWeight: populationVersion}
  }),
  renderLayer: new ColumnLayer({
    id: 'cells',
    diskResolution: 4,
    radius: 500,
    getPosition: bin => bin.position,
    getElevation: bin => bin.value,
    getFillColor: [40, 120, 200]
  })
});
```

The computation currently performs CPU SUM in Cartesian input units. The rendering layer
is an ordinary ColumnLayer. New aggregation descriptors with equivalent props preserve
output identity; accessor changes use updateTriggers, exactly as layer accessors do.
Rendering-only changes do not rerun aggregation. IDs are local to the owning slot.

## Other consumers

Widgets could retain DOM resources, controllers could retain interaction state, effects
could retain GPU passes, and data sources could retain workers or subscriptions. Each host
provides its own context and scheduling; the shared class has no GPU or rendering dependency.

LayerExtension is a possible consumer of the descriptor-only Component. Its current
`defaultProps` describe props installed on the layer, whereas its constructor `opts` describe
the extension itself, so migrating it requires keeping those namespaces distinct.
Resource-owning extension attachments would be per-layer stateful components, because one
extension descriptor may be shared by multiple layers.

## Deliberately open in this draft

- Context typing and owner identity, including rejecting accidental multi-owner adoption
- Error recovery and asynchronous initialization/disposal
- Whether component hooks should use a typed state parameter instead of public mutable state
- Completing the extraction of Layer initialization/finalization without changing behavior
- GPUVector outputs and explicit compute-before-render scheduling
- Adapting the existing Aggregator backends and GridCellLayer; geographic binning and picking
- A generic output-to-renderer adapter rather than the POC's grid-specific host

No existing aggregation API is replaced. Underscored exports allow exercising the proposal.
