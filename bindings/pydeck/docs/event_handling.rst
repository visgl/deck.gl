Event handling
^^^^^^^^^^^^^^

.. WARNING::
   Jupyter-specific features are not currently supported in pydeck v0.9+.

pydeck provides bidirectional interactions in Jupyter via event handlers,
``on_hover``, ``on_resize``, ``on_view_state_change``, and ``on_click``. Each corresponds
to the
`cursor <https://deck.gl/docs/developer-guide/interactivity#using-the-built-in-event-handling>`__
and `view state <https://deck.gl/docs/api-reference/core/deck#onviewstatechange>`__ events in the deck.gl
documentation.

When an event triggers these callbacks (like a click on the visualization), data is sent from the frontend
to the Jupyter kernel. The data structure varies slightly by handler.

To inspect the payload of a handler, you can print the result to an `ipywidgets HTML <https://ipywidgets.readthedocs.io/en/latest/examples/Widget%20List.html#HTML>`__ object.

For a live demo of the handlers, see `03 - Event handlers and data selection in pydeck <https://mybinder.org/v2/gh/uber/deck.gl/binder>`__
or run the `Jupyter demo locally <https://github.com/visgl/deck.gl/blob/master/bindings/pydeck/examples/03%20-%20Event%20handlers%20and%20data%20selection%20in%20pydeck.ipynb>`__.

The following code is a snippet from the notebook above, where a view state change triggers
a count of visible points.

.. code-block:: python

        from ipywidgets import HTML

        text = HTML(value='Move the viewport')
        layer = pdk.Layer(
            'ScatterplotLayer',
            df,
            pickable=True,
            get_position=['lng', 'lat'],
            get_fill_color=[255, 0, 0],
            get_radius=100
        )
        r = pdk.Deck(layer, initial_view_state=viewport)

        def filter_by_bbox(row, west_lng, east_lng, north_lat, south_lat):
            return west_lng < row['lng'] < east_lng and south_lat < row['lat'] < north_lat

        def filter_by_viewport(widget_instance, payload):
            try:
                west_lng, north_lat = payload['data']['nw']
                east_lng, south_lat = payload['data']['se']
                filtered_df = df[df.apply(lambda row: filter_by_bbox(row, west_lng, east_lng, north_lat, south_lat), axis=1)]
                text.value = 'Points in viewport: %s' % int(filtered_df.count()['lng'])
            except Exception as e:
                text.value = 'Error: %s' % e


        r.deck_widget.on_click(filter_by_viewport)
        display(text)
        r.show()



Cursor events with ``on_click``
------------------------------

Clicking data in a visualization passes the following data back as the ``payload`` object
in the ``on_click`` handler:

.. code-block:: python

        {
            'type': 'deck-click-event',
            'data': {
               'color': {
                   '0': int,
                   '1': int,
                   '2': int,
                   '3': int
               },
               'layer': str,  # The layer ID, which you can specify by passing `id=...` to a Layer; `None` if no layer is picked
               'index': int,  # The serial index of the clicked point in the data set; -1 if no layer is picked
               'picked': bool,
               'x': float,  # X coordinate of pixel on click
               'y': float,  # Y coordinate of pixel on click
               'pixel': [float, float],  # Pixel coordinate pair
               'coordinate': [float, float],  # Lat/lon coordinate pair
               'lngLat': [float, float],  # Duplicated information in 'coordinate'
               'devicePixel': [int, int],  # Pixel coordinate pair on device screen
               'pixelRatio': int,
               'object': {
                   # Metadata from selected clicked object which varies by layer
                }
            }
        }

The ``on_hover`` events are nearly identical in content, with the``type`` value of ``deck-hover-event``.
Only hovering over a layer will fire an event and hovering over the basemap alone will not.

.. image:: https://i.giphy.com/media/NUAAe4uewDjncNlwYQ/source.gif
  :width: 600
  :alt: pydeck on_click handler

View state change events with ``on_view_state_change``
------------------------------------------------------
Zooming in and out, panning, and changing pitch or bearing all constitute view state changes.
A view state change event sends a dictionary with the following information as the ``payload``:

.. code-block:: python

        {
            'type': 'deck-view-state-change-event',
            'data': {
                'width': int,
                'height': int,
                'latitude': float,
                'longitude': float,
                'zoom': float,
                'bearing': float,
                'pitch': float,
                'altitude': float,
                'maxZoom': float,
                'minZoom': float
                'maxPitch': float,
                'minPitch': float,
                'nw': [float, float],
                'se': [float, float]
            }
        }

Here ``nw`` and ``se`` represent the northwest and southeast corners of the current viewport.

.. image:: https://i.giphy.com/media/6rVa9CcA8suplaDEpi/giphy.gif
  :width: 600
  :alt: pydeck on_view_state_change handler

Resize events with ``on_resize``
--------------------------------

Resizing the viewport sends the height and width of the new visualization back as
the ``payload`` object:

.. code-block:: python

        {
           'type': 'deck-resize-event',
           'data': {
               'width': int,
               'height': int
            }
        }

.. image:: https://i.giphy.com/media/sD2SzoPs7p1uBzcmRf/source.gif
  :width: 600
  :alt: pydeck on_resize handler
