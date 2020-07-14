"""Generates HTML grid for gallery examples"""
import os
import glob
import jinja2

from utils import to_presentation_name, to_snake_case_layer_name


here = os.path.dirname(os.path.abspath(__file__))
EXAMPLE_GLOB = "../examples/*.py"
layer_names = sorted([to_snake_case_layer_name(layer_name) for layer_name in glob.glob(EXAMPLE_GLOB)])


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
  margin-left: 2px;
  bottom: 0;
  left: 0;
  position: absolute;
  font-weight: 100;
  color: white;
  background: charcoal;
}
.grid-cell:hover {
  filter: hue-rotate(3.142rad);
}

</style>

<div class='wrapper'>
{% for layer_name in layer_names %}
  {# Sphinx decides where these files get hosted but it's /_images #}
  <div class='grid-cell'>
      <a href="./gallery/{{layer_name}}.html">
    <img width="200" src="./_images/{{layer_name}}.png"></img>
      <div class='thumb-text'>{{ to_presentation_name(layer_name) }}</div></a>
  </div>
{% endfor %}
</div>
"""
)


def main():
    doc_source = HTML_TEMPLATE.render(layer_names=layer_names, to_presentation_name=to_presentation_name)
    with open(os.path.join(here, "../gallery/html/grid.html"), "w+") as f:
        f.write(doc_source)


if __name__ == "__main__":
    main()
