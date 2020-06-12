import glob
import os

from .notebook_utils import nbconvert

here = os.path.dirname(os.path.abspath(__file__))
nb_path = os.path.join(here, "../../examples")
nb_glob = os.path.join(nb_path, "*.json")


def test_nbconvert():
    for fname in glob.glob(nb_glob):
        assert nbconvert(fname)
