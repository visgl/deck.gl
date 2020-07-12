Contributing to pydeck
======================

We encourage users to report bugs, fix them, and add features as desired.
We support our contributors in the #pydeck channel in the `deck.gl Slack workspace <https://join.slack.com/t/deckgl/shared_invite/zt-7oeoqie8-NQqzSp5SLTFMDeNSPxi7eg>`_,
and you are encouraged to ask questions there or file issues on the deck.gl GitHub. If you run into issues while using this guide, let us know.

For governance policy and code of conduct, please see the `deck.gl contribution guidelines <https://deck.gl/docs/contributing>`_.

Where to contribute
^^^^^^^^^^^^^^^^^^^

At its core, pydeck is three modules:

- @deck.gl/jupyter-widget, a Javascript library that helps bind deck.gl to a Jupyter environment
- @deck.gl/json, a Javascript library that converts JSON configurations to deck.gl visualizations
- pydeck, the Python wrapper around deck.gl

To contribute to either of the first two, you can follow the deck.gl contribution guidelines.

Development installation of pydeck
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Development assumes you are using Python 3.5 or above. You will also need `yarn <https://yarnpkg.com/en/docs/install>`_
for building deck.gl, which will build with your development installion of pydeck.

The following commands set up a virtual environment, build the entirety of deck.gl, install most development and testing dependencies, and then activate
enable pydeck to run on JupyterLab and Jupyter Notebook locally:

.. code-block:: bash

        git clone https://github.com/visgl/deck.gl
        cd deck.gl/bindings/pydeck
        make setup-env
        . env/bin/activate
        make init
        make prepare-jupyter

At this point, you likely want to verify that your local setup runs without issue by running ``make test``. 

Submitting a PR
^^^^^^^^^^^^^^^

In case you've never submitted a PR before or haven't in a while, you may want to review how to do so.
This article can 

Deck.gl will run a suite of local tests both on commit and on push. On push, deck.gl will run browser tests, which will take a bit
longer than the commit hook tests. Ideally these tests will pass locally before they make it to GitHub.

Before submitting a PR or committing, you should run `make test` to verify that your Python tests pass locally.
You should also run `pip install -e .` to rebuild pydeck locally. If you need to rebuild @deck.gl/json or @deck.gl/jupyter-widget,
you should run `yarn bootstrap`.

You are encouraged to add an example of your work in the ``pydeck/examples/`` directory along with your PR.

Building the documentation
^^^^^^^^^^^^^^^^^^^^^^^^^^

To build the documentation locally, run the following:

.. code-block:: bash

        cd deck.gl/bindings/pydeck/docs
        make docs

You can find the homepage at `pydeck/docs/_build/index.html`.
Running `python3 -m http.server` from `pydeck/docs/_build` will serve the documentation locally.
