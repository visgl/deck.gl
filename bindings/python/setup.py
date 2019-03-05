#!/usr/bin/env python
# Learn more: https://github.com/kennethreitz/setup.py

import os
import sys

from codecs import open

from setuptools import find_packages, setup
from setuptools.command.test import test as TestCommand

here = os.path.abspath(os.path.dirname(__file__))


class PyTest(TestCommand):

    def run_tests(self):
        import pytest

        errno = pytest.main(['tests/'])
        sys.exit(errno)


# 'setup.py publish' shortcut.
if sys.argv[-1] == 'publish':
    os.system('python setup.py sdist bdist_wheel')
    os.system('twine upload dist/*')
    sys.exit()

# pyOpenSSL version 18.0.0 dropped support for Python 2.6
if sys.version_info < (2, 7):
    PYOPENSSL_VERSION = 'pyOpenSSL >= 0.14, < 18.0.0'
else:
    PYOPENSSL_VERSION = 'pyOpenSSL >= 0.14'

with open('requirements-dev.txt') as f:
    test_requirements = f.read().splitlines()
with open('README.md', 'r', 'utf-8') as f:
    readme = f.read()

setup(
    name='deck_bindings',
    version='0.0.1',
    description='Spatial plots in Python',
    long_description_content_type='text/x-rst',
    author='Andrew Duberstein',
    author_email='ajduberstein@gmail.com',
    url='http://deck.gl/',
    keywords=['data', 'geospatial', 'visualization'],
    packages=find_packages(exclude=['example*']),
    include_package_data=True,
    package_dir={'deck_bindings': 'deck_bindings'},
    python_requires=">=2.6, !=3.0.*, !=3.1.*, !=3.2.*, !=3.3.*",
    license='MIT',
    zip_safe=False,
    classifiers=(
        'Development Status :: 5 - Production/Stable',
        'Intended Audience :: Developers',
        'Natural Language :: English',
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: Implementation :: CPython',
        'Programming Language :: Python :: Implementation :: PyPy'
    ),
    cmdclass={'test': PyTest},
    tests_require=test_requirements,
    extras_require={
        'security': [PYOPENSSL_VERSION, 'cryptography>=1.3.4', 'idna>=2.0.0'],
        'socks': ['PySocks>=1.5.6, !=1.5.7'],
        'socks:sys_platform == "win32" and (python_version == "2.7" or python_version == "2.6")': ['win_inet_pton'],
    },
)
