```
virtualenv .venv -p python3
pip install git+https://github.com/edamontology/edam2json.git
wget http://edamontology.org/EDAM.owl
edam2json EDAM_1.24.owl biotools  --extended > edam_extended.biotools.json  
./min_json.py 
```
