Effects
-------

.. automodule:: pydeck.bindings.effect
    :members:
    :undoc-members:
    :show-inheritance:

``pydeck.Effect`` represents an object that the deck.gl frontend constructs from JSON.
Effect and light properties use the same snake-case to camel-case conversion as layers::

    import pydeck as pdk

    lighting = pdk.Effect(
        "LightingEffect",
        ambient=pdk.Effect("AmbientLight", intensity=0.6),
        sun=pdk.Effect(
            "SunLight",
            timestamp=1564696800000,
            intensity=1.8,
            _shadow=True,
        ),
    )

    deck = pdk.Deck(layers=[layer], effects=[lighting])

Lighting
--------

``LightingEffect`` accepts lights as directly named keyword arguments. The names are
arbitrary, but each value must be one light rather than an array of lights. Supported
light types are:

- ``AmbientLight``
- ``DirectionalLight``
- ``PointLight``
- ``SunLight``
- ``CameraLight``

See the Lighting section of the gallery for a runnable example of every light type.

Post-processing
---------------

Post-processing modules are selected by name and apply to the rendered deck.gl canvas::

    contrast = pdk.Effect(
        "PostProcessEffect",
        module="brightnessContrast",
        brightness=0.15,
        contrast=0.3,
    )

The bundled module catalog contains:

- ``brightnessContrast``
- ``bulgePinch``
- ``colorHalftone``
- ``denoise``
- ``dotScreen``
- ``edgeWork``
- ``fxaa``
- ``hexagonalPixelate``
- ``hueSaturation``
- ``ink``
- ``magnify``
- ``noise``
- ``sepia``
- ``swirl``
- ``tiltShift``
- ``triangleBlur``
- ``vibrance``
- ``vignette``
- ``zoomBlur``

Arbitrary shader modules cannot be serialized from Python. Post-processing currently
requires WebGL and does not support deck.gl's WebGPU renderer. See the Post Processing
gallery section for a runnable example of every bundled module.

Raw JSON
--------

Raw dictionaries with an ``"@@type"`` key remain supported and serialize equivalently
to ``Effect``. The typed wrapper is recommended for discoverability and consistent
keyword conversion.
