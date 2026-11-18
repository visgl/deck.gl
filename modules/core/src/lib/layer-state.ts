// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license
import type {CRSDescriptor} from '@math.gl/geospatial/projection/core';
import {compareLoaderOptions} from '@loaders.gl/core';
import ComponentState from '../lifecycle/component-state';

import Layer from './layer';
import {
  prepareSQLParameters,
  areSQLParametersEqual,
  getSQLParameterNames,
  type SQLParameterSnapshot
} from '@math.gl/sql/parser';
import {isArrowTable} from '../arrow/upstream-math/is-arrow-table';
import type {Table, Vector} from 'apache-arrow';
import type {SQLFunctions, SQLParser} from '../types/layer-props';
import type AttributeManager from './attribute/attribute-manager';
import type Viewport from '../viewports/viewport';
import type {PickingInfo} from './picking/pick-info';
import type UniformTransitionManager from './uniform-transition-manager';

export type ChangeFlags = {
  // Primary changeFlags, can be strings stating reason for change
  dataChanged: string | false | {startRow: number; endRow?: number}[];
  propsChanged: string | false;
  updateTriggersChanged: Record<string, true> | false;
  extensionsChanged: boolean;
  viewportChanged: boolean;
  /** The viewport input-to-common conversion or its tessellation configuration changed. */
  projectionChanged: boolean;
  stateChanged: boolean;

  // Derived changeFlags
  propsOrDataChanged: boolean;
  somethingChanged: boolean;
};

export default class LayerState<LayerT extends Layer> extends ComponentState<LayerT> {
  /** Evaluation of SQL accessors for the current loaded data. */
  accessorQueries?: {
    source: unknown;
    expressions: Record<string, string>;
    parseExpression: SQLParser['parseExpression'];
    /** Effective function declarations used by this evaluation. */
    functions?: SQLFunctions;
    pending: boolean;
    table?: Table;
    columns?: Record<string, Vector>;
  };
  private parameters?: SQLParameterSnapshot;
  private reactiveSQL?: string | null;
  private sourceTable?: unknown;
  private sourceInput?: unknown;
  private queryArrowSQL?: typeof import('@math.gl/sql').queryArrowSQL;
  private loadingExecutor = false;
  private pendingDataLoad = false;

  isAsyncPropLoading(propName?: string): boolean {
    return (
      ((!propName || propName === 'data') && Boolean(this.reactiveSQL) && this.loadingExecutor) ||
      super.isAsyncPropLoading(propName)
    );
  }

  private async loadReactiveExecutor() {
    this.loadingExecutor = true;
    try {
      const {queryArrowSQL} = await import('@math.gl/sql');
      this.queryArrowSQL = queryArrowSQL;
      this.loadingExecutor = false;
      if (this.layer && this.reactiveSQL && this.sourceTable !== undefined) {
        this._refreshProjection('data', this.sourceTable);
        this.onAsyncPropUpdated('data', this.getAsyncProp('data'));
      }
      if (this.pendingDataLoad) {
        this._onResolve('data', this.getAsyncProp('data'));
      }
    } catch (error) {
      if (this.reactiveSQL) this._onError('data', error as Error);
    } finally {
      this.loadingExecutor = false;
      this.pendingDataLoad = false;
    }
  }

  protected _projectValue(propName: string, source: unknown): unknown {
    if (propName !== 'data') return source;
    this.sourceTable = source;
    if (!this.reactiveSQL || source == null || (Array.isArray(source) && !source.length)) {
      return source;
    }
    if (!isArrowTable(source)) throw new Error('reactiveQuery requires Arrow table data');
    if (!this.queryArrowSQL) {
      if (!this.loadingExecutor) void this.loadReactiveExecutor();
      return this.getAsyncProp(propName) ?? [];
    }
    return this.queryArrowSQL(this.reactiveSQL, new Map([['data', source]]), {
      parameters: this.parameters
    });
  }

  /** Options and parser used by the current data request. */
  private dataRequest?: {
    query?: string | null;
    mode?: LayerT['props']['_dataLoadOptions'];
    parser: SQLParser['parseQuery'];
    fetch?: Layer['props']['fetch'];
    loaders?: Layer['props']['loaders'];
    options: unknown;
  };

  /** Last hovered object, used to refresh highlight callbacks during layer updates. */
  hoverHighlightInfo: PickingInfo | null = null;
  /** Color convention used for the most recent picking module update. */
  normalizedHighlightColor = false;

  attributeManager: AttributeManager | null;
  needsRedraw: boolean;
  needsUpdate: boolean;
  /**
   * Sublayers rendered in a previous cycle
   */
  subLayers: Layer[] | null;
  /**
   * If the layer is using the shared instancedPickingColors buffer
   */
  usesPickingColorCache: boolean;
  /**
   * If the layer has a picking buffer
   * (rowIndexes, pickingColors or instancePickingColors)
   */
  hasPickingBuffer?: boolean;
  /**
   * Object indices temporarily excluded from builtin instance-index picking.
   * Used by pickMultipleObjects between picking passes.
   */
  disabledPickingIndices: number[];
  /**
   * Dirty flags of the layer's props and state
   */
  changeFlags!: ChangeFlags;

  /** CRS of the input positions after modelMatrix and coordinateOrigin. */
  sourceCrs: CRSDescriptor | null = null;
  /** CRS of packed attributes, after any CPU conversion. */
  packedCrs: CRSDescriptor | null = null;
  /** Source-CRS positions to the packed attribute CRS, excluding layer transforms. */
  preproject: ((position: number[]) => [number, number, number]) | null = null;
  /** Packed attribute positions back to the source CRS. */
  unpreproject: ((position: number[]) => [number, number, number]) | null = null;
  /** Input/target identity used to retain a conversion pair across camera changes. */
  preprojectionSignature: string | null = null;
  /** Packed position conversion changed since the last attribute update. */
  preprojectionChanged = false;
  /** Target geometry configuration, independent of the packed attribute CRS. */
  tessellationSignature: string | null = null;

