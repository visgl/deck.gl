from .json_interface import JSONSerializable


class View(JSONSerializable):
    def __init__(
        self,
        type,
        controller
    ):
        self.type = type
        self.controller = controller
