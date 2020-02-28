Custom layers
=============

Custom deck.gl layers are available in pydeck, loaded dynamically.

Layers are loaded dynamically, when the widget is initialized.

Custom layers must subclass deck.gl's Layer or CompositeLayer classes.
They must also include deck.gl and @deck.gl/layers as external libraries.
A template is provided in this documentation as an example.

WIP
