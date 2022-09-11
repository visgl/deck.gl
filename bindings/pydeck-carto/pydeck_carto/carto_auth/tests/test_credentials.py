"""

Testing the credentials object with different features
Create credentials
* from filesystem
* from arguments
* from auth access_token and expired_in

ask for auth from script

dump and red token credentials into a hidden file

Check if the token has been expired, refresh token function
"""
import datetime
import os

from pydeck_carto import CartoAuth, CredentialsError


def test_credentials_from_file(requests_mock):
    requests_mock.post(
        "https://auth.carto.com/oauth/token",
        json={
            "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpX",
            "scope": "read:tokens write:tokens read:imports write:imports "
            "read:connections write:connections",
            "expires_in": 86400,
            "token_type": "Bearer",
        },
    )

    filepath = "fixtures/mock_credentials.json"
    fullpath = os.path.join(os.path.dirname(__file__), filepath)
    ca = CartoAuth.from_file(filepath=fullpath)
    assert ca.client_id == "1234"
    assert ca.client_secret == "1234567890"
    assert ca.api_base_url == "https://api.carto.com"

    assert ca.token_expired() is True

    creds = ca.get_layer_credentials()
    assert creds["apiVersion"] == "v3"
    assert creds["apiBaseUrl"] == ca.api_base_url
    assert len(creds["accessToken"]) > 0

    access_token = ca._get_token()
    assert len(access_token) > 0
    current_utc_ts = datetime.datetime.utcnow().timestamp()
    assert ca.expiration_ts > current_utc_ts

    assert ca.token_expired() is False


def test_credentials_from_parameters(requests_mock):
    requests_mock.post(
        "https://auth.carto.com/oauth/token",
        json={
            "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpX",
            "scope": "read:tokens write:tokens read:imports write:imports "
            "read:connections write:connections",
            "expires_in": 86400,
            "token_type": "Bearer",
        },
    )

    ca = CartoAuth(client_id="1234", client_secret="1234567890")
    assert ca.client_id == "1234"
    assert ca.client_secret == "1234567890"
    assert ca.api_base_url == "https://gcp-us-east1.api.carto.com"

    creds = ca.get_layer_credentials()
    assert creds["apiVersion"] == "v3"
    assert creds["apiBaseUrl"] == ca.api_base_url
    assert len(creds["accessToken"]) > 0


def test_handle_file_token_cached_on_file():
    cache_filepath = "fixtures/.carto_token.json"
    fullpath = os.path.join(os.path.dirname(__file__), cache_filepath)
    ca = CartoAuth(cache_filepath=fullpath)

    saved_token = "testAccessTokenlkjsdofiuqwelrkjas908d7"  # encoded on the file
    assert saved_token == ca._get_token()

    expected_expiration_ts = 32503676400  # encoded on the file
    assert ca.expiration_ts == expected_expiration_ts
    assert ca.token_expired() is False


def test_handle_file_token_cached_expired_on_file():
    cache_filepath = "fixtures/.carto_token_expired.json"
    fullpath = os.path.join(os.path.dirname(__file__), cache_filepath)
    try:
        _ = CartoAuth(cache_filepath=fullpath)
        assert 1 == 2, "Saved expired token returned instead of an error"
    except CredentialsError:
        assert 1 == 1


def test_handle_auth_tokens():
    access_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InUzWjRJOVBhUVZ2RjA2MWVaZHlfNCJ9.eyJpc3MiOiJodHRwczovL29yYW1pcmV6LWF1dGguZXUuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTEwNjc5NzE5MDU5ODk3NjU5Njc4IiwiYXVkIjoiYXBpL2ZydWl0IiwiaWF0IjoxNjYxNzU4MTE1LCJleHAiOjE2NjE3NjUzMTUsImF6cCI6InN0TExYYnF1b2o2dnVOUDNCYUZaeEhmNE1UcFpLdWdhIiwic2NvcGUiOiJ3cml0ZTp1c3VhbC1mcnVpdCJ9.E5DbjwEOlbm37GkJPqkvh2ZZjlxtvERItd4loiWNcUXrzGQ34PBiC-kESeIFk_7AicldWxxGmIBZKycBflwoDNkR3CRchgW2CW4lPK7SSNAVR5iTwPPAHAhLwgwgKNmldOv5Wq7sDhf7Rc0JAQAdBqaTHXQrae57LNlnxVN--uJdq3oc4LYE3NDvQJIHlWaPDPsE6IgTOdQuS5bY867Ux3u3iLxEJpOevsce0d8l2or3se6GTX8rTb2Ip8rTkIrll0qzl-uwgTy0AoD-HM748W_FA1ScdTboilCzko6cFsMIDzb-ou-5BQPkIp6GtsYZuwrSD_t6t_ZrP46ehoUd1A"  # noqa: E501
    expire_in = 7200
    ca = CartoAuth(access_token=access_token, expires_in=expire_in)

    creds = ca.get_layer_credentials()
    assert creds["apiVersion"] == "v3"
    assert creds["apiBaseUrl"] == ca.api_base_url
    assert creds["accessToken"] == access_token

    assert ca.token_expired() is False
