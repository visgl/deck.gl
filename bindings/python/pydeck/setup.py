# -*- coding: utf-8 -*-

from __future__ import print_function
from setuptools import setup, find_packages, Command
from setuptools.command.sdist import sdist
from setuptools.command.build_py import build_py
from setuptools.command.egg_info import egg_info
from subprocess import check_call
from glob import glob
import os
import sys
import platform  # noqa

here = os.path.dirname(os.path.abspath(__file__))

# TODO add widget
PATH_TO_WIDGET = '../../../modules/jupyter-widget'

node_root = os.path.join(here, PATH_TO_WIDGET)

npm_path = os.pathsep.join([
    os.path.join(node_root, 'node_modules', '.bin'), os.environ.get('PATH', os.defpath),
])

from distutils import log  # noqa

log.set_verbosity(log.DEBUG)
log.info('setup.py entered')
log.info('$PATH=%s' % os.environ['PATH'])

LONG_DESCRIPTION = 'Jupyter widget for rendering deck.gl in a Jupyter notebook'

def js_prerelease(command, strict=False):
    """decorator for building minified js/css prior to another command"""
    class DecoratedCommand(command):
        def run(self):
            jsdeps = self.distribution.get_command_obj('jsdeps')
            if all(os.path.exists(t) for t in jsdeps.targets):
                # sdist, nothing to do
                command.run(self)
                return

            try:
                self.distribution.run_command('jsdeps')
            except Exception as e:
                missing = [t for t in jsdeps.targets if not os.path.exists(t)]
                if strict or missing:
                    log.warn('rebuilding js and css failed')
                    if missing:
                        log.error('missing files: %s' % missing)
                    raise e
                else:
                    log.warn('rebuilding js and css failed (not a problem)')
                    log.warn(str(e))
            command.run(self)
            update_package_data(self.distribution)
    return DecoratedCommand

def update_package_data(distribution):
    """update package_data to catch changes during setup"""
    build_py = distribution.get_command_obj('build_py')
    # distribution.package_data = find_package_data()
    # re-init build_py options which load package_data
    build_py.finalize_options()


class NPM(Command):
    description = 'install package.json dependencies using npm'

    user_options = []

    node_modules = os.path.join(node_root, 'node_modules')

    targets = [
        os.path.join(here, 'pydeck', 'static', 'extension.js'),
        os.path.join(here, 'pydeck', 'static', 'index.js')
    ]

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def has_npm(self):
        try:
            check_call(['npm', '--version'])
            return True
        except Exception:
            return False

    def should_run_npm_install(self):
        package_json = os.path.join(node_root, 'package.json')  # noqa
        node_modules_exists = os.path.exists(self.node_modules)  # noqa
        return self.has_npm()

    def run(self):
        has_npm = self.has_npm()
        if not has_npm:
            log.error(
                "`npm` unavailable.  If you're running this command using sudo, make sure `npm` is available to sudo")

        env = os.environ.copy()
        env['PATH'] = npm_path

        if self.should_run_npm_install():
            log.info("Installing build dependencies with npm. This may take a while...")
            check_call(['npm', 'install'], cwd=node_root, stdout=sys.stdout, stderr=sys.stderr)
            os.utime(self.node_modules, None)

        for t in self.targets:
            if not os.path.exists(t):
                msg = 'Missing file: %s' % t
                if not has_npm:
                    msg += '\nnpm is required to build a development version of widgetsnbextension'
                raise ValueError(msg)

        # update package data in case this created new files
        update_package_data(self.distribution)


version_ns = {}
with open(os.path.join(here, 'pydeck', '_version.py')) as f:
    exec(f.read(), {}, version_ns)

setup_args = {
    'name': 'pydeck',
    'version': version_ns['__version__'],
    'description': 'Jupyter widget for deck.gl maps',
    'long_description': LONG_DESCRIPTION,
    'license': 'MIT License',
    'include_package_data': True,
    'data_files': [
        ('share/jupyter/nbextensions/pydeck', [
            'pydeck/static/extension.js',
            'pydeck/static/index.js',
            'pydeck/static/index.js.map'
        ] + glob('pydeck/static/*.png') + glob('pydeck/static/*.svg')),
        ('etc/jupyter/nbconfig/notebook.d', ['pydeck.json'])
    ],
    'install_requires': [
        'ipywidgets>=7.0.0,<8',
        'traitlets>=4.3.2'
    ],
    'packages': find_packages(),
    'zip_safe': False,
    # 'cmdclass': {
    #     'build_py': js_prerelease(build_py),
    #     'egg_info': js_prerelease(egg_info),
    #     'sdist': js_prerelease(sdist, strict=True),
    #     # 'jsdeps': NPM,
    # },
    'author': 'Andrew Duberstein',
    'author_email': 'ajduberstein@gmail.com',
    'url': 'https://github.com/uber/deck.gl',
    'keywords': ['ipython', 'jupyter', 'widgets', 'graphics', 'GIS'],
    'classifiers': [
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'Topic :: Multimedia :: Graphics',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Framework :: Jupyter',
    ],
    'include_package_data': True,
    'tests_require': ['pytest'],
    'setup_requires': ['pytest-runner'],
    'extras_require': {
        'test': [
            'pytest>=3.6',
            'pytest-cov',
            'nbval',
        ],
        'examples': [
            # Any requirements for the examples to run
        ],
        'docs': [
            'sphinx>=1.5',
            'recommonmark',
            'sphinx_rtd_theme',
            'nbsphinx>=0.2.13,<0.4.0',
            'jupyter_sphinx',
            'nbsphinx-link',
            'pytest_check_links',
            'pypandoc',
        ],
    },
    'entry_points': {}
}

if __name__ == '__main__':
    setup(**setup_args)
