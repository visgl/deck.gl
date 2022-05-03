# import pytest
# import requests

from pydeck_carto import load_carto_credentials


def test_load_carto_credentials(requests_mock):
    requests_mock.post(
        "https://auth.carto.com/oauth/token", text='{"access_token":"asdf1234"}'
    )
    creds = load_carto_credentials("tests/fixtures/mock_credentials.json")
    assert creds == {
        "apiVersion": "v3",
        "apiBaseUrl": "https://api.carto.com",
        "accessToken": "asdf1234",
    }
