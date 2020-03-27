Installing pydeck
=================

There are three steps before using pydeck:

        1. Install the library via pip or conda
        2. Get a Mapbox API token
        3. Enable pydeck for Jupyter Lab or Jupyter Notebook

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

To add basemap tiles, you must get a Mapbox API key, which you can do by 
registering for Mapbox via `this link <https://account.mapbox.com/auth/signup/>`_. 
You should then create a `new public API token <https://account.mapbox.com/access-tokens/>`_.

Mapbox tiles are free for a rather high level of usage. You can learn more about
Mapbox tokens via their `documentation <https://docs.mapbox.com/help/how-mapbox-works/access-tokens/#how-access-tokens-work>`_.

If you set a ``MAPBOX_API_KEY`` environment variable, pydeck will detect it. This way, you do not
need to specify the Mapbox token in your source code.


Enabling pydeck for Jupyter
^^^^^^^^^^^^^^^^^^^^^^^^^^^

Jupyter allows for more complex server/client interactions. You or your system administrator
must enable pydeck for use in Jupyter. Binary data transportation, data selection, and updating data over time
interactively only work if pydeck is enabled for use in a Jupyter environments.

To enable pydeck for Jupyter Notebook:

.. code-block:: bash

        jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
        jupyter nbextension enable --sys-prefix --py pydeck

To enable pydeck for Jupyter Lab:

.. code-block:: bash

        jupyter labextension install @jupyter-widgets/jupyterlab-manager
        jupyter labextension install @deck.gl/jupyter-widget

Currently while you can install pydeck in Google Collab via pip, it is not enabled for server use there.

Installing from source
^^^^^^^^^^^^^^^^^^^^^^

If you want to install the library from its source:

.. code-block:: bash

        git clone https://github.com/uber/deck.gl
        cd deck.gl/bindings/pydeck
        make pre-init
        . env/bin/activate
        make init
        make prepare-jupyter

You can run the local tests to verify that the installation worked via ``make test``.

Development notes
^^^^^^^^^^^^^^^^^

Please note that if you are installing a pydeck prerelease, you may have to specify a specific version
of ``@deck.gl/jupyter-widget`` to install for JupyterLab. You can read this version from pydeck itself.

.. code-block:: bash

        DECKGL_SEMVER=`python -c "import pydeck; print(pydeck.frontend_semver.DECKGL_SEMVER)"`
        jupyter labextension install @deck.gl/jupyter-widget@$DECKGL_SEMVER
