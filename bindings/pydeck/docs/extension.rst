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
        "PathLayer",
        data=df,
        get_path="path",
        get_color="color",
        get_width=5,
        # Props added to the layer by the extension:
        get_dash_array=[8, 4],
        dash_justified=True,
        # The extension itself, with its own options:
        extensions=[pdk.Extension("PathStyleExtension", dash=True)],
    )

See the `PathStyleExtension gallery example <gallery/path_style_extension.html>`__ for a
complete, runnable script.

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

Python-specific caveats
~~~~~~~~~~~~~~~~~~~~~~~~~

- **Accessors are expressions, not functions.** Many extensions add accessors to the
  layer (``get_filter_value``, ``get_filter_category``, ``get_brushing_target``,
  ``get_dash_array``, ...). In pydeck these are serialized as ``@@=`` strings and
  evaluated by deck.gl's JSON expression parser, which supports property access and simple
  operators (for example ``get_filter_value="properties.timeOfDay"``) but **not arbitrary
  JavaScript functions**. Logic that cannot be written as an expression cannot be passed
  from Python.
- **Binary transport.** Combining an extension accessor with
  ``Layer(use_binary_transport=True)`` is not currently tested; prefer standard (JSON)
  data transport when using extension accessors.
