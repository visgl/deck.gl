import json

FIXTURE_STRING = """{"initialViewState": {"bearing": -27.396674584323023, "latitude": 52.232395363869415, "longitude": -1.4157267858730052, "maxZoom": 15, "minZoom": 5, "pitch": 40.5, "zoom": 6.6}, "layers": [{"coverage": 1, "data": "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv", "elevationRange": [0, 3000], "elevationScale": 50, "extruded": true, "getPosition": "[lng, lat]", "id": "heatmap", "lightSettings": {"ambientRatio": 0.4, "diffuseRatio": 0.6, "lightsPosition": [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000], "numberOfLights": 2}, "type": "HexagonLayer"}], "mapStyle": "mapbox://styles/mapbox/dark-v9", "views": [{"controller": true, "type": "MapView"}]}"""
FIXTURE_JSON = json.loads(FIXTURE_STRING)
