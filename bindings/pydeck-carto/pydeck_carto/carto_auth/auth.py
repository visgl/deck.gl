import datetime
import json
import os.path

import requests as requests


class CredentialsError(Exception):
    pass


class CartoAuth:
    def __init__(
        self,
        filepath=None,
        client_id=None,
        client_secret=None,
        api_base_url="https://gcp-europe-west1.api.carto.com",
        audience="carto-cloud-native-api",
        grant_type="client_credentials",
        cache_filepath=".carto_token.json",
        access_token=None,
        expire_in=None,
        scope=None,
    ):
        self.grant_type = grant_type
        self.cache_filepath = cache_filepath
        self.audience = audience
        self.api_base_url = api_base_url
        self.client_id = client_id
        self.client_secret = client_secret

        if access_token and expire_in:
            now = datetime.datetime.utcnow()
            expires_in = now + datetime.timedelta(seconds=expire_in)
            self.expiration_ts = expires_in.timestamp()
            self._access_token = access_token
            self.scope = scope
            self._dump_token()
        else:
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

            if content:
                self.client_id = content["client_id"]
                self.client_secret = content["client_secret"]
                self.api_base_url = content["api_base_url"]
                self.expiration_ts = None
                self._access_token = None
                self.scope = None
                self.audience = audience
            else:
                populated = self._get_file_token()
                if not populated:
                    raise CredentialsError("Unable to populate credentials object")

        self.auth_type = None
        self.filepath = None or filepath
        self.bg_client = None

    def credentials(self) -> dict:
        """Get the layer credentials object to gather information
        from carto warehouses"""
        oauth_token = self.get_token()
        return {
            "apiVersion": "v3",
            "apiBaseUrl": self.api_base_url,
            "accessToken": oauth_token,
        }

    def get_token(self):
        if self._access_token and not self.token_expired():
            return self._access_token

        stored_token = self._get_file_token()
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
            "grant_type": self.grant_type,
            "audience": self.audience,
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
            self.scope = response_data["scope"]
            self._access_token = response_data["access_token"]
            self.token_type = response_data["token_type"]
            expires_in_seconds = response_data["expires_in"]
            now = datetime.datetime.utcnow()
            expires_in = now + datetime.timedelta(seconds=expires_in_seconds)
            self.expiration_ts = expires_in.timestamp()
            self.auth_type = "API"
            self._dump_token()

        return self._access_token

    def token_expired(self):
        if not self.expiration_ts:
            return True

        now_utc_ts = datetime.datetime.utcnow().timestamp()
        return now_utc_ts > self.expiration_ts

    def cw_credentials(self) -> tuple:
        """Get the carto data warehouse credentials
        returns: (project_id,carto_data_warehouse_token)"""
        if not self.api_base_url:
            raise CredentialsError("api_base_url required")

        url = f"{self.api_base_url}/v3/connections/carto-dw/token"

        access_token = self.get_token()
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        }

        response = requests.get(url, headers=headers)
        creds = response.json()

        return creds["projectId"], creds["token"]

    def _dump_token(self):
        """Saves the token into a hidden file for cache"""
        if not self.cache_filepath:
            return False

        with open(self.cache_filepath, "w") as fw:
            info_to_cache = {
                "accessToken": self._access_token,
                "expiresTS": self.expiration_ts,
                "audience": self.audience,
                "scope": self.scope,
            }
            json.dump(info_to_cache, fw)
        return True

    def _get_file_token(self):
        """Tries to get the hidden token on filesystem"""
        if not self.cache_filepath or not os.path.exists(self.cache_filepath):
            return False

        with open(self.cache_filepath, "r") as fr:
            info = json.load(fr)
            self._access_token = info["accessToken"]
            self.expiration_ts = info["expiresTS"]
            self.audience = info["audience"]
            self.scope = info["scope"]
        return True

    def get_bigquery_client(self):
        """Returns a client to query directly big query"""
        from google.cloud.bigquery import Client as GClient
        from google.oauth2.credentials import Credentials as GCredentials

        project_id, cw_token = self.cw_credentials()
        return GClient(project_id, credentials=GCredentials(cw_token))

    def connections_list(self) -> list:
        """Returns the list of available connections using this credential"""
        raise NotImplementedError()

    def is_valid_connection(self, connection_id):
        """Checks if the connection_id is valid using this credentials"""
        raise NotImplementedError()

    def is_valid_data(self, data, layer_type, connection_id):
        """Checking if the data with this credential, data, connection
        and layer_type is correct to get information from the carto servers"""
        raise NotImplementedError()
