import os


def to_presentation_name(s):
    """Convert a snake_case string to a camelCase string (if a layer or view)
    or just a standard title"""
    # Format deck.gl layer names from their file names
    if "layer" in s or "view" in s:
        return s.replace("_", " ").title().replace(" ", "").replace("json", "Json")
    return s.replace("_", " ").title()


def to_snake_case_string(file_name=None):
    """Clip a file name to its base string name"""
    return os.path.basename(file_name).replace(".py", "")
