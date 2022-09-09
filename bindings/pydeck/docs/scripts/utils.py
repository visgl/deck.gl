import os


def to_presentation_name(s):
    return s.replace("_", " ").title()


def to_snake_case_string(file_name=None):
    """Clip a file name to its base string name"""
    return os.path.basename(file_name).replace(".py", "")
