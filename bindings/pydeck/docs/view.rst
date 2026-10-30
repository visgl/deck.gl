View
====

.. automodule:: pydeck.bindings.view
    :members:
    :undoc-members:
    :show-inheritance:

Multi-view layouts
^^^^^^^^^^^^^^^^^^

By default ``Deck`` sends no ``views`` and deck.gl renders a single full-screen ``MapView`` driven by the
``Deck(controller=...)`` argument. ``Deck`` also accepts a list of views. Each view is positioned with the deck.gl ``x``, ``y``, ``width``
and ``height`` props, which take pixels (``204``), percentages (``"50%"``), or CSS ``calc()``
expressions (``"calc(100% - 220px)"``). The browser resolves these bounds on every resize, so
responsive layouts need no JavaScript.

Give every view an ``id`` and key ``initial_view_state`` on those ids to control each camera
independently. Set ``clear=True`` on a view that overlaps another so it wipes the pixels underneath.
Basemaps follow the first view only, so use ``map_provider=None`` for multi-view layouts.

.. code-block:: python

   import pydeck as pdk

   main_view = pdk.View(type="MapView", id="main", controller=True)
   minimap = pdk.View(
       type="MapView",
       id="minimap",
       x="calc(100% - 220px)",
       y=16,
       width=204,
       height=140,
       controller=False,
       clear=True,
   )

   deck = pdk.Deck(
       layers=[...],
       views=[main_view, minimap],
       initial_view_state={
           "main": {"latitude": 51.47, "longitude": -0.45, "zoom": 6},
           "minimap": {"latitude": 51.47, "longitude": -0.45, "zoom": 1},
       },
       map_provider=None,
   )

See the `MultiView <gallery/multi_view.html>`__ example. For panes the user can resize by dragging,
use the ``SplitterWidget`` instead; see `Split views with SplitterWidget <widget.html#split-views-with-splitterwidget>`__.

Non-geospatial charts
^^^^^^^^^^^^^^^^^^^^^

deck.gl's ``OrthographicView`` (2D) and ``OrbitView`` (3D) render plain x/y/z coordinates, which makes pydeck
usable for charts: axes, gridlines and labels are just ``LineLayer`` and ``TextLayer`` data in the same
coordinate space as the marks. Set ``map_provider=None`` since there is no basemap.

- ``OrthographicView``: pass ``flip_y=False`` so y grows upward as in a conventional chart. The ``controller``
  argument accepts a dict of deck.gl ``OrthographicController`` options, for example
  ``controller={"zoomAxis": "X", "maxBounds": [[0, 0], [100, 100]]}``.
- ``OrbitView``: ``orbit_axis="Z"`` orbits around the vertical axis; the camera is set with ``rotation_x`` and
  ``rotation_orbit`` in the view state.

See `Non-geospatial views <view_state.html#non-geospatial-views>`__ for the matching view state parameters
and the `Scatter Plot <gallery/scatter_plot.html>`__, `Bar Chart <gallery/bar_chart.html>`__ and
`Surface Plot <gallery/surface_plot.html>`__ examples.
