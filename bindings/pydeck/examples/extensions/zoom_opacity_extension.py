"""
ZoomOpacityExtension
====================

Personal injury road accidents in GB, aggregated into hexagons whose size depends on the zoom
level. Each ``HexagonLayer`` is visible within a zoom band and crossfades into the next one as
you zoom in, until individual accidents are drawn with a ``ScatterplotLayer``.

``ZoomOpacityExtension`` is not part of deck.gl. It comes from ``@deck.gl-community/layers``
and is loaded with ``pydeck.settings.custom_libraries``. See "Using deck.gl-community
libraries" in the pydeck documentation.

The ``zoom_opacity`` prop takes ``[zoom, opacity]`` stops that are linearly interpolated,
like a MapLibre ``["interpolate", ["linear"], ["zoom"], ...]`` expression.
"""

import pydeck as pdk

# TODO: confirm the bundle URL and global name once @deck.gl-community/layers publishes a UMD
# bundle. The package version should match the deck.gl version used by pydeck (9.4).
COMMUNITY_LAYERS_URL = "https://unpkg.com/@deck.gl-community/layers@~9.4.0/dist/dist.min.js"

pdk.settings.custom_libraries = [
    {"libraryName": "deckCommunity", "resourceUri": COMMUNITY_LAYERS_URL},
]

DATA_URL = "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv"


def zoom_band(min_zoom=None, max_zoom=None, fade_width=1):
    """Stops that show a layer between min_zoom and max_zoom, fading in and out at the edges.

    Same as ``zoomBand`` in @deck.gl-community/layers: the fades are centered on the band
    edges, so adjacent bands crossfade.
    """
    half = fade_width / 2
    stops = []
    if min_zoom is not None:
        stops += [[min_zoom - half, 0], [min_zoom + half, 1]]
    if max_zoom is not None:
        stops += [[max_zoom - half, 1], [max_zoom + half, 0]]
    return stops


# (hexagon radius in meters, zoom band)
BANDS = [
    (16000, zoom_band(max_zoom=7)),
    (4000, zoom_band(min_zoom=7, max_zoom=9)),
    (1000, zoom_band(min_zoom=9, max_zoom=11)),
    (250, zoom_band(min_zoom=11, max_zoom=13)),
]

zoom_opacity = pdk.Extension("ZoomOpacityExtension")

hexagon_layers = [
    pdk.Layer(
        "HexagonLayer",
        DATA_URL,
        id=f"hexagons-{radius}m",
        get_position=["lng", "lat"],
        radius=radius,
        coverage=0.9,
        opacity=0.8,
        pickable=True,
        # GPU aggregation allocates a cell for every bin in the data extent, which is too many
        # for small hexagons over all of GB. CPU aggregation only creates the non-empty bins.
        gpu_aggregation=False,
        # Prop added to the layer by the ZoomOpacityExtension:
        zoom_opacity=stops,
        extensions=[zoom_opacity],
    )
    for radius, stops in BANDS
]

points = pdk.Layer(
    "ScatterplotLayer",
    DATA_URL,
    id="accidents",
    get_position=["lng", "lat"],
    get_radius=15,
    radius_min_pixels=1.5,
    get_fill_color=[255, 140, 0],
    zoom_opacity=zoom_band(min_zoom=13),
    extensions=[zoom_opacity],
)

view_state = pdk.ViewState(longitude=-1.415, latitude=52.2323, zoom=6, min_zoom=5, max_zoom=16)

r = pdk.Deck(
    layers=[*hexagon_layers, points],
    initial_view_state=view_state,
    tooltip={"text": "{count} accidents"},
)
r.to_html("zoom_opacity_extension.html")
