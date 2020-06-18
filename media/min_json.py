#!/usr/bin/env python
import json
import os

for filename in os.listdir('.'):
    print(filename)
    if filename.endswith(".json") and not filename.endswith("min.json"):
        data = json.load(open(filename))
        with open(filename[:-5] + '.min.json', 'w') as outfile:
            json.dump(data, outfile)
