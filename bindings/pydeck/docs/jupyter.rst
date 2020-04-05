Jupyter-specific features
=========================

Jupyter environments offer unique opportunities for two-way data interaction,
sharing data between the Python backend and visualization in deck.gl.

To use a visualization with these features, call :meth:`pydeck.bindings.deck.Deck.show` on the :class:`pydeck.bindings.deck.Deck` object
rather than :meth:`pydeck.bindings.deck.Deck.to_html`.

- *Data updates.* By calling :meth:`pydeck.bindings.deck.Deck.update` on a :class:`pydeck.bindings.deck.Deck` object with a new visualization configuration, you can seamless push new data into a pre-existing visualization.
   
.. figure:: https://i.imgur.com/qenLNEf.gif
   
   `Conway's Game of Life <https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life>`_ in pydeck

- *Binary data transfer.* For certain data sets pydeck can support many millions of points by using Jupyter's socket-level communication. Further documentation is `here <binary_transfer.html>`__.

- *Data selection.* Data can be selected within a pydeck visualization and pushed back to the client. Holding Command while clicking allows the user to select multiple points.
  
.. figure:: https://user-images.githubusercontent.com/2204757/66785863-55499680-ee93-11e9-9824-21c6f6468b25.gif
   :alt: Selecting data in Jupyter

Interactive examples for these features are available on mybinder.org. Click the Binder logo below:

.. figure:: https://camo.githubusercontent.com/020e7749ebfb7a8f50403fcbc8650833608c006d/68747470733a2f2f6d7962696e6465722e6f72672f7374617469632f6c6f676f2e7376673f763d6639663064393237623637636339646339396437383863383232636132316330
   :target: https://mybinder.org/v2/gh/uber/deck.gl/binder
   :alt: Hosted Jupyter notebook examples

   `See hosted examples on mybinder.org <https://mybinder.org/v2/gh/uber/deck.gl/binder>`_
