export const cartoBasemapsBaseUrl = 'https://basemaps.cartocdn.com/gl';

const baseUrl = `${cartoBasemapsBaseUrl}/{basemap}-gl-style/style.json`;

export const cartoStyleLayerGroups = [
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

export function applyCartoLayerGroupFilters(style, visibleLayerGroups: Record<string, boolean>) {
  if (!Array.isArray(style?.layers)) {
    return style;
  }

  const visibleFilters = cartoStyleLayerGroups
    .filter(lg => visibleLayerGroups[lg.slug])
    .map(lg => lg.filter);

  const filteredLayers = style.layers.filter(layer => visibleFilters.some(match => match(layer)));

  return {
    ...style,
    layers: filteredLayers
  };
}

function someLayerGroupsDisabled(visibleLayerGroups?: Record<string, boolean>) {
  return visibleLayerGroups && Object.values(visibleLayerGroups).every(Boolean) === false;
}

export async function getCartoBasemapStyle({
  styleType,
  visibleLayerGroups
}: {
  styleType: string;
  visibleLayerGroups?: Record<string, boolean>;
}) {
  /* global fetch, console */
  const styleUrl = `${cartoBasemapsBaseUrl}/${styleType}-gl-style/style.json`;
  let style = styleUrl;

  if (visibleLayerGroups && someLayerGroupsDisabled(visibleLayerGroups)) {
    try {
      const originalStyle = await fetch(styleUrl, {
        mode: 'cors',
        credentials: 'omit'
      }).then(res => res.json());
      style = applyCartoLayerGroupFilters(originalStyle, visibleLayerGroups);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching CARTO basemap style, falling back to unfiltered style', error);
    }
  }
  return style;
}

export default {
  VOYAGER: baseUrl.replace('{basemap}', 'voyager'),
  POSITRON: baseUrl.replace('{basemap}', 'positron'),
  DARK_MATTER: baseUrl.replace('{basemap}', 'dark-matter'),
  VOYAGER_NOLABELS: baseUrl.replace('{basemap}', 'voyager-nolabels'),
  POSITRON_NOLABELS: baseUrl.replace('{basemap}', 'positron-nolabels'),
  DARK_MATTER_NOLABELS: baseUrl.replace('{basemap}', 'dark-matter-nolabels')
} as const;
