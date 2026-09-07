View
====

.. automodule:: pydeck.bindings.view
    :members:
    :undoc-members:
    :show-inheritance:

Multi-view layouts
^^^^^^^^^^^^^^^^^^

``Deck`` accepts a list of views. Each view is positioned with the deck.gl ``x``, ``y``, ``width``
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
