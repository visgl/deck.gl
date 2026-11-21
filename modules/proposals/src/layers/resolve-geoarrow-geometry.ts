// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Schema} from 'apache-arrow';

/** GeoArrow encodings accepted by the composite layer. */
export type GeoArrowLayerGeometryType =
  | 'geoarrow.point'
  | 'geoarrow.linestring'
  | 'geoarrow.polygon'
  | 'geoarrow.multipolygon'
  | 'geoarrow.multipoint'
  | 'geoarrow.multilinestring'
  | 'geoarrow.wkb'
  | 'geoarrow.wkt'
  | 'geoarrow.geometry'
  | 'geoarrow.geometrycollection';

/** Resolves one GeoArrow geometry column from schema extension metadata. */
export function resolveGeoArrowGeometry(
  data: {schema: Schema},
  columnName?: string,
  explicitGeometryType?: GeoArrowLayerGeometryType
): {columnName: string; geometryType: GeoArrowLayerGeometryType} {
  const fields = data.schema.fields;
  const field = columnName
    ? fields.find(candidate => candidate.name === columnName)
    : fields.find(candidate =>
        getGeoArrowExtensionName(candidate.metadata)?.startsWith('geoarrow.')
      );
  if (!field) {
    throw new Error(
      columnName
        ? `GeoArrowLayer geometry column "${columnName}" is missing`
        : 'GeoArrowLayer could not find a GeoArrow extension field'
    );
  }
  const extensionName = explicitGeometryType ?? getGeoArrowExtensionName(field.metadata);
  if (!isSupportedGeoArrowGeometryType(extensionName)) {
    throw new Error(`GeoArrowLayer does not yet dispatch "${extensionName ?? 'untyped'}"`);
  }
  return {columnName: field.name, geometryType: extensionName};
}

/** Reads the canonical or legacy extension metadata key. */
function getGeoArrowExtensionName(metadata: Map<string, string>): string | undefined {
  return metadata.get('ARROW:extension:name') ?? metadata.get('ARROW:extension_name');
}

/** Checks whether GeoArrowLayer has a renderer for this encoding. */
function isSupportedGeoArrowGeometryType(
  value: string | undefined
): value is GeoArrowLayerGeometryType {
  return (
    value === 'geoarrow.point' ||
    value === 'geoarrow.linestring' ||
    value === 'geoarrow.polygon' ||
    value === 'geoarrow.multipolygon' ||
    value === 'geoarrow.multipoint' ||
    value === 'geoarrow.multilinestring' ||
    value === 'geoarrow.wkb' ||
    value === 'geoarrow.wkt' ||
    value === 'geoarrow.geometry' ||
    value === 'geoarrow.geometrycollection'
  );
}
