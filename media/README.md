```
virtualenv .venv -p python3
source .venv/bin/activate
pip install git+https://github.com/edamontology/edam2json.git
wget http://edamontology.org/EDAM.owl -O EDAM.owl
edam2json EDAM.owl biotools --extended --minified --output edam_extended.biotools.min.json
export VERSION=$(python -c 'import json; print(json.load(open("edam_extended.biotools.min.json"))["meta"]["version"])')
mv EDAM.owl  EDAM.$VERSION.owl 
cp edam_extended.biotools.json edam_extended_$VERSION.biotools.json
```
