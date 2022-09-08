import jinja2

HTML_TEMPLATE = jinja2.Template(
    """
<style>
.wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
}
.grid-cell {
  margin: 0;
  min-height: 60px;
  position: relative;

}
.thumb-text {
  z-index: 1;
  margin: 5px;
  font-weight: 100;
  background: charcoal;
}
.grid-cell:hover {
  filter: hue-rotate(3.142rad);
}

</style>

<div class='wrapper'>
{% for gallery_example in gallery_examples %}
  <div class='grid-cell'>
      <a href="./gallery/{{gallery_example}}.html">
    <img width="200" src="./_images/{{gallery_example}}.png"></img>
      <div class='thumb-text'>{{ to_presentation_name(gallery_example) }}</div></a>
  </div>
{% endfor %}
</div>
"""
)


DOC_TEMPLATE = jinja2.Template(
    """
{{ page_title }}
{{ title_underline }} 

.. code-block:: python

{{ python_code|indent(4, True) }}

.. image:: images/manual/{{asset_name}}.png
   :width: 500
   :align: center
"""
)

IMAGES_RST_TEMPLATE = jinja2.Template(
    """

{% for image_basename in assets %}
.. image:: gallery/images/{{ image_basename }}.png
   :width: 0
{% endfor %}

.. toctree::
   :maxdepth: 0

{% for rst_name in assets %}
   gallery/{{rst_name}}
{% endfor %}
"""
)
