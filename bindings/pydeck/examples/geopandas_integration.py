import pydeck as pdk
import geopandas as gpd

world = gpd.read_file(gpd.datasets.get_path("naturalearth_lowres"))

centroids = gpd.GeoDataFrame()
centroids["geometry"] = world.geometry.centroid
centroids["name"] = world.name

layers = [
    pdk.Layer("GeoJsonLayer", data=world, get_fill_color=[0, 0, 0],),
    pdk.Layer(
        "TextLayer",
        data=centroids,
        get_position="geometry.coordinates",
        get_size=16,
        get_color=[255, 255, 255],
        get_text="name",
    ),
]

pdk.Deck(layers, map_provider=None).to_html("geopandas_integration.html", css_background_color="cornflowerblue")
