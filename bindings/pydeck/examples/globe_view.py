"""
GlobeView
=========

Over 33,000 power plants of the world plotted by their production capacity (given by height)
and fuel type (green if renewable) on an experimental deck.gl GlobeView.
"""
import pydeck as pdk
import pandas as pd

COUNTRIES = "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson"
POWER_PLANTS = "https://raw.githubusercontent.com/ajduberstein/geo_datasets/master/global_power_plant_database.csv"

df = pd.read_csv(POWER_PLANTS)


def is_green(fuel_type):
    """Return a green RGB value if a facility uses a renewable fuel type"""
    if fuel_type.lower() in ("nuclear", "water", "wind", "hydro", "biomass", "solar", "geothermal"):
        return [10, 230, 120]
    return [230, 158, 10]


df["color"] = df["primary_fuel"].apply(is_green)

view_state = pdk.ViewState(latitude=51.47, longitude=0.45, zoom=2, min_zoom=2)

# Set height and width variables
view = pdk.View(type="_GlobeView", controller=True, width=1000, height=700)


layers = [
    pdk.Layer(
        "GeoJsonLayer",
        id="base-map",
        data=COUNTRIES,
        stroked=False,
        filled=True,
        get_fill_color=[200, 200, 200],
    ),
    pdk.Layer(
        "ColumnLayer",
        id="power-plant",
        data=df,
        get_elevation="capacity_mw",
        get_position=["longitude", "latitude"],
        elevation_scale=100,
        pickable=True,
        auto_highlight=True,
        radius=20000,
        get_fill_color="color",
    ),
]

deck = pdk.Deck(
    views=[view],
    initial_view_state=view_state,
    tooltip={"text": "{name}, {primary_fuel} plant, {country}"},
    layers=layers,
    # Note that this must be set for the globe to be opaque
    parameters={"cull": True},
)

deck.to_html("globe_view.html", css_background_color="black")
