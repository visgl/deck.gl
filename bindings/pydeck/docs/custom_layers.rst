Custom layers
=============

Custom deck.gl layers are available in pydeck, loaded dynamically.

Layers are loaded dynamically, when the widget is initialized.

Custom layers must subclass deck.gl's Layer or CompositeLayer classes.
They must also include deck.gl and @deck.gl/layers as external libraries in the webpack config.
You can see the `this repo<https://github.com/ajduberstein/pydeck_custom_layer>_`
for a minimal example.

Code for usage of that example layer can be seen here:

.. literalinclude:: ../examples/custom_layer.py
   :language: python
