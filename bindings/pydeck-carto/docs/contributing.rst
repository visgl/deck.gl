Contributing
============

We encourage users to report bugs, fix them, and add features as desired.
If you run into issues while using this guide, let us know.

For governance policy and code of conduct, please see the `deck.gl contribution guidelines <https://deck.gl/docs/contributing>`__.

Development installation
^^^^^^^^^^^^^^^^^^^^^^^^

Please develop using Python 3.8 or above.

.. code-block:: bash

    git clone https://github.com/visgl/deck.gl
    cd deck.gl/bindings/pydeck-carto
    make init

At this point, verify that this new local copy works by running ``make test``.

Submitting a pull request
^^^^^^^^^^^^^^^^^^^^^^^^^

Deck.gl will run a suite of local tests both on commit and on push. On push, deck.gl will run browser tests, which will take a bit
longer than the commit hook tests. Ideally, these tests will pass locally before you push your branch to GitHub. Once pushed,
tests will also run on Travis CI. Generally the deck.gl team will review your PR within 2-3 days.

Before submitting a PR, you should run ``make lint`` and ``make test`` to verify that your Python tests pass locally.
It may be helpful to run ``pip install -e .`` to rebuild pydeck-carto locally.

Building the documentation
^^^^^^^^^^^^^^^^^^^^^^^^^^

To build the documentation locally, run the following:

.. code-block:: bash

    cd deck.gl/bindings/pydeck-carto/docs
    make clean && make html

You can find the homepage at ``pydeck/docs/_build/html/index.html``.

Running ``python3 -m http.server`` from ``pydeck/docs/_build/html`` will serve the documentation locally.
