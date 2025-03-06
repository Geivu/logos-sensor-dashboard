#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
from urllib.parse import urlparse
import threading
import time
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import websockets
import asyncio
import socket
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import mimetypes

# Configuration
PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))  # Current directory
WS_PORT = 8765

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Store connected WebSocket clients
connected_clients = set()

class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, broadcast_callback):
        self.broadcast_callback = broadcast_callback

    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith(('.html', '.css', '.js')):
            logger.info(f"File changed: {event.src_path}")
            self.broadcast_callback({
                'type': 'reload',
                'file': os.path.basename(event.src_path)
            })

async def handle_websocket(websocket, path):
    connected_clients.add(websocket)
    logger.info("WebSocket connection established")
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                if data.get('type') == 'theme':
                    await broadcast_message(message)
                elif data.get('type') == 'ping':
                    await websocket.send(json.dumps({'type': 'pong'}))
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
    except websockets.exceptions.ConnectionClosed:
        logger.info("WebSocket connection closed unexpectedly")
    finally:
        connected_clients.remove(websocket)
        logger.info("WebSocket connection closed")

async def broadcast_message(message):
    if connected_clients:
        dead_clients = set()
        for client in connected_clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                dead_clients.add(client)
        connected_clients.difference_update(dead_clients)

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data.decode('utf-8'))
            if data.get('type') == 'theme':
                with open(os.path.join(DIRECTORY, 'theme.json'), 'w') as f:
                    json.dump(data, f)
                self.send_response(200)
                self.end_headers()
                return
        except json.JSONDecodeError:
            logger.error("Invalid JSON in POST request")
        self.send_response(400)
        self.end_headers()

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "127.0.0.1"

async def start_websocket_server():
    """Run WebSocket server"""
    server = await websockets.serve(
        handle_websocket,
        'localhost',
        WS_PORT,
        ping_interval=20,
        ping_timeout=10
    )
    await server.wait_closed()

def run_websocket_server():
    """Run WebSocket server in a separate thread"""
    asyncio.run(start_websocket_server())

def start_file_watcher():
    """Start file system watcher"""
    event_handler = FileChangeHandler(lambda msg: asyncio.run(broadcast_message(json.dumps(msg))))
    observer = Observer()
    observer.schedule(event_handler, DIRECTORY, recursive=True)
    observer.start()
    logger.info("File watcher started")
    return observer

def start_server():
    local_ip = get_local_ip()
    
    # Create server with custom handler
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        logger.info(f"\nServer started at:")
        logger.info(f"Local: http://localhost:{PORT}")
        logger.info(f"Network: http://{local_ip}:{PORT}")
        logger.info("\nAvailable pages:")
        logger.info(f"- Status List: http://{local_ip}:{PORT}/status_list.html")
        logger.info(f"- Dashboard: http://{local_ip}:{PORT}/index.html")
        logger.info("\nPress Ctrl+C to stop the server")
        
        # Open status list in default browser
        webbrowser.open(f'http://localhost:{PORT}/status_list.html')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            logger.info("\nServer stopped")
            httpd.shutdown()

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    
    # Allow reuse of address to avoid "Address already in use" errors
    socketserver.TCPServer.allow_reuse_address = True
    
    # Start WebSocket server in a separate thread
    ws_thread = threading.Thread(target=run_websocket_server, daemon=True)
    ws_thread.start()
    
    # Start file watcher
    observer = start_file_watcher()
    
    try:
        start_server()
    finally:
        observer.stop()
        observer.join() 