// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  type Color,
  type LayerProps,
  type LayerContext,
  type GetPickingInfoParams,
  type UpdateParameters,
  type Unit
} from '@deck.gl/core';
import {ArrowPolygonRenderer, type ArrowPolygonSourceVectors} from '@luma.gl/engine/arrow';
import {GPUVector, type VertexList} from '@luma.gl/graph/gpu-data';
import {readArrowLayerGPUVector} from '../arrow-layer-input';
import {StoragePathLayer} from '../path-layer/path-layer';
import {StorageSolidPolygonLayer} from '../solid-polygon-layer/solid-polygon-layer';

export type {GPUVectorLayerPickingInfo} from '../utils/gpu-vector-picking';

/** Prepared triangle geometry. The layer borrows these vectors. */
export type PolygonMeshes = {
  positions: GPUVector<VertexList<'float32x4'>>;
  rowIndices: GPUVector<VertexList<'uint32'>>;
  indices: GPUVector<VertexList<'uint32'>>;
};

type PolygonRings = ArrowPolygonSourceVectors['polygons'];

/** Polygon geometry and independent fill and outline styling. */
export type StoragePolygonLayerProps = Omit<LayerProps, 'data'> &
  (
    | {polygonMeshes: PolygonMeshes; polygons?: never}
    | {polygons: PolygonRings | GPUVector; polygonMeshes?: never}
  ) & {
    /** Permit asynchronous CPU readback of GPU polygon rings for tessellation. */
    allowPolygonReadback?: boolean;
    fillColors?: Color | GPUVector<VertexList<'unorm8x4'>>;
    paths?: GPUVector<VertexList<'float32x2' | 'float32x3' | 'float32x4'>>;
    lineColors?: Color | GPUVector<'unorm8x4' | VertexList<'unorm8x4'>>;
    lineWidths?: number | GPUVector<'float32'>;
    /** Feature IDs for outline rows when one feature has multiple rings. */
    pathFeatureIds?: readonly number[];
    lineWidthUnits?: Unit;
    lineWidthScale?: number;
    lineWidthMinPixels?: number;
    lineWidthMaxPixels?: number;
    lineMiterLimit?: number;
    filled?: boolean;
    stroked?: boolean;
  };

/** Fill-and-outline composite over the specialized polygon and path GPU cores. */
export class StoragePolygonLayer extends CompositeLayer<StoragePolygonLayerProps> {
  static override layerName = 'StoragePolygonLayer';

  declare state: {
    request?: object;
    mesh?: PolygonMeshes;
    releaseMesh?: () => void;
  };

  override initializeState(): void {
    this.state = {};
  }

  /** Reports pending geometry preparation through the usual layer loading state. */
  override get isLoaded(): boolean {
    return !this.state?.request && super.isLoaded;
  }

  /** Starts preparation only when the source geometry or readback policy changes. */
  override updateState({props, oldProps}: UpdateParameters<this>): void {
    if (
      props.polygons === oldProps.polygons &&
      props.polygonMeshes === oldProps.polygonMeshes &&
      props.allowPolygonReadback === oldProps.allowPolygonReadback
    )
      return;

    this.state.request = undefined;
    if (props.polygons && props.polygonMeshes) {
      throw new Error('Supply either polygons or polygonMeshes');
    }
    if (!props.polygons) {
      this.replaceMesh(props.polygonMeshes);
      return;
    }
    const request = {};
    this.state.request = request;
    void this.preparePolygons(props.polygons, Boolean(props.allowPolygonReadback), request);
  }

  /** Releases meshes created by the layer and invalidates pending work. */
  override finalizeState(context: LayerContext): void {
    this.state.request = undefined;
    this.replaceMesh(undefined);
    super.finalizeState(context);
  }

  /** Publishes a prepared mesh only if its input is still current. */
  private async preparePolygons(
    polygons: PolygonRings | GPUVector,
    allowReadback: boolean,
    request: object
  ): Promise<void> {
    try {
      let rings: PolygonRings;
      if (polygons instanceof GPUVector) {
        if (!allowReadback) throw new Error('GPU polygon rings require allowPolygonReadback');
        rings = (await readArrowLayerGPUVector(
          this.context.device,
          polygons,
          this.id,
          false
        )) as PolygonRings;
      } else {
        rings = polygons;
      }
      if (this.state.request !== request) return;
      const prepared = await ArrowPolygonRenderer.convertToGPUVectors(
        this.context.device,
        {polygons: rings},
        {id: this.id}
      );
      if (this.state.request !== request) {
        prepared.destroy();
        return;
      }
      const {positions, rowIndices, indices} = prepared;
      this.replaceMesh({positions, rowIndices, indices}, () => prepared.destroy());
    } catch (error) {
      if (this.state.request === request) {
        this.getCurrentLayer()?.raiseError(
          error instanceof Error ? error : new Error(String(error)),
          'preparing polygon mesh'
        );
      }
    } finally {
      if (this.state.request === request) {
        this.state.request = undefined;
        this.getCurrentLayer()?.setNeedsUpdate();
      }
    }
  }

  /** Swaps meshes and disposes only the layer-owned allocation. */
  private replaceMesh(mesh?: PolygonMeshes, releaseMesh?: () => void): void {
    this.state.releaseMesh?.();
    this.state.mesh = mesh;
    this.state.releaseMesh = releaseMesh;
  }

  override getPickingInfo(params: GetPickingInfoParams) {
    const info = super.getPickingInfo(params);
    if (params.sourceLayer?.id === `${this.id}-stroke` && info.index >= 0) {
      info.index = this.props.pathFeatureIds?.[info.index] ?? info.index;
    }
    return info;
  }

  override renderLayers(): Array<StorageSolidPolygonLayer | StoragePathLayer> {
    const {
      polygonMeshes,
      polygons,
      allowPolygonReadback,
      fillColors,
      paths,
      lineColors,
      lineWidths,
      pathFeatureIds,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineMiterLimit,
      filled = true,
      stroked = Boolean(paths),
      ...props
    } = this.props;
    const layers: Array<StorageSolidPolygonLayer | StoragePathLayer> = [];
    const mesh = this.state?.mesh ?? polygonMeshes;
    if (filled && mesh) {
      layers.push(
        new StorageSolidPolygonLayer({
          ...props,
          id: `${this.props.id}-fill`,
          ...mesh,
          fillColors
        })
      );
    }
    if (stroked && paths) {
      layers.push(
        new StoragePathLayer({
          ...props,
          id: `${this.props.id}-stroke`,
          paths,
          colors: lineColors,
          widths: lineWidths,
          widthUnits: lineWidthUnits,
          widthScale: lineWidthScale,
          widthMinPixels: lineWidthMinPixels,
          widthMaxPixels: lineWidthMaxPixels,
          miterLimit: lineMiterLimit
        })
      );
    }
    return layers;
  }
}
