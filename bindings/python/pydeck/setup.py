# -*- coding: utf-8 -*-
from __future__ import print_function

from distutils.command.install import install
from setuptools import setup, find_packages, Command
from setuptools.command.sdist import sdist
from setuptools.command.build_py import build_py
from setuptools.command.egg_info import egg_info
from setuptools.command.develop import develop

import atexit
from distutils import log
import os
from shutil import copy
from subprocess import check_call
import sys

here = os.path.dirname(os.path.abspath(__file__))


def read(*parts):
    return open(os.path.join(here, *parts), 'r').read()


log.info('setup.py entered')
log.info('$PATH=%s' % os.environ['PATH'])

PATH_TO_WIDGET = '../../../modules/jupyter-widget'
PATH_TO_REPO_ROOT = '../../..'

yarn_root = os.path.join(here, PATH_TO_REPO_ROOT)
widget_dir = os.path.join(here, PATH_TO_WIDGET)

npm_path = os.pathsep.join([
    os.path.join(PATH_TO_REPO_ROOT, 'node_modules', '.bin'),
    os.environ.get('PATH', os.defpath),
])


def update_package_data(distribution):
    """update package_data to catch changes during setup"""
    build_py = distribution.get_command_obj('build_py')
    # distribution.package_data = find_package_data()
    # re-init build_py options which load package_data
    build_py.finalize_options()


class ExitHookDevelop(develop):
    """Registers widget with notebook server after development installation"""
    description = "Register widget with a local Jupyter notebook"

    def run(self):

        def _post_install():
            log.info("Enabling widget locally")
            check_call(['bash', 'postBuild'], cwd=here, stdout=sys.stdout, stderr=sys.stderr)

        atexit.register(_post_install)
        develop.run(self)


class Yarn(Command):
    description = "Install package.json dependencies using yarn"

    user_options = []

    # Files to copy into the Python side of the widget
    targets = [
        # os.path.join(here, 'pydeck', 'nbextension', 'static', 'extension.js'),
        os.path.join(here, 'pydeck', 'nbextension', 'static', 'index.js'),
        os.path.join(here, 'pydeck', 'nbextension', 'static', 'index.js.map'),
    ]

    for filepath in targets:
        try:
            os.remove(filepath)
        except Exception:
            log.info('No file %s, not removing' % filepath)

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def has_yarn(self):
        try:
            check_call(['yarn', '--version'])
            return True
        except Exception:
            return False

    def copy_js(self):
        """Copy JS bundle from top-level JS module to pydeck widget's `static/` folder.
           Overwrites destination files."""
        js_dist_dir = os.path.join(widget_dir, 'dist')
        js_files = [
            os.path.join(js_dist_dir, 'pydeck_embeddable', 'index.js'),
            os.path.join(js_dist_dir, 'pydeck_embeddable', 'index.js.map')
        ]
        static_folder = os.path.join(here, 'pydeck', 'nbextension', 'static')
        for js_file in js_files:
            log.debug('Copying %s to %s' % (js_file, static_folder))
            copy(js_file, static_folder)

    def run(self):
        has_yarn = self.has_yarn()
        if not has_yarn:
            log.error(
                "`yarn` unavailable.  If you're running this command using sudo, make sure `yarn` is available to sudo")

        env = os.environ.copy()
        env['PATH'] = npm_path

        log.info("Installing build dependencies with yarn. This may take a while...")
        check_call(['yarn', 'bootstrap'], cwd=yarn_root, stdout=sys.stdout, stderr=sys.stderr, env=env)
        self.copy_js()

        for t in self.targets:
            if not os.path.exists(t):
                msg = 'Missing file: %s' % t
                if not has_yarn:
                    msg += '\nyarn is required to build a development version of widgetsnbextension'
                raise ValueError(msg)

        # update package data in case this created new files
        update_package_data(self.distribution)


def js_prerelease(command, strict=False):
    """decorator for symlinking notebook with extension in development"""
    class DecoratedCommand(command):
        def run(self):
            jsdeps = self.distribution.get_command_obj('jsdeps')  # noqa
            self.distribution.run_command('jsdeps')
            command.run(self)
            update_package_data(self.distribution)
    return DecoratedCommand


with open('requirements.txt') as f:
    tests_require = f.readlines()
install_requires = [t.strip() for t in tests_require]


version_ns = {}
with open(os.path.join(here, 'pydeck', '_version.py')) as f:
    exec(f.read(), {}, version_ns)


if __name__ == '__main__':
    setup(
        name='pydeck',
        version=version_ns['__version__'],
        description='Widget for deck.gl maps',
        long_description='{}'.format(read('README.md')),
        license='MIT License',
        include_package_data=True,
        packages=find_packages(),
        cmdclass={
            'install': js_prerelease(install),
            'develop': js_prerelease(ExitHookDevelop),
            'build_py': js_prerelease(build_py),
            'egg_info': egg_info,
            'sdist': js_prerelease(sdist, strict=True),
            'jsdeps': Yarn,
        },
        author='Andrew Duberstein',
        author_email='ajduberstein@gmail.com',
        url='https://github.com/uber/deck.gl/tree/master/bindings/python/pydeck',
        keywords=['data', 'visualization', 'graphics', 'GIS', 'maps'],
        classifiers=[
            'Intended Audience :: Developers',
            'Intended Audience :: Science/Research',
            'Topic :: Multimedia :: Graphics',
            'License :: OSI Approved :: MIT License',
            'Programming Language :: Python :: 2.7',
            'Programming Language :: Python :: 3',
            'Programming Language :: Python :: 3.3',
            'Programming Language :: Python :: 3.4',
            'Programming Language :: Python :: 3.5',
            'Programming Language :: Python :: 3.6',
            'Programming Language :: Python :: 3.7',
            'Framework :: Jupyter'],
        extras_require={'testing': ['pytest']},
        install_requires=install_requires,
        data_files=[
            ('share/jupyter/nbextensions/pydeck', [
                'pydeck/nbextension/static/extension.js',
                'pydeck/nbextension/static/index.js',
                'pydeck/nbextension/static/index.js.map'
            ]),
            ('etc/jupyter/nbconfig/notebook.d', ['pydeck.json'])
        ],
        zip_safe=False)
