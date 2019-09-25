.. _pydeckdeck-api-documentation:

Deck API Documentation
=============================

.. _pydeckdeck:

pydeck.Deck
-----------

.. code:: python

   class pydeck.Deck(
       layers=[],
       views=[pydeck.View()],
       map_style="mapbox://styles/mapbox/dark-v9",
       mapbox_key=None,
       initial_view_state=pydeck.ViewState(),
       height=500,
       width='100%',
       tooltip=True,
   )

Constructor for a Deck object, similar to the `Deck`_ class from deck.gl

Requires a Mapbox API token to display a basemap, see notes below.

Parameters
^^^^^^^^^^

-  ``layers`` : ``pydeck.Layer`` or ``list`` of ``pydeck.Layer``,
   default ``[]``

Layers of the map (represented by ``pydeck.Layer`` objects) to be
rendered

-  ``views`` : ``list`` of ``pydeck.View``, default ``[pydeck.View()]``

List of ``pydeck.View`` objects to render. If rendering a standard map,
there is rarely a reason to modify this.

-  ``map_style`` : ``str``, default ``"mapbox://styles/mapbox/dark-v9"``

URI for Mapbox basemap style

-  ``mapbox_key`` : ``str``, default ``None``

Read on initialization from the MAPBOX_API_KEY environment variable.
Defaults to None if not set. If not using a basemap, you can set this
value to ``None``. See
`https://docs.mapbox.com/help/how-mapbox-works/access-tokens/#mapbox-account-dashboard`_

-  ``initial_view_state`` : ``pydeck.ViewState``, default
   ``pydeck.ViewState()``

Initial camera angle relative to the map, defaults to a fully zoomed out
0, 0-centered map with 0 pitch and bearing To compute a viewport from
data, see ``pydeck.data_utils.compute_viewport``

-  ``height`` : ``int`` or ``str``, default ``500``

Height of visualization, in pixels (if a number) or as a CSS value
string

-  ``width`` : ``int`` or ``str``, default ``100%``

Width of visualization, in pixels (if a number) or as a CSS value string

-  ``tooltip`` : ``bool``, default ``True``

Boolean indicating whether or not a tooltip should be generated when
hovering over a data layer Individual layers must have ``pickable`` set
to ``True`` to be displayed in the tooltip.

.. _pydeckdeckshow:

pydeck.Deck.show
----------------

.. code:: python

   pydeck.Deck.show(self)

Displays current Deck object for a Jupyter notebook

.. _pydeckdeckupdate:

pydeck.Deck.update
------------------

.. code:: python

   pydeck.Deck.update(self)

Updates a deck.gl map to reflect the current state of the configuration.
For example, if you've changed the color or height of a pydeck Layer,
you can render the changes in Jupyter, without re-rendering your window.
This function only works in a Jupyter environment.

.. _pydeckdeckto_html:

pydeck.Deck.to_html
-------------------

.. code:: python

   pydeck.Deck.to_html(
       self,
       filename=None,
       open_browser=False,
       notebook_display=True,
       iframe_width=500,
       iframe_height=500)

Writes a file and loads it to an iframe, if ``notebook\_display`` is set
to ``True``. Otherwise, writes a file and optionally opens it in a web
browser.

The single HTML page uses RequireJS, a technology that requires Internet
access to download the Javascript libraries which render a
visualization. In other words, you will need an Internet connection or
the visualization will not render.

.. _parameters-1:

Parameters
^^^^^^^^^^

-  ``filename`` :

.. _Deck: https://deck.gl/#/documentation/deckgl-api-reference/deck
.. _`https://docs.mapbox.com/help/how-mapbox-works/access-tokens/#mapbox-account-dashboard`: https://docs.mapbox.com/help/how-mapbox-works/access-tokens/#mapbox-account-dashboard
