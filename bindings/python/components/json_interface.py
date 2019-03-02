import json


def to_camel_case(snake_case):
    """Makes a snake case string into a camel case one"""
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
    for k in attrs.keys():
        camel_key = to_camel_case(k)
        attrs[camel_key] = attrs[k]
        if camel_key != k:
            attrs.pop(k, None)


class JSONSerializable:
    def to_json(self, remap_function=camel_case_keys):
        attrs = vars(self)
        if remap_function:
            remap_function(attrs)
        return json.dump(attrs)
