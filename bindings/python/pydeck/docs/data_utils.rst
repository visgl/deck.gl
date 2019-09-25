.. _pydeckdata_utils:

pydeck.data_utils
=================

.. _pydeckdata_utilscompute_viewport:

pydeck.data_utils.compute_viewport
----------------------------------

.. code:: python

   def compute_view(
       points,
       view_proportion=1,
       view_type=pydeck.ViewState)

Computes a view state (zoom level and bounding box) for the points
passed in.

Parameters
^^^^^^^^^^

-  ``points`` : ``list`` of ``list`` of ``float`` or
   ``pandas.DataFrame``

A list of geospatial points to fit to

-  ``view_proportion`` : ``float``, default ``1``

Proportion of the data that will be viewable on the screen. Useful for
filtering outlying points from a visualization.

For example, suppose you have 100 points, most of which are centered
around London and ten of which are distributed a few 100 kilometers away
from it. If you set ``view_proportion=0.9``, pydeck will attempt to fit
to the middle 90% of the data, aiming to exclude the points furthest
from the core of the visualization.

-  ``view_type`` : ``function``, default ``pydeck.ViewState``

Class constructor for a pydeck map view

Returns
^^^^^^^

``pydeck.ViewState`` : Map view fitted to the data

.. _pydeckdata_utilsassign_random_colors:

pydeck.data_utils.assign_random_colors
--------------------------------------

Produces a lookup table keyed by each class of data, with value as an
RGB array

This helps enable multi-class visualization in pydeck

.. code:: python

   def assign_random_colors(data_vector)

.. _parameters-1:

Parameters
^^^^^^^^^^

``data_vector`` : ``list`` Vector of data classes to be categorized,
passed from the data itself

.. _returns-1:

Returns
^^^^^^^

::

   `collections.OrderedDict` : Dictionary of random RGBA value per class, keyed on class

Examples
^^^^^^^^

See the PointCloudLayer notebook example, which uses many classes.

As an illustration below, with a smaller data set of only two classes
and three rows:

.. code:: python

   import pandas
   data = pandas.DataFrame([
       {
           'site': 'Big Ben',
           'attraction_type': 'Clock Tower',
           'lat': 51.5006958,
           'lng': -0.1266639
       },
       {
           'site': 'Kensington Palace',
           'attraction_type': 'Palace':
           'lat': 51.5046188,
           'lng': -0.1839472
       },
       {
           'attraction_type': 'Palace',
           'site': 'Buckingham Palace',
           'lat': 51.501364,
           'lng': -0.14189
       }
   ])
   color_lookup = assign_random_colors(data['attraction_type'])
   # Assign a color based on attraction_type
   data['color'] = data.apply(lambda row: color_lookup.get(row['attraction_type']), axis=1)

   # Data now has a color by attraction type:
   #
   # [
   #   {
   #         'site': 'Big Ben',
   #         'attraction_type': 'Clock Tower',
   #         'lat': 51.5006958,
   #         'lng': -0.1266639,
   #         'color': [0, 10, 35]
   #     },
   #     {
   #         'site': 'Kensington Palace',
   #         'attraction_type': 'Palace':
   #         'lat': 51.5046188,
   #         'lng': -0.1839472,
   #         'color': [53, 243, 130]
   #     },
   #   {
   #         'attraction_type': 'Palace',
   #         'site': 'Buckingham Palace',
   #         'lat': 51.501364,
   #         'lng': -0.14189,
   #         'color': [53, 243, 130]
   #     }
   # ]
