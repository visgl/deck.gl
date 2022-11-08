CARTO Styles
============

CARTO provides data-driven out-of-the-box styling functions for colors. Check the full list of `Carto styles in deck.gl <https://deck.gl/docs/api-reference/carto/styles>`_.

Example
^^^^^^^

.. code-block:: python

    import pydeck as pdk
    from carto_auth import CartoAuth
    from pydeck_carto import register_carto_layer, get_layer_credentials
    from pydeck_carto.layer import MapType, CartoConnection
    from pydeck_carto.styles import color_bins

    # Authentication with CARTO
    carto_auth = CartoAuth.from_oauth()

    # Register CartoLayer in pydeck
    register_carto_layer()

    # Render CartoLayer in pydeck with color bins style
    layer = pdk.Layer(
        "CartoLayer",
        data="SELECT geom, pct_higher_ed FROM `cartobq.public_account.higher_edu_by_county`",
        type_=MapType.QUERY,
        connection=CartoConnection.CARTO_DW,
        credentials=get_layer_credentials(carto_auth),
        get_fill_color=color_bins("pct_higher_ed", [0, 20, 30, 40, 50, 60, 70], "PinkYl"),
        get_line_color=[0, 0, 0, 100],
        line_width_min_pixels=0.5,
        pickable=True,
    )
    map_style = pdk.map_styles.ROAD
    view_state = pdk.ViewState(latitude=38, longitude=-98, zoom=3)
    tooltip={"text": "Higher education percentage: {pct_higher_ed} %"}
    pdk.Deck(layer, map_style=map_style, initial_view_state=view_state, tooltip=tooltip)

.. figure:: images/color-bins.png

.. code-block:: python

    # Render CartoLayer in pydeck with color categories style
    layer = pdk.Layer(
        "CartoLayer",
        data="SELECT geom, landuse_type FROM `cartobq.public_account.wburg_parcels`",
        type_=MapType.QUERY,
        connection=CartoConnection.CARTO_DW,
        credentials=get_layer_credentials(carto_auth),
        get_fill_color=color_categories(
            "landuse_type",
            [
                "Multi-Family Walk-Up Buildings",
                "Multi-Family Elevator Buildings",
                "Mixed Residential And Commercial Buildings",
                "Parking Facilities",
                "1 and 2 Family Buildings",
                "Commercial and Office Buildings",
                "Vacant Land",
                "Public Facilities and Institutions",
                "Transportation and Utility",
                "Open Space and Outdoor Recreation",
                "Industrial and Manufacturing",
            ],
            "Bold",
        ),
        get_line_color=[0, 0, 0, 100],
        line_width_min_pixels=0.5,
        pickable=True,
    )
    map_style = pdk.map_styles.ROAD
    view_state = pdk.ViewState(latitude=40.715, longitude=-73.959, zoom=14)
    tooltip={
        "html": "<b>Land use type:</b><br>{landuse_type}",
        "style": {"color": "black", "backgroundColor": "#84D2F6"}
    }
    pdk.Deck(layer, map_style=map_style, initial_view_state=view_state, tooltip=tooltip)

.. figure:: images/color-categories.png

.. code-block:: python

    # Render CartoLayer in pydeck with color continuous style
    layer = pdk.Layer(
        "CartoLayer",
        data="SELECT geom, value FROM cartobq.public_account.temps",
        type_=MapType.QUERY,
        connection=CartoConnection.CARTO_DW,
        credentials=get_layer_credentials(carto_auth),
        get_fill_color=color_continuous("value", [70, 75, 80, 85, 90, 95, 100], "Peach"),
        point_radius_min_pixels=2.5,
        pickable=True,
    )
    map_style = pdk.map_styles.ROAD
    view_state = pdk.ViewState(latitude=34, longitude=-98, zoom=3)
    tooltip={
        "html": "<b>Temperature:</b> {value}°F",
        "style": {"color": "white"}
    }
    pdk.Deck(layer, map_style=map_style, initial_view_state=view_state, tooltip=tooltip)

.. figure:: images/color-continuous.png

Reference
^^^^^^^^^

.. automodule:: pydeck_carto.styles
    :members:
