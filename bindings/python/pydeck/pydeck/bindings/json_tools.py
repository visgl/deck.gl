import json


def to_camel_case(snake_case):
    """Makes a snake case string into a camel case one

    Parameters
    -----------
    snake_case : str
        Snake-cased string (e.g., "snake_cased") to be converted to camel-case (e.g., "camelCase")
    """
    output_str = ''
    should_upper_case = False
    for c in snake_case:
        if c == '_':
            should_upper_case = True
            continue
        output_str = output_str + c.upper() if should_upper_case else output_str + c
        should_upper_case = False
    return output_str


def camel_case_keys(attrs):
    """Makes all the keys in a dictionary camel-cased"""
    for snake_key in list(attrs.keys()):
        if '_' not in snake_key:
            continue
        camel_key = to_camel_case(snake_key)
        attrs[camel_key] = attrs.pop(snake_key)


def default_serialize(o, remap_function=camel_case_keys):
    attrs = vars(o)
    attrs = {k: v for k, v in attrs.items() if v is not None}
    if remap_function:
        remap_function(attrs)
    return attrs


def serialize(serializable):
    """Takes a serializable object and JSONifies it"""
    return json.dumps(serializable, sort_keys=True, default=default_serialize)


class JSONMixin(object):

    def __repr__(self):
        """
        Override of string representation method to return a JSON-ified version of the
        Deck object.
        """
        return serialize(self)

    def to_json(self):
        """
        Return a JSON-ified version of the Deck object.
        """
        return serialize(self)
