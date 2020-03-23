#!/bin/bash
xdg-open http://0.0.0.0:20080/ || echo "Couldn't open the web browser"
python3 -m http.server 20080