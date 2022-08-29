import json


class CartoAuth:
    def __init__(
        self,
        filepath=None,
        client_id=None,
        client_secret=None,
        api_base_url="https://gcp-europe-west1.api.carto.com",
    ):
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

        self.client_id = content["client_id"]
        self.client_secret = content["client_secret"]
        self.api_base_url = content["api_base_url"]
        self.auth_type = "API"

        self.expiration_ts = None
        self._access_token = None
        self.filepath = None or filepath
        self.bg_client = None

    @classmethod
    def from_token(cls, token_file: str = None,
            access_token: str = None, expire_in: int = None):  #-> CartoAuth:
        """Creates a new AuthCarto object from a saved token_file
        or with an access_token and expire_in values"""
        raise NotImplementedError()

    def credentials(self) -> dict:
        """Get the layer credentials object to gather information
        from carto warehouses"""
        raise NotImplementedError()

    def cw_credentials(self) -> tuple:
        """Get the carto data warehouse credentials
        returns: (project_id,carto_data_warehouse_token)"""
        raise NotImplementedError()

    def _dump_token(self):
        """Saves the token into a hidden file for cache"""
        raise NotImplementedError()

    def _get_file_token(self):
        """Tries to get the hidden token on filesystem"""
        raise NotImplementedError()

    def get_bigquery_client(self):
        """Returns a client to query directly big query"""
        raise NotImplementedError()

    def get_token(self):
        """Returns the API token from filesystem or on the object"""
        raise NotImplementedError()

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