  /** First eligible viewport, retained for attribute and sublayer updates. */
  viewport?: Viewport;

  uniformTransitions!: UniformTransitionManager;
  /** Populated during uniform transition to replace user-supplied values */
  propsInTransition?: LayerT['props'];

  constructor({
    attributeManager,
    layer
  }: {
    attributeManager: AttributeManager | null;
    layer: LayerT;
  }) {
    super(layer);
    this.attributeManager = attributeManager;
    this.needsRedraw = true;
    this.needsUpdate = true;
    this.subLayers = null;
    this.usesPickingColorCache = false;
    this.disabledPickingIndices = [];
  }

  get layer(): LayerT | null {
    return this.component;
  }

  /* Override base Component methods with Layer-specific handling */

  /** Reloads the same layer's data if its query parser is replaced or installed. */
  refreshQueryParser(): void {
    const layer = this.layer;
    if (
      layer &&
      (layer.props.dataQuery || layer.props.query) &&
      this.dataRequest?.parser !== layer.context.sqlParser?.parseQuery
    ) {
      this.setAsyncProps(layer.props);
    }
  }

  /** Detects changes to the data request even when the original data is unchanged. */
  protected _didAsyncRequestChange(propName: string, value: unknown): boolean {
    if (propName !== 'data') {
      return false;
    }
    const layer = this.layer;
    const query = layer?.props.dataQuery ?? layer?.props.query;
    const reactiveSQL = layer?.props.reactiveQuery;
    const previous = this.parameters;
    const parameters =
      query || reactiveSQL
        ? prepareSQLParameters(layer?.props.reactiveQueryParameters ?? {}, {previous})
        : undefined;
    const bindingsChanged = (sql: string) =>
      previous &&
      parameters &&
      !areSQLParametersEqual(previous, parameters, {names: getSQLParameterNames(sql)});
    const reactiveChanged =
      reactiveSQL !== this.reactiveSQL || (reactiveSQL && bindingsChanged(reactiveSQL));
    this.parameters = parameters;
    this.reactiveSQL = reactiveSQL;
    const isURL = typeof value === 'string';
    const mode = layer?.props._dataLoadOptions ?? 'auto';
    const request =
      layer && (query || (isURL && mode !== 'auto'))
        ? {
            query,
            mode: isURL && !query ? mode : undefined,
            parser: query ? layer.context.sqlParser?.parseQuery : undefined,
            fetch: isURL && query ? layer.props.fetch : undefined,
            loaders: isURL ? layer.props.loaders : undefined,
            options: isURL ? layer.getLoadOptions() : undefined
          }
        : undefined;
    const changed =
      !compareLoaderOptions(this.dataRequest, request) || Boolean(query && bindingsChanged(query));
    if (changed || value !== this.sourceInput) {
      this.sourceTable = undefined;
      this.pendingDataLoad = false;
    } else if (reactiveChanged && this.sourceTable !== undefined) {
      this._refreshProjection(propName, this.sourceTable);
    }
    this.sourceInput = value;
    this.dataRequest = request;
    return changed;
  }

  protected _onProgress(propName: string, value: unknown) {
    const layer = this.layer;
    if (propName === 'data' && layer) {
      layer.props.onDataProgress?.(value, {propName, layer});
    }
  }

  /** Evaluates SQL against the original input before resolving the data prop. */
  protected _prepareAsyncInput(propName: string, value: unknown): unknown {
    const request = propName === 'data' ? this.dataRequest : undefined;
    if (!request?.query) {
      return value;
    }
    const {query, parser} = request;
    const parameters = this.parameters;
    return Promise.resolve(value).then(async data => {
      const {queryLayerData} = await import('../arrow/data-query');
      return queryLayerData(data, query, undefined, undefined, parser, parameters);
    });
  }

  protected _fetch(propName, url: string) {
    const layer = this.layer;
    const request = propName === 'data' ? this.dataRequest : undefined;
    const fetch = layer?.props.fetch;
    if (request?.query && layer) {
      layer.context.resourceManager?.unsubscribe({consumerId: layer.id, requestId: propName});
      const {fetch: defaultFetch} = Layer.defaultProps as {fetch: {value: Layer['props']['fetch']}};
      if (fetch && fetch !== defaultFetch.value) {
        return this._prepareAsyncInput(propName, fetch(url, {propName, layer}));
      }
      const {query} = request;
      const parameters = this.parameters;
      return import('../arrow/data-query').then(({queryLayerData}) =>
        queryLayerData(url, query, request.loaders, request.options, request.parser, parameters)
      );
    }
    if (fetch) {
      return fetch(url, {propName, layer});
    }
    return super._fetch(propName, url);
  }

  protected _onResolve(propName: string, value: any) {
    if (propName === 'data' && this.reactiveSQL && this.loadingExecutor) {
      this.pendingDataLoad = true;
      return;
    }
    const layer = this.layer;
    if (layer) {
      const onDataLoad = layer.props.onDataLoad;
      if (propName === 'data' && onDataLoad) {
        onDataLoad(value, {propName, layer});
      }
    }
  }

  protected _onError(propName: string, error: Error) {
    const layer = this.layer;
    if (layer) {
      layer.raiseError(error, `loading ${propName} of ${this.layer}`);
    }
  }
}
