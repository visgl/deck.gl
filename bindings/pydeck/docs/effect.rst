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

- ``AmbientLight`` (`example <gallery/ambient_light.html>`__)
- ``DirectionalLight`` (`example <gallery/directional_light.html>`__)
- ``PointLight`` (`example <gallery/point_light.html>`__)
- ``SunLight`` (`example <gallery/sun_light.html>`__)
- ``CameraLight`` (`example <gallery/camera_light.html>`__)

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

- ``brightnessContrast`` (`example <gallery/brightness_contrast.html>`__)
- ``bulgePinch`` (`example <gallery/bulge_pinch.html>`__)
- ``colorHalftone`` (`example <gallery/color_halftone.html>`__)
- ``denoise`` (`example <gallery/denoise.html>`__)
- ``dotScreen`` (`example <gallery/dot_screen.html>`__)
- ``edgeWork`` (`example <gallery/edge_work.html>`__)
- ``fxaa`` (`example <gallery/fxaa.html>`__)
- ``hexagonalPixelate`` (`example <gallery/hexagonal_pixelate.html>`__)
- ``hueSaturation`` (`example <gallery/hue_saturation.html>`__)
- ``ink`` (`example <gallery/ink.html>`__)
- ``magnify`` (`example <gallery/magnify.html>`__)
- ``noise`` (`example <gallery/noise.html>`__)
- ``sepia`` (`example <gallery/sepia.html>`__)
- ``swirl`` (`example <gallery/swirl.html>`__)
- ``tiltShift`` (`example <gallery/tilt_shift.html>`__)
- ``triangleBlur`` (`example <gallery/triangle_blur.html>`__)
- ``vibrance`` (`example <gallery/vibrance.html>`__)
- ``vignette`` (`example <gallery/vignette.html>`__)
- ``zoomBlur`` (`example <gallery/zoom_blur.html>`__)

Arbitrary shader modules cannot be serialized from Python. Post-processing currently
requires WebGL and does not support deck.gl's WebGPU renderer.

Raw JSON
--------

Raw dictionaries with an ``"@@type"`` key remain supported and serialize equivalently
to ``Effect``. The typed wrapper is recommended for discoverability and consistent
keyword conversion.
