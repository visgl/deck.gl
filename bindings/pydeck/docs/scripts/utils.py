import os


def to_presentation_name(s):
    """Format deck.gl layer names from their file names"""
    return s.replace('_', ' ').title().replace(' ', '').replace('json', 'Json')


def to_snake_case_layer_name(fpath):
    return os.path.basename(fpath).replace(".py", "")
