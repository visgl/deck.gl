// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CartoAPIError, APIErrorContext} from '@carto/api-client';
import {GoogleBasemapProps} from './api/types';

const cartoStyleUrlTemplate = 'https://basemaps.cartocdn.com/gl/{basemap}-gl-style/style.json';

export const CARTO_MAP_STYLES = ['positron', 'dark-matter', 'voyager'];

export const GOOGLE_BASEMAPS: Record<string, GoogleBasemapProps> = {
  roadmap: {
    mapTypeId: 'roadmap',
    mapId: '3754c817b510f791'
  },
  'google-positron': {
    mapTypeId: 'roadmap',
    mapId: 'ea84ae4203ef21cd'
  },
  'google-dark-matter': {
    mapTypeId: 'roadmap',
    mapId: '2fccc3b36c22a0e2'
  },
  'google-voyager': {
    mapTypeId: 'roadmap',
    mapId: '885caf1e15bb9ef2'
  },
  satellite: {
    mapTypeId: 'satellite'
  },
  hybrid: {
    mapTypeId: 'hybrid'
  },
  terrain: {
    mapTypeId: 'terrain'
  }
};

type StyleLayerGroupSlug = 'label' | 'road' | 'border' | 'building' | 'water' | 'land';
type StyleLayerGroup = {
  slug: StyleLayerGroupSlug;
  filter: (layer: any) => boolean;
  defaultVisibility: boolean;
};

export const STYLE_LAYER_GROUPS: StyleLayerGroup[] = [
  {
    slug: 'label',
    filter: ({id}: {id: string}) =>
      Boolean(
        id.match(/(?=(label|_label|place-|place_|poi-|poi_|watername_|roadname_|housenumber))/)
      ),
    defaultVisibility: true
  },
  {
    slug: 'road',
    filter: ({id}: {id: string}) =>
      Boolean(id.match(/(?=(road|railway|tunnel|street|bridge))(?!.*label)/)),
    defaultVisibility: true
  },
  {
    slug: 'border',
    filter: ({id}: {id: string}) => Boolean(id.match(/border|boundaries|boundary_/)),
    defaultVisibility: false
  },
  {
    slug: 'building',
    filter: ({id}: {id: string}) => Boolean(id.match(/building/)),
    defaultVisibility: true
  },
  {
    slug: 'water',
    filter: ({id}: {id: string}) => Boolean(id.match(/(?=(water|stream|ferry))/)),
    defaultVisibility: true
  },
  {
    slug: 'land',
    filter: ({id}: {id: string}) =>
      Boolean(id.match(/(?=(parks|landcover|industrial|sand|hillshade|park_))/)),
    defaultVisibility: true
  }
];

export function applyLayerGroupFilters(
  style,
  visibleLayerGroups: Record<StyleLayerGroupSlug, boolean>
) {
  if (!Array.isArray(style?.layers)) {
    return style;
  }

  const removedLayerFilters = STYLE_LAYER_GROUPS.filter(lg => !visibleLayerGroups[lg.slug]).map(
    lg => lg.filter
  );

  const visibleLayers = style.layers.filter(layer =>
    removedLayerFilters.every(match => !match(layer))
  );

  return {
    ...style,
    layers: visibleLayers
  };
}

export function someLayerGroupsDisabled(visibleLayerGroups?: Record<StyleLayerGroupSlug, boolean>) {
  return visibleLayerGroups && Object.values(visibleLayerGroups).every(Boolean) === false;
}

export function getStyleUrl(styleType: string) {
  return cartoStyleUrlTemplate.replace('{basemap}', styleType);
}

export async function fetchStyle({
  styleUrl,
  errorContext
}: {
  styleUrl: string;
  errorContext?: APIErrorContext;
}) {
  /* global fetch */
  let response: Response | undefined;
  return await fetch(styleUrl, {mode: 'cors'})
    .then(res => {
      response = res;
      return res.json();
    })
    .catch(error => {
      throw new CartoAPIError(error, {...errorContext, requestType: 'Basemap style'}, response);
    });
}

export default {
  VOYAGER: getStyleUrl('voyager'),
  POSITRON: getStyleUrl('positron'),
  DARK_MATTER: getStyleUrl('dark-matter'),
  VOYAGER_NOLABELS: getStyleUrl('voyager-nolabels'),
  POSITRON_NOLABELS: getStyleUrl('positron-nolabels'),
  DARK_MATTER_NOLABELS: getStyleUrl('dark-matter-nolabels')
} as const;
