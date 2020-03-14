"""Script to convert pydeck examples into .rst pages with code"""
import os
import glob
import jinja2

import subprocess


DOC_TEMPLATE = jinja2.Template(
    """
{{ layer_name.replace('_', '').title() }}
================================

.. raw:: html

    <iframe width="600" height="500" src="{{hosted_html_path}}"></iframe>


Source
------

.. code-block:: python

{{ python_code|indent(4, True) }}

"""
)


EXAMPLE_GLOB = "../examples/*_layer.py"
GALLERY_DIR = "./gallery/"
HTML_DIR = "./_build/html/_static/gallery/"
STATIC_PATH = "/_static/gallery"


def main():
    if not glob.glob(EXAMPLE_GLOB):
        raise Exception("No files found to convert")
    subprocess.call("mkdir -p %s" % HTML_DIR, shell=True)
    for fname in sorted(glob.glob(EXAMPLE_GLOB)):
        layer_name = os.path.basename(fname).replace(".py", "")
        # Create new .html examples
        html_fname = os.path.basename(fname).replace(".py", ".html")
        subprocess.call(
            "source activate ../env; python {fname}; mv {html_src} {html_dest}".format(
                fname=fname, html_src=html_fname, html_dest=HTML_DIR,
            ),
            shell=True,
        )
        python_code = open(fname, "r").read()
        doc_source = DOC_TEMPLATE.render(
            layer_name=layer_name,
            python_code=python_code,
            hosted_html_path=os.path.join(STATIC_PATH, html_fname),
        )
        rst_path = os.path.join(GALLERY_DIR, layer_name + ".rst")
        f = open(rst_path, "w+")
        print("* Converted %s to %s" % (fname, rst_path))
        f.write(doc_source)
        f.close()


if __name__ == "__main__":
    main()
