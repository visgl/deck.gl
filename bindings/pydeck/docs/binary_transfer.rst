Binary data transfer
====================

Motivation
^^^^^^^^^^

Often for high scale visualizations like those in genomics, massive social networks, or sensor data visualizations,
it helps to be able to plot millions rather than simply hundreds of thousands of points.

By default, pydeck sends data from Jupyter to the frontend by serializing data to JSON. However, for massive data sets,
the costs to serialize/deserialize this JSON can prevent a visualization from rendering.

In order to get around this, pydeck supports binary data transfer, which significantly reduces data size. It is built on-top
of deck.gl's binary data transfer.

Binary transfer relies on `NumPy <https://numpy.org/>`_ and its `typed arrays <https://numpy.org/devdocs/user/basics.types.html>`_,
which are converted to `JavaScript typed arrays <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays>` and passed to
deck.gl `using precalculated binary attributes <https://deck.gl/#/documentation/developer-guide/performance-optimization?section=supply-attributes-directly>`.

Usage
^^^^^

Data must be properly formatted for binary transfer:

- ``use_binary_transport`` must be set to ``True`` explictly on a ``Layer``
- Layer input data must be a ``pandas.DataFrame`` object
- Accessor names must be strings representing column names within the data frame,
  e.g., ``get_position='position'`` is correct, **not** ``get_position=['x', 'y']``
- Data that is not intend to be rendered should not be passed

Binary transfer only works within Jupyter environments via the ``.show`` function.

TODO finish example

.. literalinclude:: ../examples/graph_example.py
   :language: python
