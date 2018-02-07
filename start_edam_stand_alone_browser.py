#!/usr/bin/env python
from edam_stand_alone_importer import *

import os
import SimpleHTTPServer
import SocketServer
import tarfile

if __name__ == '__main__':
    PORT = 20080

    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

    httpd = SocketServer.TCPServer(("", PORT), Handler)

    print ("serving at http://0.0.0.0:%i" % PORT)
    httpd.serve_forever()
