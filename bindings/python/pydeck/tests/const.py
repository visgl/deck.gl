import json

FIXTURE_STRING = """{"initialViewState": {"bearing": -27.396674584323023, "latitude": 52.232395363869415, "longitude": -1.4157267858730052, "maxZoom": 15, "minZoom": 5, "pitch": 40.5, "zoom": 6.6}, "layers": [{"colorRange": [[1, 152, 189], [73, 227, 206], [216, 254, 181], [254, 237, 177], [254, 173, 84], [209, 55, 78]], "coverage": 1, "data": "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv", "elevationRange": [0, 3000], "elevationScale": 50, "extruded": true, "getPosition": "-", "getRadius": 1000, "id": "heatmap", "lightSettings": {"ambientRatio": 0.4, "diffuseRatio": 0.6, "lightsPosition": [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000], "numberOfLights": 2}, "opacity": 1, "radius": 1000, "type": "HexagonLayer", "upperPercentile": 100}], "mapStyle": "mapbox://styles/mapbox/dark-v9", "views": [{"controller": true, "type": "MapView"}]}""" # noqa

FIXTURE_JSON = json.loads(FIXTURE_STRING)
