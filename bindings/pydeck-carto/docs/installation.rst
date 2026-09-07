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

pydeck 0.10 and later render in Jupyter through `anywidget <https://anywidget.dev>`_, so no
extension installation or enablement step is needed. Install pydeck with its ``jupyter`` extra
alongside pydeck-carto:

.. code-block::

    pip install "pydeck[jupyter]" pydeck-carto

This works in JupyterLab 4, Jupyter Notebook 7, VS Code and Google Colab. See the pydeck
`installation guide <https://pydeck.gl/installation.html>`_ for details.
