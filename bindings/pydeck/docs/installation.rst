Installing pydeck
=================

There are three steps before using pydeck:

        1. Install the library via pip or conda
        2. Enable pydeck for JupyterLab or Jupyter Notebook
        3. Include an API key from Google Maps or Mapbox (Optional)

Via pip
^^^^^^^

Note: It is best practice to run this command in a `virtual environment <https://docs.python.org/3/library/venv.html#creating-virtual-environments>`_.

.. code-block:: bash

        pip install pydeck

Via conda
^^^^^^^^^

.. code-block:: bash

        conda install -c conda-forge pydeck


Getting a Mapbox API key
^^^^^^^^^^^^^^^^^^^^^^^^

By default, pydeck v0.6 onwards provides basemap tiles through Carto.

You can optionally use a Mapbox API key, by
registering for Mapbox via `this link <https://account.mapbox.com/auth/signup/>`_.
You should then create a `new public API token <https://account.mapbox.com/access-tokens/>`_.
You can learn more about Mapbox tokens via their `documentation <https://docs.mapbox.com/help/how-mapbox-works/access-tokens/#how-access-tokens-work>`_.

You can also use a Google Maps API key in a similar way. Currently Google Maps is not supported for 3D visualizations.

If you set a ``MAPBOX_API_KEY`` or ``GOOGLE_MAPS_API_KEY`` environment variables, pydeck will detect them.

Installing from source
^^^^^^^^^^^^^^^^^^^^^^

If you want to install the library from its source:

.. code-block:: bash

        git clone https://github.com/visgl/deck.gl
        cd deck.gl/bindings/pydeck
        yarn bootstrap
        pip install .

Development
^^^^^^^^^^^

If you want to install pydeck for development, you may want to use the ``make`` commands:

.. code-block:: bash

        git clone https://github.com/visgl/deck.gl
        cd deck.gl/bindings/pydeck
        make setup-env
        . env/bin/activate
        make init
        make prepare-jupyter

You can run the local tests to verify that the installation worked via ``make test``.

Note on pre-releases
^^^^^^^^^^^^^^^^^^^^

If you are installing a pydeck prerelease and using JupyterLab, you must install an exact version
of ``@deck.gl/jupyter-widget``. You can read this version from pydeck itself:

.. code-block:: bash

        DECKGL_SEMVER=`python -c "import pydeck; print(pydeck.frontend_semver.DECKGL_SEMVER)"`
        jupyter labextension install @deck.gl/jupyter-widget@$DECKGL_SEMVER
