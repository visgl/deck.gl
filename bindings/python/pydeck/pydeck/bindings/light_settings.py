class LightSettings(object):
    def __init__(
        self,
        lights_position=None,
        ambient_ratio=None,
        diffuse_ratio=None,
        specular_ratio=None,
        lights_strength=None,
        number_of_lights=2
    ):
        self.lights_position = lights_position
        self.ambient_ratio = ambient_ratio
        self.diffuse_ratio = diffuse_ratio
        self.specular_ratio = specular_ratio
        self.lights_strength = lights_strength
        self.number_of_lights = number_of_lights
