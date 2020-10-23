const base_url = 'https://basemaps.cartocdn.com/gl/{basemap}-gl-style/style.json';

export default {
  VOYAGER: base_url.replace('{basemap}', 'voyager'),
  POSITRON: base_url.replace('{basemap}', 'positron'),
  DARK_MATTER: base_url.replace('{basemap}', 'dark-matter')
};
