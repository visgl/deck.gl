Authentication
==============

Pydeck-carto supports two types of authentications using the `carto-auth <https://github.com/cartodb/carto-auth>`_ package.

* Authentication using OAuth
* Authentication using a credentials file

OAuth
^^^^^

Use your CARTO account to authenticate with Python from a Jupyter Notebook (in local or remote), or from a Python script. This is available for any CARTO user.

.. code-block:: python

    from carto_auth import CartoAuth

    carto_auth = CartoAuth.from_oauth()

.. figure:: images/carto-auth-login.png

File
^^^^

Use a file with M2M credentials to automatically login into a CARTO account. It can be uses for ETL processes .This is available for Enterprise CARTO users.

.. code-block:: python

    from carto_auth import CartoAuth

    carto_auth = CartoAuth.from_file("./carto-credentials.json")


The `carto_auth` object will be used to obtain the CartoLayer credentials.
