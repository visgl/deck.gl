import pydeck as pdk
import geopandas as gpd

world = gpd.read_file("https://naciscdn.org/naturalearth/110m/cultural/ne_110m_admin_0_countries.zip")
# deck.gl is only compatible with WGS84
world = world.to_crs("EPSG:4326")

centroids = gpd.GeoDataFrame(geometry=world.geometry.centroid)
centroids["name"] = world.NAME

layers = [
    # Black background of the country polygons
    pdk.Layer(
        "GeoJsonLayer",
        data=world,
        get_fill_color=[0, 0, 0],
    ),
    # Alternative way using PolygonLayer, should the above not work
    # pdk.Layer(
    #     "PolygonLayer",
    #     data=world,
    #     get_position="geometry.coordinates",
    #     get_fill_color=[0, 0, 0],
    # ),
    # Overlay country names at their centroids.
    pdk.Layer(
        "TextLayer",
        data=centroids,
        # Use this to get geometry coordinates out of a raw GeoDataFrame
        get_position="geometry.coordinates",
        get_size=16,
        get_color=[255, 255, 255],
        get_text="name",
    ),
]

pdk.Deck(layers, map_provider=None).to_html("geopandas_integration.html", css_background_color="cornflowerblue")
