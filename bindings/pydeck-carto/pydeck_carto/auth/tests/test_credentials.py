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
from pydeck_carto.auth.auth import CartoAuth


def test_credentials_from_file():
    filepath = "fixtures/mock_credentials.json"
    ca = CartoAuth(filepath=filepath)
    assert ca.client_id == "1234"
    assert ca.client_secret == "1234567890"
    assert ca.api_base_url == "https://api.carto.com"

    creds = ca.credentials()
    assert creds["apiVersion"] == "v3"
    assert creds["apiBaseUrl"] == ca.api_base_url
    assert len(creds["accessToken"]) > 0

    access_token = ca.get_token()
    assert len(access_token) > 0
    current_utc_ts = 123
    assert ca.expiration_ts > current_utc_ts


def test_credentials_from_parameters():
    ca = CartoAuth(client_id="1234", client_secret="1234567890")
    assert ca.client_id == "1234"
    assert ca.client_secret == "1234567890"
    assert ca.api_base_url == "https://gcp-europe-west1.api.carto.com"

    creds = ca.credentials()
    assert creds["apiVersion"] == "v3"
    assert creds["apiBaseUrl"] == ca.api_base_url
    assert len(creds["accessToken"]) > 0


def test_handle_file_token():
    filepath = "fixtures/mock_credentials.json"
    ca = CartoAuth(filepath=filepath)

    try:
        saved = ca._dump_token()
        assert 1 == 2, "Not raised the proper exception"
    except ValueError as e:
        assert "user get_token() first" in e.args

    access_token = ca.get_token()
    saved = ca._dump_token()
    if not saved:
        assert 1 == 2, "Not saved token"

    saved_access_token = ca._get_file_token()
    assert saved_access_token == access_token


def test_handle_file_token_cached_on_file():
    filepath = "fixtures/.carto_token"
    ca = CartoAuth.from_token(token_file=filepath)

    saved_token = ""  # encoded on the file
    assert saved_token == ca.get_token()

    expected_expiration_ts = 123123  # encoded on the file
    assert ca.expiration_ts == expected_expiration_ts

    expected_api_base = ""  # encoded on the file
    assert expected_api_base == ca.api_base_url


def test_handle_auth_tokens():
    # Used on Oauth methods
    access_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InUzWjRJOVBhUVZ2RjA2MWVaZHlfNCJ9.eyJpc3MiOiJodHRwczovL29yYW1pcmV6LWF1dGguZXUuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTEwNjc5NzE5MDU5ODk3NjU5Njc4IiwiYXVkIjoiYXBpL2ZydWl0IiwiaWF0IjoxNjYxNzU4MTE1LCJleHAiOjE2NjE3NjUzMTUsImF6cCI6InN0TExYYnF1b2o2dnVOUDNCYUZaeEhmNE1UcFpLdWdhIiwic2NvcGUiOiJ3cml0ZTp1c3VhbC1mcnVpdCJ9.E5DbjwEOlbm37GkJPqkvh2ZZjlxtvERItd4loiWNcUXrzGQ34PBiC-kESeIFk_7AicldWxxGmIBZKycBflwoDNkR3CRchgW2CW4lPK7SSNAVR5iTwPPAHAhLwgwgKNmldOv5Wq7sDhf7Rc0JAQAdBqaTHXQrae57LNlnxVN--uJdq3oc4LYE3NDvQJIHlWaPDPsE6IgTOdQuS5bY867Ux3u3iLxEJpOevsce0d8l2or3se6GTX8rTb2Ip8rTkIrll0qzl-uwgTy0AoD-HM748W_FA1ScdTboilCzko6cFsMIDzb-ou-5BQPkIp6GtsYZuwrSD_t6t_ZrP46ehoUd1A"
    expire_in = 7200
    ca = CartoAuth.from_token(access_token=access_token, expire_in=expire_in)

    creds = ca.credentials()
    assert creds["apiVersion"] == "v3"
    assert creds["apiBaseUrl"] == ca.api_base_url
    assert creds["accessToken"] == access_token

    now_utc_ts = 123123
    assert ca.expiration_ts > now_utc_ts
