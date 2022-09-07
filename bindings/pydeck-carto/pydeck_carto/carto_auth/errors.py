from requests import HTTPError


class CredentialsError(Exception):
    @staticmethod
    def from_http_error(http_error: HTTPError):
        response = http_error.response
        try:
            error_payload = response.json()
            error = error_payload.get("error")
            error_description = error_payload.get("error_description")
        except ValueError:
            error = response.text or None
            error_description = None

        return CredentialsError(
            f"error: {error}, " f"error_description: {error_description}"
        )
