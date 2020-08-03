.. figure:: logo.svg
   :class: logo
   :target: /

| High-scale spatial rendering in Python, powered by `deck.gl <https://deck.gl/#/>`__.

Get started by `installing pydeck <installation.rst>`__.

Gallery
^^^^^^^
.. raw:: html
   :file: gallery/html/grid.html

.. include:: images.rst

Overview
^^^^^^^^

`pydeck in Jupyter <jupyter.rst>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Uniquely integrated with the Jupyter ecosystem, pydeck supports interactions in a visualization that communicate
with the Jupyter kernel. Read more about usage in Jupyter `here <jupyter.html>`__.

.. figure:: https://i.imgur.com/qenLNEf.gif
   
   `Conway's Game of Life <https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life>`__ in pydeck

.. figure:: https://camo.githubusercontent.com/020e7749ebfb7a8f50403fcbc8650833608c006d/68747470733a2f2f6d7962696e6465722e6f72672f7374617469632f6c6f676f2e7376673f763d6639663064393237623637636339646339396437383863383232636132316330
   :target: https://mybinder.org/v2/gh/uber/deck.gl/binder
   :alt: Hosted Jupyter notebook examples

   `See hosted examples on mybinder.org <https://mybinder.org/v2/gh/uber/deck.gl/binder>`__

`Layers <layer.rst>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Configure one of the many deck.gl layers for rendering in pydeck.

`Deck <deck.rst>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Better understand the main object within visualization, used to write data out to a widget in Jupyter,
save it out to HTML, and configure some global parameters of a visualization, like its size or
tooltip.

`Data utilities <data_utils.rst>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
A handful of functions to make certain common data exercises easier,
like automatically fitting a viewport to data on a map or quickly coloring categorical data

`ViewState <view_state.rst>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Used to set the precise location of a user's vantage point on the data, like
a user's zoom level

`View <view.rst>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Used to enable or disable map controls and also modify the kind of map projection,
like plotting in flat plane instead of plotting on a mercator projection

`LightSettings (Experimental) <light_settings.rst>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Configure the lighting within a visualization.

.. note::
   The pydeck library assumes Internet access. You will need an Internet connection or the visualization will not render.

   Currently, pydeck will **not** raise an error on incorrect or omitted Layer arguments.
   If nothing renders in your viewport, check your browser's `developer console <https://javascript.info/devtools>`__
   or review the layer catalog. You are encouraged to file an issue by clicking `here <https://github.com/visgl/deck.gl/issues/new?assignees=&labels=bug&template=bug-report.md&title=pydeck:>`__
   and mention ``pydeck`` in the title.


Index
^^^^^

.. toctree::
   :maxdepth: 1
   :titlesonly:

.. toctree::
   :maxdepth: 1
   :caption: Getting started

   installation
   contributing

.. toctree::
   :maxdepth: 1
   :caption: API documentation

   layer
   deck
   data_utils
   view_state
   view
   light_settings

.. toctree::
   :maxdepth: 1
   :caption: Jupyter

   jupyter
   binary_transfer

.. toctree::
   :maxdepth: 1
   :caption: Further customization

   tooltip
   custom_layers

.. toctree::
   :maxdepth: 1
   :caption: Development

   CHANGELOG

.. raw:: html

   <style>
     .logo {
       width: 320px;
     }
   </style>
