#!/usr/bin/env python
# coding: utf-8

import os

def _jupyter_nbextension_paths():
    paths = {
        'section': 'notebook',
        'src': 'nbextension/static',
        'dest': 'pydeck',
        'require': 'pydeck/extension'
    }

    if os.getenv('PYDECK_DEVELOPMENT'):
        paths['require'] = 'pydeck/devExtension'

    return [paths]
