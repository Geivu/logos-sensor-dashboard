#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
from urllib.parse import urlparse

# Configuration
PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))  # Current directory

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def get_ip():
    """Try to get the local IP address"""
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    
    # Allow reuse of address to avoid "Address already in use" errors
    socketserver.TCPServer.allow_reuse_address = True
    
    # Create the server with the Handler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        local_ip = get_ip()
        
        print(f"\n{'=' * 60}")
        print(f"Smart Environment Dashboard Server")
        print(f"{'=' * 60}")
        print(f"Server started at:")
        print(f"  • Local:   http://localhost:{PORT}")
        print(f"  • Network: http://{local_ip}:{PORT}")
        print(f"{'=' * 60}")
        print("Press Ctrl+C to stop the server")
        
        # Open browser automatically
        webbrowser.open(f"http://localhost:{PORT}")
        
        try:
            # Start the server
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.server_close()
            print("Server stopped.") 