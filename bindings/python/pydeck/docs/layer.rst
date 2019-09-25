.. _pydecklayer-api-documentation:

pydeck.Layer API Documentation
==============================

.. _pydecklayer:

pydeck.Layer
------------

.. code:: python

   class pydeck.Layer(
       self,
       type,
       data,
       id=None,
       **kwargs)

This class represents a kind of data visualization, like a scatterplot
or a hexbin chart. The full deck.gl layer catalog is accessible via
pydeck.

Understand keyword arguments in pydeck layers
---------------------------------------------

Keyword arguments vary by layer. A catalog of available layers in
deck.gl is viewable
`here <https://github.com/uber/deck.gl/tree/master/docs/layers#deckgl-layer-catalog-overview>`__.

A few important observations:

-  Not all layers have all parameters. For instance, ``get_position`` is
   available for a ``ScatterplotLayer`` but not ``ArcLayer``. Be sure to
   refer to the deck.gl layer catalog.
-  Styling conventions differ between deck.gl and pydeck. The deck.gl
   layer catalog documentation adheres to Javascript documentation
   standards; in pydeck, functions and class names follow Python
   conventions:

   -  Parameters are ``snake_case`` (e.g., ``getPosition`` in deck.gl is
      ``get_position`` in pydeck)
   -  Class names in deck.gl are treated as class names in pydeck,
      (e.g., ``HexagonLayer`` remains ``HexagonLayer`` in both
      libraries)

Currently in its beta version pydeck will not raise an error on
incorrect or omitted layer positional arguments–if nothing renders in
your viewport after changing the arguments, check your browser's
developer console or review the layer catalog.

The ``type`` positional argument
--------------------------------

In the ``pydeck.Layer`` object, ``type`` is a required argument and
where you pass the desired layer's deck.gl class name–that is, you
should set it to the deck.gl layer you wish to plot. For example, notice
how ``type`` below gives you a `deck.gl
HexagonLayer <https://deck.gl/#/examples/core-layers/hexagon-layer>`__:

.. code:: python

   import pydeck as pdk

   UK_ACCIDENTS_DATA = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'

   layer = pdk.Layer(
       'HexagonLayer',  # `type` positional argument is here
       UK_ACCIDENTS_DATA,
       get_position='[lng, lat]',
       auto_highlight=True,
       elevation_scale=50,
       pickable=True,
       elevation_range=[0, 3000],
       extruded=True,                 
       coverage=1)

   # Set the viewport location
   view_state = pdk.ViewState(
       longitude=-1.415,
       latitude=52.2323,
       zoom=6,
       min_zoom=5,
       max_zoom=15,
       pitch=40.5,
       bearing=-27.36)

   # Combined all of it and render a viewport
   r = pdk.Deck(layers=[layer], initial_view_state=view_state)
   r.to_html('hexagon-example.html')

Try changing ``type`` above to ``ScatterplotLayer`` and add some
``ScatterplotLayer`` attributes, ``get_fill_color`` and ``radius``:

.. code:: python

   layer = pdk.Layer(
       'ScatterplotLayer',                 # Change the `type` positional argument here
       UK_ACCIDENTS_DATA,
       get_position='[lng, lat]',
       auto_highlight=True,
       radius=1000,                        # Radius is given in meters
       get_fill_color=[180, 0, 200, 140],  # Set an RGBA value for fill
       pickable=True)

Expression parsers in pydeck layer arguments
--------------------------------------------

One particularly powerful feature of pydeck is an in-built Javascript
expression parser that can process a limited subset of Javascript–no
functions are allowed, but data accessors, boolean conditions, inline
logical statements, arithmetic operations, and arrays are available.

To demonstrate the expression parser, change the color input in
``get_fill_color`` to a string:

.. code:: python

   layer = pdk.Layer(
       'ScatterplotLayer',
       UK_ACCIDENTS_DATA,
       get_position='[lng, lat]',
       auto_highlight=True,
       radius=1000,
       get_fill_color='[180, 0, 200, 140]',
       pickable=True)

The result of the render will be the same as the last image. The
expression parser in deck.gl processes the ``get_fill_color`` argument
of ``'[180, 0, 200, 140]'`` and converts it to a list of constants.

The expression parser has access to the variables in your data, so these
operations can be combined:

.. code:: python

   layer = pdk.Layer(
       'ScatterplotLayer',
       UK_ACCIDENTS_DATA,
       get_position='[lng, lat]',
       auto_highlight=True,
       radius=1000,
       get_fill_color='[255, lng > 0 ? 200 * lng : -200 * lng, lng, 140]',
       pickable=True)

In particular, ``get_position`` takes ``[lng, lat]`` in many of these
examples. This is deck.gl's expression parser reading the data passed to
pydeck and extracting longitude and latitude as a coordinate pair.

Suppose you have a CSV as follows, where the location in the first field
in the CSV (here, "coordinates")–

.. code:: plaintext

   coordinates,classification
   "[0.0, 0.0]",A
   "[0.0, 0.0]",A
   "[0.0, 1.0]",B
   "[0.0, 1.0]",C

``get_position`` here should be specified as
``get_position='coordinates'``

If your coordinates are flattened, you will specify your position as
``get_position='[lng,lat]'``

.. code:: plaintext

   lng,lat,classification
   0.0,0.0,A
   0.0,0.0,A
   0.0,1.0,B
   0.0,1.0,C

Example: Vancouver property values
==================================

.. code:: python

   import pydeck

   DATA_URL = "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/geojson/vancouver-blocks.json"
   LAND_COVER = [[[-123.0, 49.196], [-123.0, 49.324], [-123.306, 49.324], [-123.306, 49.196]]]

   INITIAL_VIEW_STATE = pydeck.ViewState(
     latitude=49.254,
     longitude=-123.13,
     zoom=11,
     max_zoom=16,
     pitch=45,
     bearing=0
   )

   polygon = pydeck.Layer(
       'PolygonLayer',
       LAND_COVER,
       stroked=False,
       get_polygon='-',  # processes the data as a flat longitude-latitude pair
       get_fill_color=[0, 0, 0, 0]
   )

   geojson = pydeck.Layer(
       'GeoJsonLayer',
       DATA_URL,
       opacity=0.8,
       stroked=False,
       filled=True,
       extruded=True,
       wireframe=True,
       get_elevation="properties.valuePerSqm / 20",
       get_fill_color="[255, 255, properties.growth * 255]",
       get_line_color=[255, 255, 255],
       pickable=True
   )

   r = pydeck.Deck(
       layers=[polygon, geojson],
       initial_view_state=INITIAL_VIEW_STATE)

   r.to_html()
