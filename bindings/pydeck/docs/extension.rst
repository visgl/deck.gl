Extension
=========

.. automodule:: pydeck.bindings.extension
    :members:
    :undoc-members:
    :show-inheritance:

The ``pydeck.Extension`` object follows the same convention as ``pydeck.Layer`` for styling keyword arguments and the ``type`` positional argument.
Read `Understanding keyword arguments in pydeck layers <layer.html#understanding-keyword-arguments-in-pydeck-layers>`__ documentation for more information.

Extensions are attached to a layer through its ``extensions`` keyword argument. Options
that configure the extension itself (for example ``filter_size``) are passed to
``pydeck.Extension``, while the accessors and props the extension adds to the layer (for
example ``get_filter_value`` and ``filter_range``) are passed to the ``pydeck.Layer``::

    import pydeck as pdk

    layer = pdk.Layer(
        "ScatterplotLayer",
        data=df,
        get_position="position",
        get_radius=100,
        # Props added to the layer by the extension:
        get_filter_value="value",
        filter_range=[0, 1],
        # The extension itself, with its own options:
        extensions=[pdk.Extension("DataFilterExtension", filter_size=1)],
    )

Available extensions
^^^^^^^^^^^^^^^^^^^^^

The ``type`` corresponds to a class from the deck.gl
`extensions catalog <https://deck.gl/docs/api-reference/extensions/overview>`__:

- `BrushingExtension <https://deck.gl/docs/api-reference/extensions/brushing-extension>`__
- `ClipExtension <https://deck.gl/docs/api-reference/extensions/clip-extension>`__
- `CollisionFilterExtension <https://deck.gl/docs/api-reference/extensions/collision-filter-extension>`__
- `DataFilterExtension <https://deck.gl/docs/api-reference/extensions/data-filter-extension>`__
- `FillStyleExtension <https://deck.gl/docs/api-reference/extensions/fill-style-extension>`__
- `Fp64Extension <https://deck.gl/docs/api-reference/extensions/fp64-extension>`__
- `MaskExtension <https://deck.gl/docs/api-reference/extensions/mask-extension>`__
- `PathStyleExtension <https://deck.gl/docs/api-reference/extensions/path-style-extension>`__
- `TerrainExtension <https://deck.gl/docs/api-reference/extensions/terrain-extension>`__

Layer compatibility and limitations
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Not every extension works with every layer. Because several extensions run on the GPU,
some layers — notably the CPU-aggregating layers of ``@deck.gl/aggregation-layers`` such
as ``CPUGridLayer`` and ``HexagonLayer`` — are unsupported, and some extensions cap how
many can be combined. Each extension documents its own supported layers and constraints
in a **Limitations** section, for example:

- `DataFilterExtension limitations <https://deck.gl/docs/api-reference/extensions/data-filter-extension#limitations>`__
- `MaskExtension limitations <https://deck.gl/docs/api-reference/extensions/mask-extension#limitations>`__
- `CollisionFilterExtension limitations <https://deck.gl/docs/api-reference/extensions/collision-filter-extension#limitations>`__

Refer to the individual extension page for the layer it is applied to before using it.
