import json
import requests


def load_carto_credentials(filepath):
    """Load credentials from file. It must contain the following attributes:
    - api_base_url
    - client_id
    - client_secret
    """
    with open(filepath, "r") as f:
        content = json.load(f)

    if "api_base_url" not in content:
        raise Exception("Missing attribute 'api_base_url'")

    if "client_id" not in content:
        raise Exception("Missing attribute 'client_id'")

    if "client_secret" not in content:
        raise Exception("Missing attribute 'client_secret'")

    url = "https://auth.carto.com/oauth/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "client_credentials",
        "audience": "carto-cloud-native-api",
        "client_id": content["client_id"],
        "client_secret": content["client_secret"],
    }
    response = requests.post(url, headers=headers, data=data)
    oauth_token = response.json()["access_token"]

    return {
        "apiVersion": "v3",
        "apiBaseUrl": content["api_base_url"],
        "accessToken": oauth_token,
    }
