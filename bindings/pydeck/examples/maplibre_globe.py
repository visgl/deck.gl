"""
GlobeView
=========

Over 33,000 power plants of the world plotted by their production capacity (given by height)
and fuel type (green if renewable) on a MapLibre globe view.

This example demonstrates using MapLibre's globe projection with deck.gl layers by setting
map_provider='maplibre' and map_projection='globe'. The globe view uses MapLibre's
MapboxOverlay with interleaved rendering for optimal performance.
"""
import pydeck as pdk
import pandas as pd

POWER_PLANTS = "https://raw.githubusercontent.com/ajduberstein/geo_datasets/master/global_power_plant_database.csv"

df = pd.read_csv(POWER_PLANTS)


def is_green(fuel_type):
    """Return a green RGB value if a facility uses a renewable fuel type"""
    if fuel_type.lower() in ("nuclear", "water", "wind", "hydro", "biomass", "solar", "geothermal"):
        return [10, 230, 120]
    return [230, 158, 10]


df["color"] = df["primary_fuel"].apply(is_green)

# Use MapView with a globe projection
view_state = pdk.ViewState(latitude=51.47, longitude=0.45, zoom=0)

layers = [
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
    initial_view_state=view_state,
    tooltip={"text": "{name}, {primary_fuel} plant, {country}"},
    layers=layers,
    # Use MapLibre with globe projection
    map_provider="maplibre",
    map_style="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    map_projection="globe",
)

deck.to_html("maplibre_globe.html", css_background_color="black", offline=True)
