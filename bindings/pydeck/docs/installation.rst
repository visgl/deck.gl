Installing pydeck
=================

There are two steps before using pydeck:

        1. Install the library via pip or conda
        2. Include an API key from Google Maps or Mapbox (Optional)

pydeck requires Python 3.8 or above.

Via pip
^^^^^^^

Note: It is best practice to run this command in a `virtual environment <https://docs.python.org/3/library/venv.html#creating-virtual-environments>`_.

.. code-block:: bash

        pip install pydeck

Via conda
^^^^^^^^^

.. code-block:: bash

        conda install -c conda-forge pydeck

That's it — pydeck renders visualizations using the deck.gl JavaScript library loaded from a
CDN, so no additional Jupyter extension setup is needed for ``.show()`` and ``.to_html()``.


Getting a Mapbox API key
^^^^^^^^^^^^^^^^^^^^^^^^

By default, pydeck v0.6 onwards provides basemap tiles through Carto.

You can optionally use a Mapbox API key, by
registering for Mapbox via `this link <https://account.mapbox.com/auth/signup/>`_.
You should then create a `new public API token <https://account.mapbox.com/access-tokens/>`_.
You can learn more about Mapbox tokens via their `documentation <https://docs.mapbox.com/help/how-mapbox-works/access-tokens/#how-access-tokens-work>`_.

You can also use a Google Maps API key in a similar way. Currently Google Maps is not supported for 3D visualizations.

pydeck checks for API keys via environment variables automatically. Both the deck.gl JavaScript convention
and the pydeck convention are supported (the deck.gl convention is checked first):

- **Mapbox**: ``MapboxAccessToken`` (deck.gl) or ``MAPBOX_API_KEY`` (pydeck)
- **Google Maps**: ``GoogleMapsAPIKey`` (deck.gl) or ``GOOGLE_MAPS_API_KEY`` (pydeck)
- **Carto**: ``CARTO_API_KEY``

For example, to set your Mapbox key:

.. code-block:: bash

        export MapboxAccessToken=pk.your_token_here

If you're already working with deck.gl JavaScript projects, you likely have ``MapboxAccessToken`` set
and pydeck will pick it up automatically.

Enabling pydeck for Jupyter
^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. NOTE::
   The Jupyter widget integration (binary transport, data selection, event handlers, and
   live ``.update()``) is not currently functional in pydeck v0.9+. See :doc:`jupyter` for
   details. The extension setup instructions below are retained for when widget support is
   restored.

.. commenting out rather than removing — restore when widget support is re-enabled

..
   To enable pydeck for Jupyter Notebook:

   .. code-block:: bash

           jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
           jupyter nbextension enable --sys-prefix --py pydeck

   To enable pydeck for JupyterLab (on Mac/Unix-like systems):

   .. code-block:: bash

           jupyter labextension install @jupyter-widgets/jupyterlab-manager
           DECKGL_SEMVER=`python -c "import pydeck; print(pydeck.frontend_semver.DECKGL_SEMVER)"`
           jupyter labextension install @deck.gl/jupyter-widget@$DECKGL_SEMVER


pydeck also works in Google Colab. While you can install pydeck in Google Colab via pip, it is not yet enabled for server use.

Installing from source
^^^^^^^^^^^^^^^^^^^^^^

If you want to install the library from its source:

.. code-block:: bash

        git clone https://github.com/visgl/deck.gl
        cd deck.gl/bindings/pydeck
        make setup-env
        source .venv/bin/activate
        make init

Development
^^^^^^^^^^^

If you want to install pydeck for development, see :doc:`contributing`.

You can run the local tests to verify that the installation worked via ``make test``.

..
   Note on pre-releases
   ^^^^^^^^^^^^^^^^^^^^

   If you are installing a pydeck prerelease and using JupyterLab, you must install an exact version
   of ``@deck.gl/jupyter-widget``. You can read this version from pydeck itself:

   .. code-block:: bash

           DECKGL_SEMVER=`python -c "import pydeck; print(pydeck.frontend_semver.DECKGL_SEMVER)"`
           jupyter labextension install @deck.gl/jupyter-widget@$DECKGL_SEMVER
