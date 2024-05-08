import {CartoAPIError} from './api/carto-api-error';
import {APIErrorContext} from './api/types';

export const cartoBasemapsBaseUrl = 'https://basemaps.cartocdn.com/gl';

const baseUrl = `${cartoBasemapsBaseUrl}/{basemap}-gl-style/style.json`;

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

  const visibleFilters = STYLE_LAYER_GROUPS.filter(lg => visibleLayerGroups[lg.slug]).map(
    lg => lg.filter
  );

  const filteredLayers = style.layers.filter(layer => visibleFilters.some(match => match(layer)));

  return {
    ...style,
    layers: filteredLayers
  };
}

function someLayerGroupsDisabled(visibleLayerGroups?: Record<StyleLayerGroupSlug, boolean>) {
  return visibleLayerGroups && Object.values(visibleLayerGroups).every(Boolean) === false;
}

export function getStyleUrl(styleType: string) {
  return baseUrl.replace('{basemap}', styleType);
}

export async function getBasemapStyle({
  styleType,
  visibleLayerGroups,
  errorContext
}: {
  styleType: string;
  visibleLayerGroups?: Record<StyleLayerGroupSlug, boolean>;
  errorContext?: APIErrorContext;
}) {
  /* global fetch */
  const styleUrl = getStyleUrl(styleType);
  let style = styleUrl;

  if (visibleLayerGroups && someLayerGroupsDisabled(visibleLayerGroups)) {
    let response: Response | undefined;
    const originalStyle = await fetch(styleUrl, {
      mode: 'cors',
      credentials: 'omit'
    })
      .then(res => {
        response = res;
        return res.json();
      })
      .catch(error => {
        throw new CartoAPIError(error, {...errorContext, requestType: 'Basemap style'}, response);
      });
    style = applyLayerGroupFilters(originalStyle, visibleLayerGroups);
  }
  return style;
}

export default {
  VOYAGER: getStyleUrl('voyager'),
  POSITRON: getStyleUrl('positron'),
  DARK_MATTER: getStyleUrl('dark-matter'),
  VOYAGER_NOLABELS: getStyleUrl('voyager-nolabels'),
  POSITRON_NOLABELS: getStyleUrl('positron-nolabels'),
  DARK_MATTER_NOLABELS: getStyleUrl('dark-matter-nolabels')
} as const;
