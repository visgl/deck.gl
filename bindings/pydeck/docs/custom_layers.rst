Custom layers
=============

Custom deck.gl layers are available in pydeck, loaded dynamically.

Layers are loaded dynamically by the frontend, when the output from 
:meth:`pydeck.bindings.deck.Deck.show` or :meth:`pydeck.bindings.deck.Deck.to_html` is called and loaded.

Custom layers must subclass deck.gl's Layer or CompositeLayer classes.
They must also include deck.gl and @deck.gl/layers as external libraries in the webpack config.
You can see `this repo <https://github.com/ajduberstein/pydeck_custom_layer>`__ for a minimal example.

Code for usage of that example layer can be seen here:

.. literalinclude:: ../examples/custom_layer.py
   :language: python

.. image:: gallery/images/custom_layer.png
   :width: 500
