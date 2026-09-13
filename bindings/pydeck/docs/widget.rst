Widget
======

.. automodule:: pydeck.bindings.widget
    :members:
    :undoc-members:
    :show-inheritance:

The ``pydeck.Widget`` object follows the same convention as ``pydeck.Layer`` for styling keyword arguments and the ``type`` positional argument. 
Read `Understanding keyword arguments in pydeck layers <layer.html#understanding-keyword-arguments-in-pydeck-layers>`__ documentation for more information.

Split views with SplitterWidget
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The deck.gl `SplitterWidget <https://deck.gl/docs/api-reference/widgets/splitter-widget>`__ stacks two
views side by side (``"horizontal"``) or top and bottom (``"vertical"``) with a draggable divider. The widget
manages the ``views`` prop itself, so create the ``Deck`` with ``views=None``. Pass ``pydeck.View`` objects as
the leaves of ``view_layout``; either leaf can be another ``view_layout`` dict to nest more splits.

.. code-block:: python

   import pydeck as pdk

   splitter = pdk.Widget(
       "SplitterWidget",
       view_layout={
           "orientation": "horizontal",
           "initialSplit": 0.5,
           "views": [
               pdk.View(type="MapView", id="left", controller=True),
               pdk.View(type="MapView", id="right", controller=True),
           ],
       },
   )

   deck = pdk.Deck(
       layers=[...],
       views=None,
       initial_view_state={
           "left": {"latitude": 51.47, "longitude": -0.45, "zoom": 6},
           "right": {"latitude": 40.64, "longitude": -73.78, "zoom": 6},
       },
       widgets=[splitter],
       map_provider=None,
   )

Keys inside the ``view_layout`` dict are sent to deck.gl verbatim, so use deck.gl's camelCase names
(``initialSplit``, ``minSplit``, ``maxSplit``, ``editable``). Key ``initial_view_state`` on the view ids to give
each pane its own camera. See the `SplitView <gallery/split_view.html>`__ example. For fixed layouts without a
draggable divider, position views directly; see `Multi-view layouts <view.html#multi-view-layouts>`__.
