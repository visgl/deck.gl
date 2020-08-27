import os
import glob

here = os.path.dirname(os.path.abspath(__file__))

# EXAMPLE_GLOB is the directory of the code examples from pydeck
EXAMPLE_GLOB = [os.path.join(here, "..", g) for g in glob.glob("../examples/*.py")]
# EXAMPLE_NAMES represents the snake_case names of the examples on the website
EXAMPLE_NAMES = [os.path.basename(g).replace(".py", "") for g in glob.glob("../examples/*.py")]
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
