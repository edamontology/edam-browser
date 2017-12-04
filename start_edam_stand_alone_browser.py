#!/usr/bin/env python
from edam_stand_alone_importer import *

import os
import SimpleHTTPServer
import SocketServer

if __name__ == '__main__':
    target_directory = './media/'
    if not os.path.exists(target_directory):
        os.makedirs(target_directory)
    if len(os.listdir(target_directory)) == 0:
        convert_tsv_for_edam_browser(target_directory = target_directory)

    PORT = 20080

    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

    httpd = SocketServer.TCPServer(("", PORT), Handler)

    print ("serving at http://0.0.0.0:%i" % PORT)
    httpd.serve_forever()
