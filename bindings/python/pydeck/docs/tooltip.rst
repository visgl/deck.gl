.. _tooltip-overview:

Configuring the pydeck tooltip
===============================

While you can produce a tooltip in pydeck by simply setting `Deck(tooltip=True)` in the 
:class:`pydeck.Deck` constructor, you may want a more customizable tooltip.

Passing a dictionary with the following keys to :class:`pydeck.Deck` can provide for this.
The :class:`pydeck.Deck` `tooltip` parameter can take a dictionary with the following keys:

- `html`: Set the innerHTML_ of the tooltip.
- `text`: Set the innerText_ of the tooltip.
- `style`: A dictionary of CSS styles that will modify the default style of the tooltip.

Note that you should only provide either `html` or `text`, but not both.

A lightweight template syntax is available to both the `text` and `html` keys,
using the same conventions as Python's `.format` syntax with variable names.

Examples
--------

Setting the tooltip's HTML value and CSS:

.. code-block:: python

   tooltip = {
      "html": "<b>Elevation Value:</b> {elevationValue}",
      "style": {
           "backgroundColor": "red",
           "color": "white"
      }
   }

Just setting the text:

.. code-block:: python

   tooltip = {
       "text": "Elevation Value: {elevationValue}"
   }

.. _innerHTML:
    https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
.. _innerText:
    https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText
