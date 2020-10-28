const base_url = 'https://basemaps.cartocdn.com/gl/{basemap}-gl-style/style.json';

export default {
  VOYAGER: base_url.replace('{basemap}', 'voyager'),
  POSITRON: base_url.replace('{basemap}', 'positron'),
  DARK_MATTER: base_url.replace('{basemap}', 'dark-matter'),
  VOYAGER_NOLABELS: base_url.replace('{basemap}', 'voyager-nolabels'),
  POSITRON_NOLABELS: base_url.replace('{basemap}', 'positron-nolabels'),
  DARK_MATTER_NOLABELS: base_url.replace('{basemap}', 'dark-matter-nolabels'),

  // // BASEMAPS WITHOUT LABELS
  // POSITRON_NOLABELS:
  //   'https://gist.githubusercontent.com/Josmorsot/9001e0dbb01a61a2ddd5dbc1a6c18392/raw/7c273769b2dcd69f1a25f8799373a3d1826df33e/positron-no-labels.json',
  // DARK_MATTER_WITHOUT_LABELS:
  //   'http://bmp-01.stag.cartodb.net/gl/dark-matter-nolabels-gl-style/style.json'
};
