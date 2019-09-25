.. pydeck documentation master file, created by
   sphinx-quickstart on Tue Sep 24 21:26:08 2019.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to pydeck's documentation!
==================================

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   layer
   deck
   data_utils
   tooltip
   view_state
   view
   light_settings


`Layers <layer.html>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Configure one of the many deck.gl layers for rendering in pydeck

`Deck <deck.html>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Used to write data out to a widget in Jupyter, save it out to HTML, and
configure some global parameters of a visualization, like its size or
tooltip.

`Data utilities <data_utils.html>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

A handful of functions to make certain common data exercises easier,
like automatically fitting to data on a map or coloring categorical data.

`ViewState <view_state.html>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Used to set the precise location of a user's vantage point on the data, like
a user's zoom level.

`View <view.html>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Used to enable/disable map controls and also modify the kind of map projection,
like plotting in flat plane instead of plotting on a mercator projection.


`LightSettings (Experimental) <light_settings.html>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Configure the lighting within a visualization.


Caveats
^^^^^^^

* Please note that pydeck assumes Internet access. You will need an Internet connection or the visualization will not render.

* | Currently, in its beta version **pydeck will NOT raise an error on incorrect or omitted layer arguments**.
  | If nothing renders in your viewport, check your browser's `developer console <https://javascript.info/devtools>`__
  | or review the layer catalog. If you're still stuck, file an issue by clicking `here <https://github.com/uber/deck.gl/issues/new?assignees=&labels=bug&template=bug-report.md&title=>`__.


Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
