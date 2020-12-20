from pydeck.types import String


def test_basic_case():
    assert "ok" == String("ok")


def test_quotes():
    assert "`ok`" == String("ok", quote_type="`")
