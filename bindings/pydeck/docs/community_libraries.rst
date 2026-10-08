Using deck.gl-community libraries
=================================

`deck.gl-community <https://github.com/visgl/deck.gl-community>`__ is a vis.gl repository of
add-on layers, extensions and widgets for deck.gl, published on npm as ``@deck.gl-community/*``.
These modules are maintained by the community and are not included in pydeck, but they can be
loaded into a pydeck visualization as ES module custom libraries.

.. note::
   Loading deck.gl-community modules is experimental. It relies on importing deck.gl by package
   name (see :doc:`custom_layers`), which may change in a later release, and has not been tested
   in VS Code or Google Colab yet.

How custom libraries are loaded
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

pydeck serializes a visualization to JSON. The frontend (``@deck.gl/jupyter-widget``) converts the
JSON into deck.gl objects, resolving each ``@@type`` against a catalog of the classes it bundles.
``pydeck.settings.register_library`` adds a JavaScript module to that catalog:

.. code-block:: python

    import pydeck as pdk

    pdk.settings.register_library(npm="@deck.gl-community/layers")

The frontend imports the module and registers its exports:

- Exports that start with a capital letter are registered as classes, and can be used as the
  ``type`` of a :class:`pydeck.bindings.layer.Layer`,
  :class:`pydeck.bindings.extension.Extension` or :class:`pydeck.bindings.widget.Widget`.
- Other exports, except those starting with ``_``, are registered as functions.

Layers that reference a custom class are rendered once the library has loaded. The libraries are
read when a :class:`pydeck.bindings.deck.Deck` is created in Jupyter, or when
:meth:`pydeck.bindings.deck.Deck.to_html` is called, so register them first.

pydeck loads the package from `esm.sh <https://esm.sh>`__, which builds it as an ES module and bundles
its other dependencies. Imports of deck.gl, luma.gl, loaders.gl and math.gl are left for pydeck to
resolve, so the library uses pydeck's copies. To load from a self-hosted esm.sh instead, set
``pdk.settings.esm_cdn`` before registering.

The same mechanism loads your own layers. See :doc:`custom_layers`.

Version compatibility
^^^^^^^^^^^^^^^^^^^^^

deck.gl-community packages follow the major and minor version of deck.gl, and a library must be
built for the same deck.gl version as the pydeck frontend. Without a version, ``npm`` loads the
latest release for pydeck's deck.gl version (``~9.4`` for this version of pydeck). To pin one, add it
to the package name, for example ``npm="@deck.gl-community/layers@9.4.1"``. pydeck warns when the
version is for another deck.gl version, which may fail to load or render incorrectly.

Example: 3D trees
^^^^^^^^^^^^^^^^^

``TreeLayer`` from ``@deck.gl-community/three`` draws 3D trees, building each trunk and canopy with
three.js. Its accessors read DataFrame columns, like the layers in deck.gl:

.. code-block:: python

    pdk.settings.register_library(npm="@deck.gl-community/three")

    layer = pdk.Layer(
        "TreeLayer",
        df,
        get_position=["lng", "lat"],
        # "pine", "oak", "palm", "birch" or "cherry"
        get_tree_type="tree_type",
        # Meters
        get_height="height",
        get_canopy_radius="canopy_radius",
        get_canopy_color="canopy_color",
        pickable=True,
    )

``TreeLayer`` calls its accessors as functions, so pass each one a column, not a constant value.

See the `Paris Trees gallery example <gallery/paris_trees.html>`__ for a complete script, which
draws the street trees around the Arc de Triomphe in autumn colors.

Example: zoom-dependent opacity
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

pydeck output is static JSON, and pydeck does not run code when the view changes. Event handlers
like ``on_view_state_change`` are not functional in pydeck v0.9+ (see :doc:`event_handling`), so
layer props cannot depend on the zoom level from Python. Showing a layer only within a zoom range,
like the ``minzoom``, ``maxzoom`` and ``["interpolate", ["linear"], ["zoom"], ...]`` expressions in
MapLibre styles, needs a layer extension that reads the zoom level in the browser.

``ZoomOpacityExtension`` from ``@deck.gl-community/layers`` scales a layer's ``opacity`` by
``[zoom, opacity]`` stops, linearly interpolated and clamped at the ends. The stops are passed to
the layer's ``zoom_opacity`` keyword argument:

.. code-block:: python

    layer = pdk.Layer(
        "HexagonLayer",
        data,
        get_position=["lng", "lat"],
        radius=1000,
        # Fade in between zoom 8.5 and 9.5, fade out between zoom 10.5 and 11.5
        zoom_opacity=[[8.5, 0], [9.5, 1], [10.5, 1], [11.5, 0]],
        extensions=[pdk.Extension("ZoomOpacityExtension")],
    )

``ZoomOpacityExtension`` is added in
`visgl/deck.gl-community#781 <https://github.com/visgl/deck.gl-community/pull/781>`__ and is
available once a ``@deck.gl-community/layers`` release includes it.

See the `ZoomOpacityExtension gallery example <gallery/zoom_opacity_extension.html>`__ for a
complete script, which shows hexagons of decreasing size in consecutive zoom bands.

Available packages
^^^^^^^^^^^^^^^^^^

Each of these packages loads with ``register_library(npm=...)``, for example
``npm="@deck.gl-community/geo-layers"``.

.. list-table::
   :header-rows: 1
   :widths: 35 65

   * - Package
     - Contents
   * - `@deck.gl-community/layers <https://visgl.github.io/deck.gl-community/docs/modules/layers>`__
     - Add-on layers and ``ZoomOpacityExtension``
   * - `@deck.gl-community/geo-layers <https://visgl.github.io/deck.gl-community/docs/modules/geo-layers>`__
     - Geospatial layers
   * - `@deck.gl-community/infovis-layers <https://visgl.github.io/deck.gl-community/docs/modules/infovis-layers>`__
     - Non-geospatial layers
   * - `@deck.gl-community/graph-layers <https://visgl.github.io/deck.gl-community/docs/modules/graph-layers>`__
     - Graph visualization
   * - `@deck.gl-community/timeline-layers <https://visgl.github.io/deck.gl-community/docs/modules/timeline-layers>`__
     - Timeline layers
   * - `@deck.gl-community/basemap-layers <https://visgl.github.io/deck.gl-community/docs/modules/basemap-layers>`__
     - Basemap layer and map style helpers
   * - `@deck.gl-community/widgets <https://visgl.github.io/deck.gl-community/docs/modules/widgets>`__
     - UI widgets
   * - `@deck.gl-community/editable-layers <https://visgl.github.io/deck.gl-community/docs/modules/editable-layers>`__
     - Interactive editing of geometries. Edits are not sent back to Python.
   * - `@deck.gl-community/three <https://visgl.github.io/deck.gl-community/docs/modules/three>`__
     - Layers rendered with three.js, such as ``TreeLayer``. esm.sh bundles three.js into the module

``@deck.gl-community/leaflet``, ``bing-maps`` and ``react`` integrate deck.gl with other
frameworks and do not apply to pydeck.

A package loading does not mean every layer in it works from Python. Layers that need
JavaScript callbacks, for example, are limited to what the JSON expression syntax supports. See
`Understanding keyword arguments in pydeck layers <layer.html#understanding-keyword-arguments-in-pydeck-layers>`__.
