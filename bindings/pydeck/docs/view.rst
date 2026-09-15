View
====

.. automodule:: pydeck.bindings.view
    :members:
    :undoc-members:
    :show-inheritance:

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
