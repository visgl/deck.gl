"""
This file handles the creation of a config for RequireJS

pydeck supports two strategies to render deck.gl maps:
- A Juypter Notebook Widget
- A standalone set of HTML templates

RequireJS manages dependencies in Jupyter environments.
To adhere to Jupyter standards and minimize code duplication,
both pydeck rendering strategies use RequireJS.

The RequireJS configuration is viewable in the root of the pydeck repo.

The functions below serve to convert these dependencies into a RequireJS config
for testing, development, and production builds.
"""
import os
import json
import urllib

from jinja2 import Template

def _is_open(url):
    '''Verifies that hot reloading dev server URL is running'''
    if not dev_server_url:
        return
    try:
        code = urllib.request.urlopen(url).getcode()
        if code != 200:
            raise Exception('Is your dev server running? Non-200 status at {url}: {code}'.format(url, code))
    except Exception as e:
        raise Exception('Dev server connection issue', e)


here = os.path.dirname(os.path.abspath(__file__))
dev_server_url = os.getenv('PYDECK_DEV_SERVER')
_is_open(dev_server_url)
WIDGET_PATH = os.path.join(here, '../../../../modules/jupyter-widget/dist')

def get_deckgl_version():
    with open(os.path.join(WIDGET_PATH, '../../..', 'lerna.json')) as f:
        lerna_json = json.loads(f.read())
        version = lerna_json['version']
        return '~' + version

def create_notebook_requirejs(dependencies, base_path, setup_environment='development'):
    '''Embeds environment-appropriate RequireJS configuration into the Jupyter widget's module'''
    # Prepares JS dependencies for the notebook requirejs file
    if setup_environment == 'development' and dev_server_url:
        # Notebook with hot reloading development on http://localhost:8080
        dependencies['paths']['nbextensions/pydeck'] = dev_server_url
        dependencies['paths']['deck.gl'] = dev_server_url + '/deckgl.dev'
    elif setup_environment in ('test', 'production', 'development'):
        # Notebook using the JS bundle built from webpack command in @deck.gl/jupyter-widget
        # The notebook dependency manager will be written to ./pydeck/nbextensions/static/extensionRequires.js
        # If this changes, ./pydeck/nbextensions/__init__.py must also change
        deckgl_version = get_deckgl_version()
        DECK_CDN_URL = 'https://unpkg.com/deck.gl@{}/dist.min'.format(deckgl_version)
        dependencies['paths']['deck.gl'] = DECK_CDN_URL
    else:
        raise Exception('Unrecognized setup environment')

    # Creates the notebook widget dependency manager
    # This file is excluded from version control
    notebook_output_js = os.path.join(
        base_path, 'pydeck', 'nbextension', 'static', 'extensionRequires.js'
    )
    with open(notebook_output_js, 'w+') as f:
        f.write(embed_in_widget_template(dependencies))


def create_standalone_render_requirejs(dependencies, base_path, setup_environment='development'):
    '''Embeds environment-appropriate RequireJS configuration into the standalone HTML renderer's module'''
    # Creates the standalone HTML renderer dependency file base_path
    if setup_environment == 'development' and dev_server_url:
        # Supports standalone HTML renderer with hot reloading
        dependencies['paths']['nbextensions/pydeck'] = dev_server_url
        dependencies['paths']['deck.gl'] = dev_server_url + '/deckgl.dev'
    # TODO verify this path
    elif setup_environment in ('production', 'development'):
        # Standalone HTML renderer in production requires reading from CDN
        deckgl_version = get_deckgl_version()
        CDN_URL = 'https://unpkg.com/@deck.gl/jupyter-widget@{}/dist'.format(deckgl_version)
        dependencies['paths']['nbextensions/pydeck'] = CDN_URL
        DECK_CDN_URL = 'https://unpkg.com/deck.gl@{}/dist.min'.format(deckgl_version)
        dependencies['paths']['deck.gl'] = DECK_CDN_URL
    else:
        raise Exception('Unrecognized setup environment')
    # Writes a file set near the standalone rendering code
    # This file is excluded from version control
    standalone_html_output_js = os.path.join(
        base_path, 'pydeck', 'io', 'templates', 'requirejs_dependencies.json'
    )
    with open(standalone_html_output_js, 'w+') as f:
        f.write(json.dumps(dependencies, indent=2))

def embed_in_widget_template(dependencies):
    with open(os.path.join(here, 'notebook_requirejs_config.j2')) as f:
        template = Template(f.read())
    rendered = template.render(dependencies=json.dumps(dependencies, indent=4))
    return rendered
