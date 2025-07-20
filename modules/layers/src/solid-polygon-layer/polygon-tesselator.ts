// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Handles tesselation of polygons with holes
// - 2D surfaces
// - 2D outlines
// - 3D surfaces (top and sides only)
// - 3D wireframes (not yet)
import * as Polygon from './polygon';
import {Tesselator} from '@deck.gl/core';
import {cutPolygonByGrid, cutPolygonByMercatorBounds} from '@math.gl/polygon';

import type {
  PolygonGeometry,
  NormalizedPolygonGeometry,
  FlatComplexPolygonGeometry
} from './polygon';
import type {TypedArray} from '@math.gl/core';

type GeometryUpdateContext = {
  vertexStart: number;
  indexStart: number;
  geometrySize: number;
  geometryIndex: number;
};

type CutPolygon = FlatComplexPolygonGeometry & {
  edgeTypes: number[];
};

// This class is set up to allow querying one attribute at a time
// the way the AttributeManager expects it
export default class PolygonTesselator extends Tesselator<
  PolygonGeometry,
  NormalizedPolygonGeometry | CutPolygon[],
  {
    fp64?: boolean;
    IndexType?: Uint32ArrayConstructor | Uint16ArrayConstructor;
    resolution?: number;
    wrapLongitude?: boolean;
    preproject?: (xy: number[]) => number[];
    full3d?: boolean;
  }
