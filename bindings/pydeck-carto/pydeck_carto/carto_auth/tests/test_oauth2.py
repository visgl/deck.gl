from urllib.parse import urlparse, parse_qs

from pydeck_carto import CartoAuth
from pydeck_carto.carto_auth.oauth2 import CartoPKCE


def test_url_properly_created():
    c_pkce = CartoPKCE(open_browser=False)
    url = c_pkce.get_authorize_url()
    parsed_url = urlparse(url)
    parsed_qs = parse_qs(parsed_url.query)

    assert parsed_qs["code_challenge_method"] == ["S256"]
    assert parsed_qs["redirect_uri"] == ["https://callbacks.carto.com/token"]
    assert parsed_qs["response_type"] == ["code"]
    assert parsed_qs["client_id"][0].startswith("AtxvHDe")
    assert len(parsed_qs["code_challenge"]) > 0


def test_token_from_input_prompt(mocker, requests_mock):
    mocker.patch(
        "pydeck_carto.carto_auth.oauth2.CartoPKCE._input",
        return_value="carto.com/autorize?code=abcde",
    )
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

    c_pkce = CartoPKCE(open_browser=False)
    c_pkce.get_pkce_handshake_parameters()

    assert len(c_pkce.code_challenge) > 0
    assert len(c_pkce.code_verifier) > 0


def test_token_from_input_mocked(mocker, requests_mock):
    mocker.patch(
        "pydeck_carto.carto_auth.oauth2.CartoPKCE._input",
        return_value="carto.com/autorize?code=abcde",
    )
    requests_mock.post(
        "https://auth.carto.com/oauth/token",
        json={
            "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpX",
            "scope": "",
            "expires_in": 86400,
            "token_type": "Bearer",
        },
    )

    c_pkce = CartoPKCE(open_browser=False)
    code = c_pkce.get_auth_response()
    assert code == "abcde"


def test_carto_auth_from_oauth(mocker, requests_mock):
    mocker.patch(
        "pydeck_carto.carto_auth.oauth2.CartoPKCE._input",
        return_value="carto.com/autorize?code=abcde",
    )
    requests_mock.post(
        "https://auth.carto.com/oauth/token",
        json={
            "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpX",
            "scope": "",
            "expires_in": 86400,
            "token_type": "Bearer",
        },
    )

    carto_auth = CartoAuth.from_oauth(open_browser=False, use_cache=False)
    assert carto_auth.get_layer_credentials() == {
        "apiVersion": "v3",
        "apiBaseUrl": "https://gcp-us-east1.api.carto.com",
        "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpX",
    }


def test_handle_auth_tokens():
    access_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InUzWjRJOVBhUVZ2RjA2MWVaZHlfNCJ9.eyJpc3MiOiJodHRwczovL29yYW1pcmV6LWF1dGguZXUuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTEwNjc5NzE5MDU5ODk3NjU5Njc4IiwiYXVkIjoiYXBpL2ZydWl0IiwiaWF0IjoxNjYxNzU4MTE1LCJleHAiOjE2NjE3NjUzMTUsImF6cCI6InN0TExYYnF1b2o2dnVOUDNCYUZaeEhmNE1UcFpLdWdhIiwic2NvcGUiOiJ3cml0ZTp1c3VhbC1mcnVpdCJ9.E5DbjwEOlbm37GkJPqkvh2ZZjlxtvERItd4loiWNcUXrzGQ34PBiC-kESeIFk_7AicldWxxGmIBZKycBflwoDNkR3CRchgW2CW4lPK7SSNAVR5iTwPPAHAhLwgwgKNmldOv5Wq7sDhf7Rc0JAQAdBqaTHXQrae57LNlnxVN--uJdq3oc4LYE3NDvQJIHlWaPDPsE6IgTOdQuS5bY867Ux3u3iLxEJpOevsce0d8l2or3se6GTX8rTb2Ip8rTkIrll0qzl-uwgTy0AoD-HM748W_FA1ScdTboilCzko6cFsMIDzb-ou-5BQPkIp6GtsYZuwrSD_t6t_ZrP46ehoUd1A"  # noqa: E501
    expire_in = 7200
    ca = CartoAuth(access_token=access_token, expires_in=expire_in)

    creds = ca.get_layer_credentials()
    assert creds["apiVersion"] == "v3"
    assert creds["apiBaseUrl"] == ca.api_base_url
    assert creds["accessToken"] == access_token

    assert ca.token_expired() is False
