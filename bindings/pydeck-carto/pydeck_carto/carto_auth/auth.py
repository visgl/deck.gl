import datetime
import json
import os.path

import requests as requests

from pydeck_carto.carto_auth.errors import CredentialsError
from pydeck_carto.carto_auth.oauth2 import CartoPKCE

DEFAULT_API_BASE_URL = "https://gcp-us-east1.api.carto.com"


class CartoAuth:
    """Carto Authentication object used to gather connect with the carto services

    It can be initialized using the parameters or the from_file(<filepath>) function

    Parameters
    ----------

    client_id : client_id of your application API keys provided by Carto
    client_secret: client_secret of your application API keys provided by Carto
    api_base_url: base url where your application is connected to
    access_token: access_token already generated for your user
    expires_in: time in seconds when the token will be expired
    cache_filepath: specific path where the tokens saved on the cache will be stored
    use_cache: to use by default the cached token

    .. How to get the API credentials:
        https://docs.carto.com/carto-user-manual/developers/carto-for-developers/
    """

    def __init__(
        self,
        client_id=None,
        client_secret=None,
        api_base_url=DEFAULT_API_BASE_URL,
        access_token=None,
        expires_in=None,
        cache_filepath=".carto_token.json",
        use_cache=True,
    ):
        self.cache_filepath = cache_filepath
        self.api_base_url = api_base_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.use_cache = use_cache

        if access_token and expires_in:
            now = datetime.datetime.utcnow()
            expires_in = now + datetime.timedelta(seconds=expires_in)
            self.expiration_ts = expires_in.timestamp()
            self._access_token = access_token
            self._dump_token()
        else:
            if client_id and client_secret and api_base_url:
                self.expiration_ts = None
                self._access_token = None
            else:
                populated = self._load_file_token()
                if not populated:
                    raise CredentialsError("Unable to populate credentials object")

        self.auth_type = None

    @classmethod
    def from_file(cls, filepath, use_cache=True):
        with open(filepath, "r") as f:
            content = json.load(f)
        for attr in ("client_id", "api_base_url", "client_secret"):
            if attr not in content:
                raise AttributeError(f"Missing attribute {attr} from {filepath}")
            if not content[attr]:
                raise ValueError(f"Missing value for {attr} in {filepath}")

        return cls(
            client_id=content["client_id"],
            client_secret=content["client_secret"],
            api_base_url=content["api_base_url"],
            use_cache=use_cache,
        )

    def get_layer_credentials(self) -> dict:
        """Get the layer credentials object to gather information
        from carto warehouses"""
        access_token = self._get_token()
        return {
            "apiVersion": "v3",
            "apiBaseUrl": self.api_base_url,
            "accessToken": access_token,
        }

    def _get_token(self):
        if self._access_token and not self.token_expired():
            return self._access_token

        stored_token = self._load_file_token()
        if not stored_token or not self._access_token or self.token_expired():
            try:
                self._get_new_token()
            except CredentialsError:
                if stored_token and self.token_expired():
                    raise CredentialsError(
                        "Stored token expired but no client_id and client_secret found"
                    )
                else:
                    raise

        return self._access_token

    def _get_new_token(self):
        if not self.client_id or not self.client_secret:
            msg = "Missing "
            missing = []
            if not self.client_id:
                missing.append("client_id")
            if not self.client_secret:
                missing.append("client_secret")
            msg += " and ".join(missing)
            raise CredentialsError(msg)

        url = "https://auth.carto.com/oauth/token"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "grant_type": "client_credentials",
            "audience": "carto-cloud-native-api",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
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
            response_data = response.json()
            self._access_token = response_data["access_token"]
            self.token_type = response_data["token_type"]
            expires_in_seconds = response_data["expires_in"]
            now = datetime.datetime.utcnow()
            expires_in = now + datetime.timedelta(seconds=expires_in_seconds)
            self.expiration_ts = expires_in.timestamp()
            self.auth_type = "API"
            self._dump_token()

        return self._access_token

    def _api_headers(self):
        access_token = self._get_token()
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        }

    def token_expired(self):
        if not self.expiration_ts:
            return True

        now_utc_ts = datetime.datetime.utcnow().timestamp()
        return now_utc_ts > self.expiration_ts

    def get_carto_dw_credentials(self) -> tuple:
        """Get the carto data warehouse credentials
        returns: (project_id,carto_data_warehouse_token)"""
        if not self.api_base_url:
            raise CredentialsError("api_base_url required")

        url = f"{self.api_base_url}/v3/connections/carto-dw/token"
        headers = self._api_headers()

        response = requests.get(url, headers=headers)
        creds = response.json()

        return creds["projectId"], creds["token"]

    def _dump_token(self):
        """Saves the token into a hidden file for cache"""
        if not self.use_cache or not self.cache_filepath:
            return False

        with open(self.cache_filepath, "w") as fw:
            info_to_cache = {
                "accessToken": self._access_token,
                "expiresTS": self.expiration_ts,
            }
            json.dump(info_to_cache, fw)
        return True

    def _load_file_token(self):
        """Tries to get the hidden token on filesystem"""
        if (
            not self.use_cache
            or not self.cache_filepath
            or not os.path.exists(self.cache_filepath)
        ):
            return False

        with open(self.cache_filepath, "r") as fr:
            info = json.load(fr)
            self._access_token = info["accessToken"]
            self.expiration_ts = info["expiresTS"]
        if self.token_expired():
            return False

        return True

    def get_carto_dw_client(self):
        """Returns a client to query directly the CARTO DW (BigQuery)"""
        from google.cloud.bigquery import Client as GClient
        from google.oauth2.credentials import Credentials as GCredentials

        project_id, cw_token = self.get_carto_dw_credentials()
        return GClient(project_id, credentials=GCredentials(cw_token))

    def list_connections(self) -> list:
        """Returns the list of available connections using this credential"""
        url = f"{self.api_base_url}/v3/connections"
        headers = self._api_headers()

        response = requests.get(url, headers=headers)
        connections_response = response.json()
        return [conn.get("name") for conn in connections_response]

    @classmethod
    def from_oauth(
        cls,
        open_browser=True,
        api_base_url=DEFAULT_API_BASE_URL,
        cache_filepath=".carto_token.json",
        use_cache=True,
    ):
        if use_cache and cache_filepath:
            try:
                return CartoAuth(
                    api_base_url=api_base_url, cache_filepath=cache_filepath
                )
            except CredentialsError:
                print("Unable to get the cached token, requesting it via oauth")

        pkce_auth = CartoPKCE(open_browser=open_browser)
        code = pkce_auth.get_auth_response()
        token_info = pkce_auth.get_token_info(code)
        return CartoAuth(
            access_token=token_info["access_token"],
            expires_in=token_info["expires_in"],
            api_base_url=api_base_url,
            cache_filepath=cache_filepath,
        )
