#!/usr/bin/env python
# coding: utf-8
def _jupyter_nbextension_paths():
    paths = {
        'section': 'notebook',
        'src': 'nbextension/static',
        'dest': 'pydeck',
        'require': 'pydeck/extensionRequires'
    }
    return [paths]
