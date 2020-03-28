import pydeck as pdk

H3_HEX_DATA = "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/sf.h3cells.json"

# Define a layer to display on a map
layer = pdk.Layer(
    "H3HexagonLayer",
    H3_HEX_DATA,
    pickable=True,
    stroked=True,
    filled=True,
    extruded=False,
    get_hexagon="hex",
    get_fill_color="[255 - count, 255, count]",
    get_line_color=[255, 255, 255],
    line_width_min_pixels=2,
)

# Set the viewport location
view_state = pdk.ViewState(
    latitude=37.7749295, longitude=-122.4194155, zoom=11, bearing=0, pitch=30
)


# Render
r = pdk.Deck(
    layers=[layer], initial_view_state=view_state, tooltip={"text": "Count: {count}"}
)
r.to_html("h3_hexagon_layer.html", notebook_display=False)
