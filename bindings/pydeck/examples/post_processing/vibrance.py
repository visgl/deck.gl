"""Vibrance
========

Increase the intensity of less-saturated colors.
"""

import pydeck as pdk

palette = [[239, 71, 111], [255, 209, 102], [6, 214, 160], [17, 138, 178], [131, 56, 236]]
cells = []
for row in range(7):
    for column in range(11):
        x = (column - 5) * 0.72
        y = (row - 3) * 0.72
        cells.append(
            {
                "polygon": [[x - 0.32, y - 0.32], [x + 0.32, y - 0.32], [x + 0.32, y + 0.32], [x - 0.32, y + 0.32]],
                "color": palette[(row + column) % len(palette)],
            }
        )

scene_layer = pdk.Layer(
    "PolygonLayer",
    data=cells,
    get_polygon="polygon",
    get_fill_color="color",
    get_line_color=[245, 245, 245],
    line_width_min_pixels=2,
    stroked=True,
    filled=True,
)
initial_view_state = pdk.ViewState(latitude=0, longitude=0, zoom=5.7)

effect = pdk.Effect("PostProcessEffect", module="vibrance", amount=0.9)
deck = pdk.Deck(
    layers=[scene_layer],
    effects=[effect],
    initial_view_state=initial_view_state,
    map_provider=None,
    show_error=True,
)
deck.to_html("vibrance.html", css_background_color="#090d18")