> {
  constructor(opts) {
    const {fp64, IndexType = Uint32Array} = opts;
    super({
      ...opts,
      attributes: {
        positions: {size: 3, type: fp64 ? Float64Array : Float32Array},
        vertexValid: {type: Uint16Array, size: 1},
        indices: {type: IndexType, size: 1}
      }
    });
  }

  /** Get attribute by name */
  get(attributeName: string): TypedArray | null {
    const {attributes} = this;
    if (attributeName === 'indices') {
      return attributes.indices && attributes.indices.subarray(0, this.vertexCount);
    }

    return attributes[attributeName];
  }

  /** Override base Tesselator method */
  updateGeometry(opts) {
    super.updateGeometry(opts);

    const externalIndices = this.buffers.indices;
    if (externalIndices) {
      // @ts-ignore (2339) value is not defined on TypedArray (fall through)
      this.vertexCount = (externalIndices.value || externalIndices).length;
    } else if (this.data && !this.getGeometry) {
      throw new Error('missing indices buffer');
    }
  }

  /** Implement base Tesselator interface */
  protected normalizeGeometry(polygon: PolygonGeometry): NormalizedPolygonGeometry | CutPolygon[] {
    if (this.normalize) {
      const normalizedPolygon = Polygon.normalize(polygon, this.positionSize);
      if (this.opts.resolution) {
        return cutPolygonByGrid(
          Polygon.getPositions(normalizedPolygon),
          Polygon.getHoleIndices(normalizedPolygon),
          {
            size: this.positionSize,
            gridResolution: this.opts.resolution,
            edgeTypes: true
          }
        ) as CutPolygon[];
      }
      if (this.opts.wrapLongitude) {
        return cutPolygonByMercatorBounds(
          Polygon.getPositions(normalizedPolygon),
          Polygon.getHoleIndices(normalizedPolygon),
          {
            size: this.positionSize,
            maxLatitude: 86,
            edgeTypes: true
          }
        ) as CutPolygon[];
      }
      return normalizedPolygon;
    }
    // normalize is explicitly set to false, assume that user passed in already normalized polygons
    return polygon as NormalizedPolygonGeometry;
  }

  /** Implement base Tesselator interface */
  protected getGeometrySize(polygon: NormalizedPolygonGeometry | CutPolygon[]): number {
    if (isCut(polygon)) {
      let size = 0;
      for (const subPolygon of polygon) {
        size += this.getGeometrySize(subPolygon);
      }
      return size;
    }
    return Polygon.getPositions(polygon).length / this.positionSize;
  }

  /** Override base Tesselator method */
  protected getGeometryFromBuffer(buffer) {
    if (this.normalize || !this.buffers.indices) {
      return super.getGeometryFromBuffer(buffer);
    }
    // we don't need to read the positions if no normalization/tesselation
    return null;
  }

  /** Implement base Tesselator interface */
  protected updateGeometryAttributes(
    polygon: NormalizedPolygonGeometry | CutPolygon[] | null,
    context: GeometryUpdateContext
  ) {
    if (polygon && isCut(polygon)) {
      for (const subPolygon of polygon) {
        const geometrySize = this.getGeometrySize(subPolygon);
        context.geometrySize = geometrySize;
        this.updateGeometryAttributes(subPolygon, context);
        context.vertexStart += geometrySize;
        context.indexStart = this.indexStarts[context.geometryIndex + 1];
      }
    } else {
      const normalizedPolygon = polygon as NormalizedPolygonGeometry;
      this._updateIndices(normalizedPolygon, context);
      this._updatePositions(normalizedPolygon, context);
      this._updateVertexValid(normalizedPolygon, context);
    }
  }

  // Flatten the indices array
  private _updateIndices(
    polygon: NormalizedPolygonGeometry | null,
    {geometryIndex, vertexStart: offset, indexStart}: GeometryUpdateContext
  ) {
    const {attributes, indexStarts, typedArrayManager} = this;

    let target = attributes.indices;
    if (!target || !polygon) {
      return;
    }
    let i = indexStart;

    // 1. get triangulated indices for the internal areas
    const indices = Polygon.getSurfaceIndices(
      polygon,
      this.positionSize,
      this.opts.preproject,
      this.opts.full3d
    );

    // make sure the buffer is large enough
    target = typedArrayManager.allocate(target, indexStart + indices.length, {
      copy: true
    });

    // 2. offset each index by the number of indices in previous polygons
    for (let j = 0; j < indices.length; j++) {
      target[i++] = indices[j] + offset;
    }

    indexStarts[geometryIndex + 1] = indexStart + indices.length;
    attributes.indices = target;
  }

  // Flatten out all the vertices of all the sub subPolygons
  private _updatePositions(
    polygon: NormalizedPolygonGeometry | null,
    {vertexStart, geometrySize}: GeometryUpdateContext
  ) {
    const {
      attributes: {positions},
      positionSize
    } = this;
    if (!positions || !polygon) {
      return;
    }
    const polygonPositions = Polygon.getPositions(polygon);

    for (let i = vertexStart, j = 0; j < geometrySize; i++, j++) {
      const x = polygonPositions[j * positionSize];
      const y = polygonPositions[j * positionSize + 1];
      const z = positionSize > 2 ? polygonPositions[j * positionSize + 2] : 0;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
  }

  private _updateVertexValid(
    polygon: NormalizedPolygonGeometry | null,
    {vertexStart, geometrySize}: GeometryUpdateContext
  ) {
    const {positionSize} = this;
    const vertexValid = this.attributes.vertexValid as TypedArray;
    const holeIndices = polygon && Polygon.getHoleIndices(polygon);
    /* We are reusing the some buffer for `nextPositions` by offseting one vertex
     * to the left. As a result,
     * the last vertex of each ring overlaps with the first vertex of the next ring.
     * `vertexValid` is used to mark the end of each ring so we don't draw these
     * segments:
      positions      A0 A1 A2 A3 A4 B0 B1 B2 C0 ...
      nextPositions  A1 A2 A3 A4 B0 B1 B2 C0 C1 ...
      vertexValid    1  1  1  1  0  1  1  0  1 ...
     */
    if (polygon && (polygon as CutPolygon).edgeTypes) {
      vertexValid.set((polygon as CutPolygon).edgeTypes, vertexStart);
    } else {
      vertexValid.fill(1, vertexStart, vertexStart + geometrySize);
    }
    if (holeIndices) {
      for (let j = 0; j < holeIndices.length; j++) {
        vertexValid[vertexStart + holeIndices[j] / positionSize - 1] = 0;
      }
    }
    vertexValid[vertexStart + geometrySize - 1] = 0;
  }
}

function isCut(polygon: NormalizedPolygonGeometry | CutPolygon[]): polygon is CutPolygon[] {
  return Array.isArray(polygon) && polygon.length > 0 && !Number.isFinite(polygon[0]);
}
