// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Field,
  FixedSizeList,
  Float64,
  List,
  Table,
  vectorFromArray,
  tableToIPC
} from 'apache-arrow';

// GeoArrow polygon: List<ring: List<vertex: FixedSizeList<xy: Float64>>>.
// Fixtures use GeoJSON winding; the adapter rewinds for D3's spherical convention.
export const names = ['Antimeridian', 'Polygon with hole', 'South pole'];
export function fixtureIPC() {
  const point = new FixedSizeList(2, new Field('xy', new Float64(), false));
  const polygon = new List(
    new Field('rings', new List(new Field('vertices', point, false)), false)
  );
  const geometry = vectorFromArray(
    [
      [
        [
          [170, -15],
          [-170, -15],
          [-170, 15],
          [170, 15],
          [170, -15]
        ]
      ],
      [
        [
          [-30, -25],
          [30, -25],
          [30, 25],
          [-30, 25],
          [-30, -25]
        ],
        [
          [-10, -10],
          [-10, 10],
          [10, 10],
          [10, -10],
          [-10, -10]
        ]
      ],
      [
        [
          [-180, -70],
          [-90, -70],
          [0, -70],
          [90, -70],
          [180, -70],
          [-180, -70]
        ]
      ]
    ],
    polygon
  );
  const table = new Table({geometry});
  table.schema.fields[0].metadata.set('ARROW:extension:name', 'geoarrow.polygon');
  table.schema.fields[0].metadata.set(
    'ARROW:extension:metadata',
    JSON.stringify({
      crs: 'OGC:CRS84',
      crs_type: 'authority_code',
      edges: 'spherical'
    })
  );
  return tableToIPC(table);
}
