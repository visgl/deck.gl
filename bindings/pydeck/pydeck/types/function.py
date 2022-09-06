from functools import total_ordering

from .base import PydeckType


@total_ordering
class Function(PydeckType):
    """Indicate a function type with arguments and set already in pydeck

    Parameters
    ----------

    name : str
        Function name
    **kwargs
        arguments and value of each argument to be storing the function information
    """
    __PREFIX = '@@function'

    def __init__(self, name: str, **kwargs):
        self.name = name
        self.arguments = kwargs

    def __lt__(self, other):
        return str(self) < str(other)

    def __eq__(self, other):
        return str(self) == str(other)

    def __repr__(self):
        return self.to_deck()

    def to_deck(self):
        deck_fun = {
            self.__PREFIX: self.name
        }
        deck_fun.update(self.arguments)
        return deck_fun
