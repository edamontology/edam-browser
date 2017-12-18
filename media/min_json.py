#!/usr/bin/env python
import json
import os

for _, _, filenames in os.walk('.'):
    for filename in filenames:
        if filename.endswith(".json") and not filename.endswith("min.json"):
            data = json.load(open(filename))
            with open(filename[:-5] + '.min.json', 'w') as outfile:
                json.dump(data, outfile)
