Welcome to pydeck's documentation!
==================================

If you have not already, `follow the installation instructions <https://github.com/uber/deck.gl/blob/master/bindings/pydeck/README.md>`_

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

.. figure:: https://camo.githubusercontent.com/020e7749ebfb7a8f50403fcbc8650833608c006d/68747470733a2f2f6d7962696e6465722e6f72672f7374617469632f6c6f676f2e7376673f763d6639663064393237623637636339646339396437383863383232636132316330
   :target: https://mybinder.org/v2/gh/uber/deck.gl/binder?filepath=examples
   :alt: Hosted Jupyter notebook examples
   :align: left

   `See hosted examples on mybinder.org <https://mybinder.org/v2/gh/uber/deck.gl/binder?filepath=examples>`_

.. figure:: https://i.imgur.com/qenLNEf.gif
   
   `Conway's Game of Life <https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life>`_ in pydeck

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
