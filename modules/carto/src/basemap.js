const base_url = 'https://basemaps.cartocdn.com/gl/{basemap}-gl-style/style.json';

export default {
  VOYAGER: base_url.replace('{basemap}', 'voyager'),
  POSITRON: base_url.replace('{basemap}', 'positron'),
  DARK_MATTER: base_url.replace('{basemap}', 'dark-matter'),
  VOYAGER_NOLABELS: base_url.replace('{basemap}', 'voyager-nolabels'),
  POSITRON_NOLABELS: base_url.replace('{basemap}', 'positron-nolabels'),
  DARK_MATTER_NOLABELS: base_url.replace('{basemap}', 'dark-matter-nolabels')
};
