import os
import glob

here = os.path.dirname(os.path.abspath(__file__))

# EXAMPLES_DIR is the pydeck examples directory (bindings/pydeck/examples)
EXAMPLES_DIR = os.path.abspath(os.path.join(here, "..", "..", "examples"))

# EXAMPLE_GLOB is the list of code example files from pydeck. Examples may live directly
# in examples/ (the default group) or in a subfolder (examples/<group>/), which becomes a
# labeled section on the gallery page. The whole gallery pipeline is keyed by each file's
# base name, so subfolders group the grid without affecting page/thumbnail/toctree naming.
EXAMPLE_GLOB = sorted(
    path
    for path in glob.glob(os.path.join(EXAMPLES_DIR, "**", "*.py"), recursive=True)
    if not os.path.basename(path).startswith("_")
)
# EXAMPLE_NAMES represents the snake_case names of the examples on the website
EXAMPLE_NAMES = [os.path.splitext(os.path.basename(p))[0] for p in EXAMPLE_GLOB]

# Gallery grid grouping. Examples directly in examples/ fall under DEFAULT_GROUP; examples
# in examples/<folder>/ are grouped under the title-cased folder name. GROUP_ORDER pins the
# section order; any remaining groups follow alphabetically.
DEFAULT_GROUP = "Layers"
GROUP_ORDER = ["Layers", "Extensions"]


def group_label(example_path):
    """Return the gallery section label for an example file path."""
    parts = os.path.relpath(example_path, EXAMPLES_DIR).split(os.sep)
    if len(parts) > 1:
        return parts[0].replace("_", " ").title()
    return DEFAULT_GROUP


def grouped_examples():
    """Return an ordered list of (section_label, [snake_case_names]) for the grid."""
    groups = {}
    for path in EXAMPLE_GLOB:
        name = os.path.splitext(os.path.basename(path))[0]
        groups.setdefault(group_label(path), []).append(name)
    ordered, seen = [], set()
    for label in GROUP_ORDER:
        if label in groups:
            ordered.append((label, sorted(groups[label])))
            seen.add(label)
    for label in sorted(groups):
        if label not in seen:
            ordered.append((label, sorted(groups[label])))
    return ordered


# GALLERY_DIR is the directory of the files for the gallery page, locally / before Sphinx processing
GALLERY_DIR = os.path.join(here, "../gallery/")
# HTML_DIR is the directory of the .html files for the gallery page, locally / before Sphinx processing
HTML_DIR = os.path.join(here, "../gallery/html/")
# LOCAL_IMAGE_DIR is the directory of the .png thumbnails for the gallery page, locally / before Sphinx processing
LOCAL_IMAGE_DIR = os.path.join(here, "../gallery/images/")
# HOSTED_STATIC_PATH is where static files are written for the web server of the hosted docs
HOSTED_STATIC_PATH = "../_static/"
# DECKGL_URL_BASE is the link to the deck.gl API reference document for the layers
DECKGL_URL_BASE = "https://deck.gl/docs/api-reference/layers/"
# LOCAL_DOCS_PATH is the path to the pydeck documentation directory in this git repo
LOCAL_DOCS_PATH = os.path.join(here, "..")
