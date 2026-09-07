ViewState
=========

.. automodule:: pydeck.bindings.view_state
    :members:


Non-geospatial views
^^^^^^^^^^^^^^^^^^^^

``ViewState`` forwards any keyword argument to deck.gl (snake_case is converted to camelCase), so it also
describes the camera of non-geospatial views. Leave ``latitude`` and ``longitude`` unset and use the view's
own parameters instead:

.. list-table::
   :header-rows: 1

   * - View
     - View state parameters
   * - ``OrthographicView``
     - ``target``, ``zoom`` (a number, or ``[zoom_x, zoom_y]``), ``min_zoom``, ``max_zoom``
   * - ``OrbitView``
     - ``target``, ``zoom``, ``rotation_x``, ``rotation_orbit``, ``min_zoom``, ``max_zoom``,
       ``min_rotation_x``, ``max_rotation_x``

.. code-block:: python

   import pydeck as pdk

   view = pdk.View(type="OrthographicView", controller=True, flip_y=False)
   view_state = pdk.ViewState(target=[50, 50, 0], zoom=2.2, min_zoom=1, max_zoom=6)
   deck = pdk.Deck(layers=[...], views=[view], initial_view_state=view_state, map_provider=None)

``initial_view_state`` also accepts a plain dict, for example one keyed by view id in a multi-view layout.
Dict keys are passed to deck.gl verbatim, so they must already be camelCase (``"rotationX"``, not
``"rotation_x"``).

``pydeck.data_utils.compute_view`` fits geospatial data only; pick ``target`` and ``zoom`` for
non-geospatial views by hand. See the `Scatter Plot <gallery/scatter_plot.html>`__,
`Bar Chart <gallery/bar_chart.html>`__ and `Surface Plot <gallery/surface_plot.html>`__ examples.
