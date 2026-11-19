import type {Deck, DeckProps, Layer, LayersList, View, Widget} from '@deck.gl/core';

export type CanvasContribution = {
  canvas: HTMLCanvasElement;
  views: View[];
  layers?: LayersList;
  widgets?: Widget[];
  layerFilter?: DeckProps<any>['layerFilter'];
};

const REGISTRIES = new WeakMap<Deck<any>, DeckCanvasRegistry>();
const MANAGED_KEYS = ['_canvases', 'views', 'layers', 'widgets', 'layerFilter'] as const;

function flattenLayers(layers: LayersList = []): Layer[] {
  const result: Layer[] = [];
  function appendLayers(value: unknown): void {
    if (Array.isArray(value)) {
      for (const child of value) appendLayers(child);
    } else if (value) result.push(value as Layer);
  }
  appendLayers(layers);
  return result;
}

function assertUnique(ids: string[], kind: string): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (!id || seen.has(id)) throw new Error(`DeckCanvas: duplicate or empty ${kind} id '${id}'`);
    seen.add(id);
  }
}

/** Aggregates React canvas contributions while retaining imperative baseline props. */
export class DeckCanvasRegistry {
  private contributions = new Map<object, CanvasContribution | null>();
  private baseline: DeckProps<any>;
  private originalSetProps: Deck<any>['setProps'];
  private wrappedSetProps: Deck<any>['setProps'];
  private hadOwnSetProps: boolean;

  constructor(private deck: Deck<any>) {
    if (!Array.isArray(deck.props._canvases)) {
      throw new Error('DeckCanvas requires a Deck created with _canvases: []');
    }
    this.baseline = Object.fromEntries(MANAGED_KEYS.map(key => [key, deck.props[key]]));
    this.originalSetProps = deck.setProps;
    this.hadOwnSetProps = Object.hasOwn(deck, 'setProps');
    // deck.gl has no prop-source seam yet. Keep this adapter instance-local and
    // restore the original method when the last contribution unmounts.
    this.wrappedSetProps = props => {
      const nextBaseline = {...this.baseline};
      for (const key of MANAGED_KEYS) {
        if (Object.hasOwn(props, key)) Object.assign(nextBaseline, {[key]: props[key]});
      }
      const resolved = this.resolveProps(nextBaseline, this.contributions);
      if ([...this.contributions.values()].some(value => value === null)) {
        const unmanaged = {...props};
        for (const key of MANAGED_KEYS) delete unmanaged[key];
        this.originalSetProps.call(this.deck, unmanaged);
        this.baseline = nextBaseline;
        return;
      }
      this.originalSetProps.call(this.deck, {...props, ...resolved});
      this.baseline = nextBaseline;
    };
  }

  setContribution(token: object, contribution: CanvasContribution): void {
    const hadStagedContributions = [...this.contributions.values()].some(value => value === null);
    try {
      const next = new Map(this.contributions);
      next.set(token, contribution);
      // Validate known contributions before staging; withdrawn siblings are
      // skipped until their setups run, so transfers do not collide.
      const resolved = this.resolveProps(this.baseline, next);
      if ([...next.values()].some(value => value === null)) {
        this.contributions = next;
        return;
      }
      this.originalSetProps.call(this.deck, resolved);
      this.contributions = next;
      this.deck.setProps = this.wrappedSetProps;
      REGISTRIES.set(this.deck, this);
    } catch (error) {
      if (hadStagedContributions) {
        // The failing panel's boundary will unmount it. Keep successful sibling
        // setups, which will not run again merely because that boundary failed.
        this.removeContribution(token);
      }
      throw error;
    }
  }

  removeContribution(token: object, preserveSlot = false): void {
    if (!this.contributions.has(token)) return;
    const next = new Map(this.contributions);
    // Keep insertion order while React withdraws props ahead of an update.
    if (preserveSlot) next.set(token, null);
    else {
      next.delete(token);
    }
    // Layout cleanups stage withdrawals only. Publishing an intermediate empty
    // panel would detach its canvases/widgets and discard retained layer state.
    // The last sibling setup publishes the complete next commit.
    if (![...next.values()].some(value => value === null)) {
      this.originalSetProps.call(
        this.deck,
        next.size ? this.resolveProps(this.baseline, next) : this.baseline
      );
    }
    this.contributions = next;
    if (!next.size) {
      if (this.deck.setProps === this.wrappedSetProps) {
        if (this.hadOwnSetProps) this.deck.setProps = this.originalSetProps;
        else Reflect.deleteProperty(this.deck, 'setProps');
      }
      REGISTRIES.delete(this.deck);
    }
  }

  private resolveProps(
    baseline: DeckProps<any>,
    contributions: Map<object, CanvasContribution | null>
  ): DeckProps<any> {
    const canvases = [...(baseline._canvases || [])];
    const views = baseline.views
      ? Array.isArray(baseline.views)
        ? [...baseline.views]
        : [baseline.views]
      : [];
    const layers = flattenLayers(baseline.layers);
    const widgets = [...(baseline.widgets || [])];
    const owners = new Map<string, CanvasContribution>();
    const viewOwners = new Map<string, CanvasContribution>();
    for (const contribution of contributions.values()) {
      if (!contribution) continue;
      const {canvas} = contribution;
      if (!canvas.id) throw new Error('DeckCanvas: canvas requires an id');
      if (!contribution.views.length) throw new Error('DeckCanvas: views must not be empty');
      canvases.push(canvas);
      const localViews = new Set(contribution.views.map(view => view.id));
      for (const view of contribution.views) {
        if (view.props.canvasId && view.props.canvasId !== canvas.id) {
          throw new Error(`DeckCanvas: view '${view.id}' canvasId does not match '${canvas.id}'`);
        }
        views.push(view.clone({canvasId: canvas.id}));
        viewOwners.set(view.id, contribution);
      }
      for (const layer of flattenLayers(contribution.layers)) {
        layers.push(layer);
        owners.set(layer.id, contribution);
      }
      for (const widget of contribution.widgets || []) {
        if (!widget.viewId || !localViews.has(widget.viewId)) {
          throw new Error(`DeckCanvas: widget '${widget.id}' requires a local viewId`);
        }
        if (!this.deck.props.parent) {
          throw new Error('DeckCanvas: widgets require a Deck initialized with a parent element');
        }
        widgets.push(widget);
      }
    }
    assertUnique(
      canvases.map(canvas => (typeof canvas === 'string' ? canvas : canvas.id)),
      'canvas'
    );
    assertUnique(
      views.map(view => view.id),
      'view'
    );
    assertUnique(
      layers.map(layer => layer.id),
      'layer'
    );
    assertUnique(
      widgets.map(widget => widget.id),
      'widget'
    );
    return {
      _canvases: canvases,
      views,
      layers,
      widgets,
      layerFilter: context => {
        // Composite sublayers belong to the same panel as their top-level ancestor.
        let layer = context.layer;
        while (layer.parent) layer = layer.parent;
        const owner = owners.get(layer.id);
        const viewOwner = viewOwners.get(context.viewport.id);
        if (owner && owner !== viewOwner) return false;
        if (baseline.layerFilter && !baseline.layerFilter(context)) return false;
        return viewOwner?.layerFilter ? viewOwner.layerFilter(context) : true;
      }
    };
  }
}

export function getCanvasRegistry(deck: Deck<any>): DeckCanvasRegistry {
  return REGISTRIES.get(deck) || new DeckCanvasRegistry(deck);
}
