Authentication
==============

Pydeck-carto supports 2 types of authentications:

* Authentication using credentials
* Authentication using oauth2

The object that handles the authentication is `CartoAuth <carto_auth.html>`_ which also provides an API to communicate with CARTO data warehouse and as proxy to allow the users to interact with CARTO

Credentials authentication
^^^^^^^^^^^^^^^^^^^^^^^^^^

The authentication requires to have an application `credentials <carto_account.html>`_

The credentials essentially are the ``client_id``, ``client_secret`` and the ``api_base_url``

Using these parameters can be initialized the ``CartoAuth`` object like:

.. code-block:: python

    from pydeck_carto import CartoAuth

    carto_auth = CartoAuth(client_id="<app-client-id>", client_secret="<app-client-secret>",
                           api_base_url="<app-api-base-url>")


Another way to initialize a ``CartoAuth`` object using credentials is providing a JSON file with the `credentials <carto_account.html>`_ like:

.. code-block:: python

    from pydeck_carto import CartoAuth

    carto_auth = CartoAuth.from_file('path-to-credentials-file.json')


Oauth2 authentication
^^^^^^^^^^^^^^^^^^^^^

CartoAuth can be authenticated as well using the oauth2 PKCE flow

The flow consists on calling the proper method :meth:`CartoAuth.from_auth`

.. code-block:: python

    from pydeck_carto import CartoAuth

    carto_auth = CartoAuth.from_auth(open_browser=True)



By default this method will try to open a new window on a browser to ask the user to authenticate with CARTO

If can't be done or ``open_browser=False`` it will follow a similar flow but using the command line in which the user will be required to open the URL to perform the oauth authentication and then paste back on the console the redirect full URL or the ``code`` created

Once the flow is complete, the `CartoAuth <carto_auth.html>`_ object will store the required authentication mechanisms to pull the data from CARTO and to interact with CARTO
