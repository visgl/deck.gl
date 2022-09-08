CartoLayer
==========

The CartoLayer is the wrapper between Pydeck and Pydeck-carto

It is mainly a deck.Layer but with some modifications such:

* The carto layer type must be: 'CartoLayer'
* The carto layer must be registered calling: :meth:`register_carto_layer`
* Requires the parameters ``data``, ``type_``, ``connection`` and ``credentials``
* The rest of the parameters are the one for a `pydeck.Layer <https://pydeck.gl/layer.html>`__


.. code-block:: python

    import pydeck as pdk
    from pydeck_carto import register_carto_layer, CartoAuth, is_valid_carto_layer
    from pydeck_carto.layer import MapType, CartoConnection

    register_carto_layer()

    carto_auth = CartoAuth.from_file('./carto_credentials.json')

    layer = pdk.Layer(
        "CartoLayer",
        data="SELECT geom, name FROM carto-demo-data.demo_tables.airports",
        type_=MapType.QUERY,
        connection=CartoConnection.CARTO_DW,
        credentials=carto_auth.get_layer_credentials(),
        get_fill_color=[238, 77, 90],
        point_radius_min_pixels=2.5,
        pickable=True,
    )


Parameters specification
^^^^^^^^^^^^^^^^^^^^^^^^

``data``: String that represents a path pointing to a table or a query for content available on the CARTO app account

``type_``: ``MapType`` that defines the type of the data. It can be either QUERY, TABLE or TILESET

.. autoclass:: pydeck_carto.layer.MapType
.. autoclass:: pydeck_carto.layer.MapType.QUERY
.. autoclass:: pydeck_carto.layer.MapType.TABLE
.. autoclass:: pydeck_carto.layer.MapType.TILESET


``connection``: defines the connection to gather the information from CARTO. It must be a ``pydeck.types.String`` and can be used the ``CartoConnection.CARTO_DW`` to access the CARTO Data Warehouse

.. autoclass:: pydeck_carto.layer.CartoConnection
.. autoclass:: pydeck_carto.layer.CartoConnection.CARTO_DW

``credentials``: defines the app credentials to gather the information from CARTO. It must be a dictionary with a valid token and some extra parameters. It is recommended to use ``CartoAuth.get_layer_credentials()``

.. code-block:: python

    from pydeck_carto import CartoAuth

    carto_auth = CartoAuth.from_file('./carto_credentials.json')
    print(carto_auth.get_layer_credentials())

CartoLayer validation
^^^^^^^^^^^^^^^^^^^^^^^^^^

In order to know if the layer is correct CartoAuth provides the method :meth:`is_valid_carto_layer(layer, carto_auth)` which check and raise an error in case there is some misconfiguration detected

.. code-block:: python

    import pydeck as pdk
    from pydeck_carto import register_carto_layer, CartoAuth, is_valid_carto_layer
    from pydeck_carto.layer import CartoConnection, MapType, GeoColumnType

    register_carto_layer()
    carto_auth = CartoAuth.from_file("./carto_credentials.json")

    layer = pdk.Layer(
        "CartoLayer",
        data="carto-demo-data.demo_tables"
        ".derived_spatialfeatures_esp_quadbin15_v1_yearly_v2",
        type_=MapType.TABLE,
        connection=CartoConnection.CARTO_DW,
        credentials=carto_auth.get_layer_credentials(),
        geo_column=GeoColumnType.QUADBIN,
        get_fill_color=[200, 0, 80],
        pickable=True,
    )

    assert is_valid_carto_layer(layer, carto_auth)
