const baseUrl = 'https://basemaps.cartocdn.com/gl/{basemap}-gl-style/style.json';

export default {
  VOYAGER: baseUrl.replace('{basemap}', 'voyager'),
  POSITRON: baseUrl.replace('{basemap}', 'positron'),
  DARK_MATTER: baseUrl.replace('{basemap}', 'dark-matter'),
  VOYAGER_NOLABELS: baseUrl.replace('{basemap}', 'voyager-nolabels'),
  POSITRON_NOLABELS: baseUrl.replace('{basemap}', 'positron-nolabels'),
  DARK_MATTER_NOLABELS: baseUrl.replace('{basemap}', 'dark-matter-nolabels')
} as const;
