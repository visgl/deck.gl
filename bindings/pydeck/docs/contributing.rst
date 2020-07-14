Contributing to pydeck
======================

We encourage users to report bugs, fix them, and add features as desired.
We support our contributors in the #pydeck channel in the `deck.gl Slack workspace <https://join.slack.com/t/deckgl/shared_invite/zt-7oeoqie8-NQqzSp5SLTFMDeNSPxi7eg>`__.
If you run into issues while using this guide, let us know.

For governance policy and code of conduct, please see the `deck.gl contribution guidelines <https://deck.gl/docs/contributing>`__.

Where to contribute
^^^^^^^^^^^^^^^^^^^

At its core, pydeck is three modules:

- @deck.gl/jupyter-widget, a Javascript library that helps bind deck.gl to a Jupyter environment
- @deck.gl/json, a Javascript library that converts JSON configurations to deck.gl visualizations
- pydeck, the Python wrapper around deck.gl

To contribute to either of the first two, you can follow the deck.gl contribution guidelines.

Development installation of pydeck
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Please develop using Python 3.5 or above. You will also need `yarn <https://yarnpkg.com/en/docs/install>`__,
which will build deck.gl for use with your development installion of pydeck.

The following commands set up a virtual environment, build the entirety of deck.gl, install most development and testing dependencies, and then activate
enable pydeck to run on JupyterLab and Jupyter Notebook locally:

.. code-block:: bash

        git clone https://github.com/visgl/deck.gl
        cd deck.gl/bindings/pydeck
        make setup-env
        . env/bin/activate
        make init
        make prepare-jupyter

At this point, verify that this new local copy of pydeck works by running ``make test``. 

Submitting a PR
^^^^^^^^^^^^^^^

Deck.gl will run a suite of local tests both on commit and on push. On push, deck.gl will run browser tests, which will take a bit
longer than the commit hook tests. Ideally, these tests will pass locally before you push your branch to GitHub. Once pushed,
tests will also run on Travis CI. Generally the deck.gl team will review your PR within 2-3 days.

Before submitting a PR, you should run ``make test`` to verify that your Python tests pass locally.
It may be helpful to run ``pip install -e .`` to rebuild pydeck locally. If you need to rebuild @deck.gl/json or @deck.gl/jupyter-widget,
you can run ``yarn bootstrap`` or the ``webpack`` commands within their individual directories.

Building the documentation
^^^^^^^^^^^^^^^^^^^^^^^^^^

To build the documentation locally, run the following:

.. code-block:: bash

        cd deck.gl/bindings/pydeck/docs
        make clean && make html

You can find the homepage at ``pydeck/docs/_build/index.html``.
Running ``python3 -m http.server`` from ``pydeck/docs/_build`` will serve the documentation locally.
