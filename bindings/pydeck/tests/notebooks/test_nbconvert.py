import glob
import os

from .notebook_utils import nbconvert

here = os.path.dirname(os.path.abspath(__file__))
nb_path = os.path.join(here, "../../examples")
nb_glob = os.path.join(nb_path, "*.ipynb")


def test_nbconvert():
    for fname in glob.glob(nb_glob):
        # NOTE Massive data sets notebook takes too long to render, skipping for now
        if '04' in fname or '06' in fname:
            continue
        print(fname)
        assert nbconvert(fname)
