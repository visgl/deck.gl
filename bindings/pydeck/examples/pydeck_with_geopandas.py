import pydeck
import geopandas

world = geopandas.read_file(geopandas.datasets.get_path("naturalearth_lowres"))

centroids = geopandas.GeoDataFrame()
centroids["geometry"] = world.geometry.centroid
centroids["name"] = world.name

layers = [
    pydeck.Layer("GeoJsonLayer", data=world, get_fill_color=[0, 0, 0],),
    pydeck.Layer(
        "TextLayer", data=centroids, get_position="geometry.coordinates", get_color=[255, 255, 255], get_text="name"
    ),
]

pydeck.Deck(layers, map_style="").to_html("pydeck-with-geopandas.html")
