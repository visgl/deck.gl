import * as React from 'react';
import {View} from '@deck.gl/core';
import type {LayersList} from '@deck.gl/core';
export default function extractJSXLayers({
  children,
  layers,
  views
}: {
  children?: React.ReactNode;
  layers?: LayersList;
  views?: View | View[] | null;
}): {
  children: React.ReactNode[];
  layers: LayersList;
  views: View | View[] | null;
};
// # sourceMappingURL=extract-jsx-layers.d.ts.map
