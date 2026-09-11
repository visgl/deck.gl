Installing pydeck
=================

There are two steps before using pydeck:

        1. Install the library via pip or conda
        2. Include an API key from Google Maps or Mapbox (Optional)

pydeck requires Python 3.10 or above.

Via pip
^^^^^^^

Note: It is best practice to run this command in a `virtual environment <https://docs.python.org/3/library/venv.html#creating-virtual-environments>`_.

.. code-block:: bash

        pip install pydeck

Via conda
^^^^^^^^^

.. code-block:: bash

        conda install -c conda-forge pydeck

That's it for static visualizations: ``.to_html()`` renders using the deck.gl JavaScript library loaded from
a CDN. For a live Jupyter widget, install the ``jupyter`` extra described below.


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

Install the Jupyter extra to get the live widget: data updates with ``.update()``, event handlers, data
selection and binary transport.

.. code-block:: bash

        pip install "pydeck[jupyter]"

The widget is built on `anywidget <https://anywidget.dev>`__, so it works in JupyterLab 4, Jupyter Notebook 7,
VS Code and Google Colab without any ``nbextension`` or ``labextension`` step. If you enabled the extension
shipped with pydeck 0.8, remove it with ``jupyter nbextension uninstall --py pydeck``. See :doc:`jupyter` for
the features this enables.

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

