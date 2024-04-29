Installation
============

Pydeck-carto is available from pip and conda.

It is recommended to always use a `virtual environment <https://docs.python.org/3/library/venv.html#creating-virtual-environments>`_. to prevent collisions with other libraries installed on the system

Pydeck-carto is a wrapper of `Pydeck <https://pydeck.gl/index.html>`_ to use `CARTO <https://carto.com>`_, so it is a requirement that will be installed automatically.

Via pip
^^^^^^^

.. code-block::

    pip install pydeck-carto

Via conda
^^^^^^^^^
.. code-block::

    conda install -c conda-forge pydeck-carto

Using it on Jupyter notebook
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. WARNING::
   Jupyter-specific features are not currently supported in pydeck v0.9+.

In order to use the library in Jupyter notebook (or jupyter lab) requires that pydeck would be properly enabled

Please follow the latest instructions to enable pydeck for Jupyter `here <https://pydeck.gl/installation.html#enabling-pydeck-for-jupyter>`_

.. code-block::

    jupyter nbextension install --sys-prefix --symlink --overwrite --py pydeck
    jupyter nbextension enable --sys-prefix --py pydeck

To enable pydeck for JupyterLab (on Mac/Unix-like systems):

.. code-block:: bash

    jupyter labextension install @jupyter-widgets/jupyterlab-manager
    DECKGL_SEMVER=`python -c "import pydeck; print(pydeck.frontend_semver.DECKGL_SEMVER)"`
    jupyter labextension install @deck.gl/jupyter-widget@$DECKGL_SEMVER
