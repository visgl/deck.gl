import abc
import json
from collections.abc import Iterable

TYPE_IDENTIFIER = "@@type"
FUNCTION_IDENTIFIER = "@@="
ENUM_IDENTIFIER = "@@#"


class Type(metaclass=abc.ABCMeta):
    """Base class for Pydeck defined type"""

    def __init__(self, value):
        self._value = value

    def __repr__(self):
        return self.type_name + "(" + str(self.json()) + ")"

    @property
    @abc.abstractmethod
    def type_name(self):
        """Name of Type; used in default __repr__"""

    @abc.abstractmethod
    def json(self):
        """JSON representation of object for serialization"""


class Enum(Type):
    """Enum type

    Interpret as an Enum, resolving in the JSON configuration
    """

    type_name = "Enum"

    def __init__(self, value):
        if not isinstance(value, str):
            raise TypeError("Enum value must be a string")

        super(Enum, self).__init__(value)

    def json(self):
        return ENUM_IDENTIFIER + self._value


class Function(Type):
    """Function type

    Interpret as a function, parsing unquoted character strings as identifiers
    """

    type_name = "Function"

    def json(self):
        if isinstance(self._value, Iterable) and not isinstance(self._value, str):
            return FUNCTION_IDENTIFIER + "[{}]".format(", ".join(map(str, self._value)))

        return FUNCTION_IDENTIFIER + str(self._value)


class Identifier(Type):
    """Identifier type
    """

    type_name = "Identifier"

    def __init__(self, value):
        if not isinstance(value, str):
            raise TypeError("Identifier value must be a string")

        super(Identifier, self).__init__(value)

    def __str__(self):
        return str(self._value)

    def json(self):
        return self._value


class Literal(Type):
    """A Literal object

    Can be any JSON-encodable object
    """

    type_name = "Literal"

    def __init__(self, value):
        try:
            json.dumps(value)
        except TypeError as e:
            raise TypeError("Literal value must be JSON serializable\n" + e)

        super(Literal, self).__init__(value)

    def __str__(self):
        return '"{}"'.format(self._value)

    def json(self):
        return self._value
