from pydeck.types.function import Function


def test_calculate_radius():
    assert Function("calculateRadius", base=2, exponent=3).to_deck() == {
        "@@function": "calculateRadius",
        "base": 2,
        "exponent": 3
    }


def test_custom_function():
    assert Function("add", op_a=6, op_b=24).to_deck() == {
        "@@function": "add",
        "op_a": 2,
        "op_b": 24
    }
