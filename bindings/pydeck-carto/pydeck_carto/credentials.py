import json
import requests


class CredentialsError(Exception):
    pass


def load_carto_credentials(
    filepath=None, api_base_url=None, client_id=None, client_secret=None
):
    """Load credentials from a file or add the parameters.

    The file must contain the following attributes.
    More information at https://api-docs.carto.com/.
    - api_base_url
    - client_id
    - client_secret
    """
    if not filepath and not api_base_url and not client_id and not client_secret:
        raise ValueError("Credentials filepath or credentials parameters required")

    content = {}
    if filepath:
        with open(filepath, "r") as f:
            content = json.load(f)
    elif api_base_url and client_id and client_secret:
        content = dict(
            zip(
                ["api_base_url", "client_id", "client_secret"],
                [api_base_url, client_id, client_secret],
            )
        )

    mandatory_attributes = ["api_base_url", "client_id", "client_secret"]
    for attribute in mandatory_attributes:
        if attribute not in content:
            raise ValueError(f"Missing attribute '{attribute}' in credentials")

    url = "https://auth.carto.com/oauth/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "audience": "carto-cloud-native-api",
        "client_id": content["client_id"],
        "client_secret": content["client_secret"],
    }
    response = requests.post(url, headers=headers, data=data)
    if response.status_code != 200:
        error_msg = response.json()
        error_subjects = {
            403: "Permissions Error",
            401: "Authorization Error",
        }
        error_subject = error_subjects.get(response.status_code, "Credential Error")
        msg = (
            f'{error_subject} - {error_msg.get("error")}: '
            f'{error_msg.get("error_description")}'
        )
        raise CredentialsError(msg)
    else:
        oauth_token = response.json()["access_token"]

    return {
        "apiVersion": "v3",
        "apiBaseUrl": content["api_base_url"],
        "accessToken": oauth_token,
    }
