import requests as requests

import socket, time
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
print(f"Please enter into this url on a web browser:\n{auth_url}")
# noqa: E501
# "https://oramirez-auth.eu.auth0.com/authorize?response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fcallback%2F&client_id=stLLXbquoj6vuNP3BaFZxHf4MTpZKuga&audience=api%2Ffruit&scope=read%3Aexotic-fruit&nonce=qzqtsrdsnh&state=auth0%2Ciframe%2Cqzqtsrdsnh&prompt=none"

host = "localhost"
port = 8888

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((host, port))


while True:
    time.sleep(5)
    data = client_socket.recv(512)
    if data.lower() == "q":
        client_socket.close()
        break

    print("RECEIVED: %s" % data)
    data = input("SEND( TYPE q or Q to Quit):")
    client_socket.send(data)
    if data.lower() == "q":
        client_socket.close()
        break

response = requests.get(base_url, params=params)
print(response)

# https://oramirez-auth.eu.auth0.com/authorize?response_type=&redirect_uri=my-redirect-uri&client_id=stLLXbquoj6vuNP3BaFZxHf4MTpZKuga&audience=api%2Ffruit&
# scope=write%3Ausual-fruit%20read%3Aexotic-fruit%20profile%20openid%20mail&nonce=vosemqzgns&state=auth0%2Ciframe%2Cvosemqzgns&prompt=none)
