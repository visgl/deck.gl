from functools import total_ordering

from .base import PydeckType


@total_ordering
class String(PydeckType):
    def __init__(self, s: str, quote_type: str = ""):
        self.value = f"{quote_type}{s}{quote_type}"

    def __lt__(self, other):
        return str(self) < str(other)

    def __eq__(self, other):
        return str(self) == str(other)

    def __repr__(self):
        return self.value
