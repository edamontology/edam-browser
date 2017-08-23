from edam_stand_alone_importer import *

import os
import SimpleHTTPServer
import SocketServer

if __name__ == '__main__':
    directory = './media/'
    if not os.path.exists(directory):
        os.makedirs(directory)
    if len(os.listdir(directory)) == 0:
        convert_tsv_for_edam_browser(target_file = directory+"edam_browser_tree.json")

    PORT = 20080

    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

    httpd = SocketServer.TCPServer(("", PORT), Handler)

    print ("serving at http://0.0.0.0:%i" % PORT)
    httpd.serve_forever()
