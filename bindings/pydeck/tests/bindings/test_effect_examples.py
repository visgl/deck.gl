import glob
import os

EXAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "examples"))
EFFECT_EXAMPLES = sorted(
    path
    for group in ("lighting", "post_processing")
    for path in glob.glob(os.path.join(EXAMPLES_DIR, group, "*.py"))
    if not os.path.basename(path).startswith("_")
)

LIGHT_TYPES = ["AmbientLight", "CameraLight", "DirectionalLight", "PointLight", "SunLight"]
POST_PROCESS_MODULES = [
    "brightnessContrast",
    "bulgePinch",
    "colorHalftone",
    "denoise",
    "dotScreen",
    "edgeWork",
    "fxaa",
    "hexagonalPixelate",
    "hueSaturation",
    "ink",
    "magnify",
    "noise",
    "sepia",
    "swirl",
    "tiltShift",
    "triangleBlur",
    "vibrance",
    "vignette",
    "zoomBlur",
]


def test_all_light_types_have_a_gallery_example():
    sources = " ".join(open(path).read() for path in EFFECT_EXAMPLES)
    missing = [light_type for light_type in LIGHT_TYPES if light_type not in sources]
    assert not missing, "Missing gallery examples for: {}".format(missing)


def test_all_post_process_modules_have_a_gallery_example():
    sources = " ".join(open(path).read() for path in EFFECT_EXAMPLES)
    missing = [module for module in POST_PROCESS_MODULES if module not in sources]
    assert not missing, "Missing gallery examples for: {}".format(missing)
