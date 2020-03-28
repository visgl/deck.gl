Binary data transfer
====================

Motivation
^^^^^^^^^^

Often for visualizations in genomics, massive social networks, or sensor data visualizations,
it helps to be able to plot millions rather than simply hundreds of thousands of points.

By default, pydeck sends data from Jupyter to the frontend by serializing data to JSON. However, for massive data sets,
the costs to serialize and deserialize this JSON can prevent a visualization from rendering.

In order to get around this, pydeck supports binary data transfer, which significantly reduces data size. Binary transfer relies
on `NumPy <https://numpy.org/>`_ and its `typed arrays <https://numpy.org/devdocs/user/basics.types.html>`_,
which are converted to `JavaScript typed arrays <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays>`_ and passed to
deck.gl `using precalculated binary attributes <https://deck.gl/#/documentation/developer-guide/performance-optimization?section=supply-attributes-directly>`_.

Usage
^^^^^

Binary transport will only work if the following requirements are met:

- ``use_binary_transport`` must be set to ``True`` explictly on your ``Layer``
- Layer input data must be a ``pandas.DataFrame`` object.
- Data that is not intend to be rendered should not be passed into the layer.
- Accessor names must be strings representing column names within the data frame,
  e.g., ``get_position='position'`` is correct, **not** ``get_position=['x', 'y']``.
  For example,
 
  This data format, where ``x`` & ``y`` represent a position and ``r``, ``g``, and ``b`` represent color values,

    +---+---+-----+-----+---+
    | x | y |  r  |  g  | b |
    +===+===+=====+=====+===+
    | 0 | 1 |  0  |  0  | 0 |
    +---+---+-----+-----+---+
    | 0 | 5 | 255 |  0  | 0 |
    +---+---+-----+-----+---+
    | 5 | 1 | 255 | 255 | 0 |
    +---+---+-----+-----+---+

  should be converted to this format

    +------------+---------------+
    | position   | color         |
    +============+===============+
    | [0, 1]     | [0, 0, 0]     |
    +------------+---------------+
    | [0, 5]     | [255, 0, 0]   |
    +------------+---------------+
    | [5, 1]     | [255, 255, 0] |
    +----------------------------+

- Binary transfer only works within Jupyter environments via the ``.show`` function. It relies on the socket-level
  communication built into the Jupyter environment.

Example
^^^^^^^

.. literalinclude:: ../examples/graph_example.py
   :language: python
