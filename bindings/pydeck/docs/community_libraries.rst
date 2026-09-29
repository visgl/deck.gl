Using deck.gl-community libraries
=================================

`deck.gl-community <https://github.com/visgl/deck.gl-community>`__ is a vis.gl repository of
add-on layers, extensions and widgets for deck.gl, published on npm as ``@deck.gl-community/*``.
These modules are maintained by the community and are not included in pydeck, but they can be
loaded into a pydeck visualization as custom libraries.

.. note::
   deck.gl-community packages do not publish script (UMD) bundles yet, so they cannot be loaded
   into pydeck today. The URLs and global names on this page are placeholders until they do.

How custom libraries are loaded
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

pydeck serializes a visualization to JSON. The frontend (``@deck.gl/jupyter-widget``) converts the
JSON into deck.gl objects, resolving each ``@@type`` against a catalog of the classes it bundles.
``pydeck.settings.custom_libraries`` adds JavaScript bundles to that catalog:

.. code-block:: python

    import pydeck as pdk

    pdk.settings.custom_libraries = [
        {
            "libraryName": "deckCommunity",
            "resourceUri": "https://unpkg.com/@deck.gl-community/layers@~9.4.0/dist/dist.min.js",
        }
    ]

For each entry, the frontend adds a ``<script>`` tag for ``resourceUri`` and waits for the bundle
to assign the global variable ``window[libraryName]``. It then registers the library's exports:

- Exports that start with a capital letter are registered as classes, and can be used as the
  ``type`` of a :class:`pydeck.bindings.layer.Layer`,
  :class:`pydeck.bindings.extension.Extension` or :class:`pydeck.bindings.widget.Widget`.
- Other exports, except those starting with ``_``, are registered as functions.

Layers that reference a custom class are rendered once the library has loaded. The libraries are
read when a :class:`pydeck.bindings.deck.Deck` is created in Jupyter, or when
:meth:`pydeck.bindings.deck.Deck.to_html` is called, so set ``custom_libraries`` first.

A bundle can be loaded this way if:

- It is a script bundle (UMD or IIFE) that assigns its exports to a global variable.
  ``libraryName`` must be the name of that global.
- It uses the deck.gl, luma.gl and loaders.gl classes provided by pydeck, instead of bundling its
  own copy. The pydeck frontend exposes them as the ``deck``, ``luma`` and ``loaders`` globals,
  the same globals used by the deck.gl script bundles (``deck.gl/dist.min.js``).

The same mechanism loads your own layers. See :doc:`custom_layers`.

Version compatibility
^^^^^^^^^^^^^^^^^^^^^

deck.gl-community packages follow the major and minor version of deck.gl. A library must be built
for the same deck.gl version as the pydeck frontend. This version of pydeck uses deck.gl
``~9.4``, so load ``@deck.gl-community/*@~9.4.0``. A bundle built for another version may fail to
load, or its layers may render incorrectly.

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

See the `ZoomOpacityExtension gallery example <gallery/zoom_opacity_extension.html>`__ for a
complete script, which shows hexagons of decreasing size in consecutive zoom bands.

Available packages
^^^^^^^^^^^^^^^^^^

.. list-table::
   :header-rows: 1
   :widths: 30 45 25

   * - Package
     - Contents
     - Loadable in pydeck
   * - `@deck.gl-community/layers <https://visgl.github.io/deck.gl-community/docs/modules/layers>`__
     - Add-on layers and ``ZoomOpacityExtension``
     - Pending script bundle
   * - `@deck.gl-community/geo-layers <https://visgl.github.io/deck.gl-community/docs/modules/geo-layers>`__
     - Geospatial layers
     - Pending script bundle
   * - `@deck.gl-community/infovis-layers <https://visgl.github.io/deck.gl-community/docs/modules/infovis-layers>`__
     - Non-geospatial layers
     - Pending script bundle
   * - `@deck.gl-community/graph-layers <https://visgl.github.io/deck.gl-community/docs/modules/graph-layers>`__
     - Graph visualization
     - Pending script bundle
   * - `@deck.gl-community/timeline-layers <https://visgl.github.io/deck.gl-community/docs/modules/timeline-layers>`__
     - Timeline layers
     - Pending script bundle
   * - `@deck.gl-community/basemap-layers <https://visgl.github.io/deck.gl-community/docs/modules/basemap-layers>`__
     - Basemap layer and map style helpers
     - Pending script bundle
   * - `@deck.gl-community/widgets <https://visgl.github.io/deck.gl-community/docs/modules/widgets>`__
     - UI widgets
     - Pending script bundle
   * - `@deck.gl-community/editable-layers <https://visgl.github.io/deck.gl-community/docs/modules/editable-layers>`__
     - Interactive editing of geometries
     - Pending script bundle. Edits are not sent back to Python.
   * - `@deck.gl-community/three <https://visgl.github.io/deck.gl-community/docs/modules/three>`__
     - Layers rendered with three.js
     - Pending script bundle
   * - ``@deck.gl-community/leaflet``, ``bing-maps``, ``react``
     - Integrations with other frameworks
     - Not applicable

A package being loadable does not mean every layer in it works from Python. Layers that need
JavaScript callbacks, for example, are limited to what the JSON expression syntax supports. See
`Understanding keyword arguments in pydeck layers <layer.html#understanding-keyword-arguments-in-pydeck-layers>`__.
