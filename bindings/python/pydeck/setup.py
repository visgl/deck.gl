# -*- coding: utf-8 -*-

from __future__ import print_function
from setuptools import setup, find_packages
import os
import platform  # noqa

here = os.path.dirname(os.path.abspath(__file__))

# TODO add widget

from distutils import log  # noqa

log.set_verbosity(log.DEBUG)
log.info('setup.py entered')
log.info('$PATH=%s' % os.environ['PATH'])

LONG_DESCRIPTION = 'Python wrapper for deck.gl'


def update_package_data(distribution):
    """update package_data to catch changes during setup"""
    build_py = distribution.get_command_obj('build_py')
    # distribution.package_data = find_package_data()
    # re-init build_py options which load package_data
    build_py.finalize_options()


version_ns = {}
with open(os.path.join(here, 'pydeck', '_version.py')) as f:
    exec(f.read(), {}, version_ns)

setup_args = {
    'name': 'pydeck',
    'version': version_ns['__version__'],
    'description': 'Widget for deck.gl maps',
    'long_description': LONG_DESCRIPTION,
    'license': 'MIT License',
    'include_package_data': True,
    'install_requires': [
        'ipywidgets>=7.0.0,<8',
        'traitlets>=4.3.2'
    ],
    'packages': find_packages(),
    'zip_safe': False,
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
            'pytest-cov'
        ],
        'examples': [
            # Any requirements for the examples to run
        ],
    },
    'entry_points': {}
}

if __name__ == '__main__':
    setup(**setup_args)
