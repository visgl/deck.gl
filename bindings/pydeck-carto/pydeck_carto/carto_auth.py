import webbrowser
from urllib.parse import urlencode

domain = "oramirez-auth.eu.auth0.com"
base_url = f"https://{domain}/authorize"
client_id = "stLLXbquoj6vuNP3BaFZxHf4MTpZKuga"
audience = "api/fruit"
scope = "write:usual-fruit"
params = {
    "response_type": "token",
    "redirect_uri": "http://localhost:8888/callback/",
    "audience": audience,
    "scope": scope,
    "client_id": client_id,
}
params_encoded = urlencode(params)
auth_url = f"{base_url}/?{params_encoded}"

ret = webbrowser.open(auth_url)
if not ret:
    print(f"Please open the next url on a web browser:\n{auth_url}")

access_token_raw = input("After login, copy and paste here the access token: ")
access_token = access_token_raw.strip()

print(f"The access token is: {access_token}")
