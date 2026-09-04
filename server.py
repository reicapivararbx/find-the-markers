#!/usr/bin/env python3
"""Servidor de desenvolvimento sem cache (python3 server.py [porta])."""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    with ReusableTCPServer(("0.0.0.0", PORT), NoCacheHandler) as httpd:
        print(f"Find the Markers — http://localhost:{PORT}")
        httpd.serve_forever()
