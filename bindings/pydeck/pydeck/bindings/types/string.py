class String:
    def __init__(self, s: str, quote_type: str = '"'):
        self.value = f"{quote_type}{s}{quote_type}"

    def __repr__(self):
        return self.value
