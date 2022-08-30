# echo_server.py
import socket

host = "localhost"  # Symbolic name meaning all available interfaces
port = 8888  # Arbitrary non-privileged port
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((host, port))
s.listen(1)
conn, addr = s.accept()
print("Connected by", addr)
while True:
    data = conn.recv(1024)
    if not data:
        break
    conn.sendall(data)
conn.close()
