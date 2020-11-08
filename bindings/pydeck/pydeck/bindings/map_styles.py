import warnings


DARK = 'dark'
LIGHT = 'light'
SATELLITE = 'satellite'
ROAD = 'road'
DARK_NO_LABELS = 'DARK_NO_LABELS'
LIGHT_NO_LABELS = 'LIGHT_NO_LABELS'

MAPBOX_SATELLITE = "mapbox://styles/mapbox/satellite-v9"
MAPBOX_LIGHT = "mapbox://styles/mapbox/light-v9"
MAPBOX_ROAD = "mapbox://styles/mapbox/streets-v9"
MAPBOX_DARK = "mapbox://styles/mapbox/dark-v9"
MAPBOX_DARK_NO_LABELS = "https://rivulet-zhang.github.io/dataRepo/mapbox/style/map-style-dark-v9-no-labels.json"

CARTO_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
CARTO_DARK_NO_LABELS = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'
CARTO_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
CARTO_LIGHT_NO_LABELS = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'
CARTO_ROAD = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'


GOOGLE_SATELLITE = 'satellite'
GOOGLE_ROAD = 'roadmap'


styles = {
    DARK: {
        'mapbox': MAPBOX_DARK,
        'carto': CARTO_DARK,
    },
    LIGHT: {
        'mapbox': MAPBOX_LIGHT,
        'carto': CARTO_LIGHT,
    },
    DARK_NO_LABELS: {
        'mapbox': MAPBOX_DARK_NO_LABELS,
        'carto': CARTO_DARK_NO_LABELS
    },
    LIGHT_NO_LABELS: {
        'carto': CARTO_LIGHT_NO_LABELS
    },
    SATELLITE: {
        'mapbox': MAPBOX_SATELLITE,
        'google_maps': GOOGLE_SATELLITE,
    },
    ROAD: {
        'carto': CARTO_ROAD,
        'google_maps': GOOGLE_ROAD,
        'mapbox': MAPBOX_ROAD,
    }
}


def get_from_map_identifier(map_identifier: str, provider: str) -> str:
    """Attempt to get a style URI by map provider, otherwise pass the map identifier
    to the API service

    Helps provide reasonable cross-provider default map styles
    """
    try:
        return styles[map_identifier][provider]
    except KeyError:
        return map_identifier
