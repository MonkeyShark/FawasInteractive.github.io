import os
import http.server
import socketserver

PORT = 8000

# Change the working directory to the current directory (optional)
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Set up the HTTP server
handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()