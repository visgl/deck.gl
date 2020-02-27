Binary data transfer
====================

Often for high scale visualizations like those in genomics, massive social networks, or sensor data visualizations,
it helps to be able to plot millions rather than simply hundreds of thousands of points.

By default, pydeck sends data from Jupyter to the frontend by serializing data to JSON. However, for massive data sets,
the costs to serialize/deserialize this JSON can prevent a visualization from rendering.

In order to get around this, pydeck supports binary data transfer, which significantly reduces data size. It is built on-top
of deck.gl's binary data transfer but functions slightly differently.

.. literalinclude:: ../examples/binary_transfer.py
   :language: python
