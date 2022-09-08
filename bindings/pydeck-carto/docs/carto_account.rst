CARTO account
=============

A user can create a CARTO account for free on the `signup link <https://app.carto.com/signup/>`_

The users can be created using a username and password or using oauth with some of the available social networks

When the user login on the CARTO platform, will enter into the CARTO platform

.. image:: gallery/images/credentials/CARTO\ workspace.png
   :width: 500

Get CARTO credentials
^^^^^^^^^^^^^^^^^^^^^

In order to get the CARTO credentials the user must create an application

The application will have a ``client_id``, a ``client_secret`` and the ``api_base_url`` (the region where the application is located)

A credentials' file is a JSON format file that looks like this:

.. code-block:: json

        {
            "api_base_url": "https://gcp-europe-west1.api.carto.com",
            "client_id": "<client_id>",
            "client_secret": "<client_secret>"
        }

Note: the credentials' file can be named it as you please but on the examples is called `carto_credentials.json`

How to create an application
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

From the `CARTO workspace <https://app.carto.com/home>`_ the user can navegate to the Developers section using the left menu

.. image:: gallery/images/credentials/Developers\ section.png
   :width: 500


Once on the Developers' section click on the button to Create new, fill the application form and the application would be created

.. image:: gallery/images/credentials/Create\ new\ app.png
   :width: 500

Once the application is created the ``client_id`` and the client_secret can be copied to the clipboard by clicking on the text

.. image:: gallery/images/credentials/Copy\ credentials.png
   :width: 500

Use the credentials to create a credentials file or as a parameters on a `CartoAuth object <carto_auth.html>`_





