import json

from pydeck import Deck, Effect


def test_effect_constructor():
    expected = {"@@type": "AmbientLight", "lightId": "ambient", "intensity": 0.5}
    assert json.loads(Effect("AmbientLight", light_id="ambient", intensity=0.5).to_json()) == expected


def test_effect_omits_none_properties():
    assert json.loads(Effect("AmbientLight", color=None).to_json()) == {"@@type": "AmbientLight"}


def test_nested_lighting_effect():
    effect = Effect(
        "LightingEffect",
        ambient_light=Effect("AmbientLight", intensity=0.5),
        sun_light=Effect("SunLight", timestamp=1554927200000, _shadow=True),
    )

    assert json.loads(effect.to_json()) == {
        "@@type": "LightingEffect",
        "ambientLight": {"@@type": "AmbientLight", "intensity": 0.5},
        "sunLight": {"@@type": "SunLight", "timestamp": 1554927200000, "_shadow": True},
    }


def test_post_process_effect():
    effect = Effect("PostProcessEffect", module="brightnessContrast", brightness=0.2, contrast=-0.1)

    assert json.loads(effect.to_json()) == {
        "@@type": "PostProcessEffect",
        "module": "brightnessContrast",
        "brightness": 0.2,
        "contrast": -0.1,
    }


def test_deck_effects():
    effect = Effect("LightingEffect", ambient=Effect("AmbientLight"))
    deck = Deck(layers=[], effects=[effect], map_provider=None)

    assert json.loads(deck.to_json())["effects"] == [
        {"@@type": "LightingEffect", "ambient": {"@@type": "AmbientLight"}}
    ]


def test_deck_effects_raw_dict():
    effects = [{"@@type": "PostProcessEffect", "module": "vignette", "radius": 0.5}]

    assert json.loads(Deck(layers=[], effects=effects, map_provider=None).to_json())["effects"] == effects
