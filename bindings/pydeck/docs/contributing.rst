Contributing to pydeck
======================

We encourage users to report bugs, fix them, and add features as desired.
We support our contributors in the #pydeck channel in the `deck.gl Slack workspace <https://join.slack.com/t/deckgl/shared_invite/zt-7oeoqie8-NQqzSp5SLTFMDeNSPxi7eg>`_,
and you are encouraged to ask questions there or file issues on the deck.gl GitHub.

For governance policy and code of conduct, please see the `deck.gl contribution guidelines <https://deck.gl/docs/contributing>`_.

Where to contribute
^^^^^^^^^^^^^^^^^^^

At its core, pydeck is three modules:

- @deck.gl/jupyter-widget, a Javascript library that helps bind deck.gl to a Jupyter environment
- @deck.gl/json, a Javascript library that converts JSON configurations to deck.gl visualizations
- pydeck, a Python wrapper around deck.gl

To contribute to either of the first two, you can follow the deck.gl contribution guidelines.

Development installation of pydeck
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Development assumes you are using Python 3.5 or above. You will also need `yarn <https://yarnpkg.com/en/docs/install>`_
for building deck.gl.

The following commands set up a virtual environment, install most development and testing dependencies, and then activate
enable pydeck to run on JupyterLab and Jupyter Notebook locally:

.. code-block:: bash

        git clone https://github.com/visgl/deck.gl
        cd deck.gl/bindings/pydeck
        make setup-env
        . env/bin/activate
        make init
        make prepare-jupyter


Submitting a PR
^^^^^^^^^^^^^^^

You can run `make test` to verify that your Python tests pass locally. You can also run `pip install -e .` to rebuild the project.
You are encouraged to add an example of your work in the ``pydeck/examples/`` directory along with your PR.

Building the documentation
^^^^^^^^^^^^^^^^^^^^^^^^^^

To build the documentation locally, run the following (assuming you've cloned deck.gl):

.. code-block:: bash

        cd deck.gl/bindings/pydeck/docs
        make docs

This will build the documentation locally. You can find the homepage at `pydeck/docs/_build/index.html`.
Depending on your change, you may need to serve the documentation to view it.
Running `python3 -m http.server` from `pydeck/docs/_build` will serve the documentation locally.


Local development with JupyterLab
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You may have to install a specific version of @deck.gl/jupyter-widget

.. code-block:: bash

        DECKGL_SEMVER=`python -c "import pydeck; print(pydeck.frontend_semver.DECKGL_SEMVER)"`
        jupyter labextension install @deck.gl/jupyter-widget@$DECKGL_SEMVER
