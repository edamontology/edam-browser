#!/bin/bash

mkdir -p css
mkdir -p d3
mkdir -p js

if [ ! -e env.sh ]; then
    echo "#!/usr/bin/env bash
export BIOSPHERE_HOME=/tmp/biosphere" > env.sh
    echo "Please adjust env.sh"
    exit 0
fi
source ./env.sh

if [ ! -e $BIOSPHERE_HOME ]; then
    echo "source project not found, aborting"
    exit 1
fi

cp $BIOSPHERE_HOME/edam/static/css/tree-edam-stand-alone.css  ./css/
cp $BIOSPHERE_HOME/edam/static/css/tree-d3js.css              ./css/
cp $BIOSPHERE_HOME/misc/static/css/bootstrap.xl.css           ./css/
#cp $BIOSPHERE_HOME/edam/static/js/tree-d3js.js                ./js/
cp $BIOSPHERE_HOME/edam/static/js/tree-edam.js                ./js/
cp $BIOSPHERE_HOME/rainbio2/static/d3/d3.js                   ./d3/
cp $BIOSPHERE_HOME/rainbio2/static/d3/d3.layout.js            ./d3/


wget http://0.0.0.0:8020/edamontology/browser/stand_alone/ -O - -o /dev/null | \
      sed  "s/[ \t]*$//" | \
      grep -v "<!--" | \
      grep -v "jsi18n" | \
      sed "s/\/cloudweb_static\///g" | \
      grep -ve "^$" | \
      sed "s/js\/jquery-2.1.4.min.js/http:\/\/ajax.googleapis.com\/ajax\/libs\/jquery\/2.1.4\/jquery.min.js/g" | \
      sed "s/js\/jquery-ui.min.js/http:\/\/ajax.googleapis.com\/ajax\/libs\/jqueryui\/1.11.4\/jquery-ui.min.js/g" | \
      sed "s/css\/jquery-ui.min.css/https:\/\/ajax.googleapis.com\/ajax\/libs\/jqueryui\/1.12.1\/themes\/smoothness\/jquery-ui.css/g" | \
      sed -e '/debug_toolbar/,$d' > \
  index.html
echo -n "        </div>
    </body>
</html>" >> index.html


cat $BIOSPHERE_HOME/edam/edam_stand_alone_importer.py | \
      sed -e '/__main__/,$d' | \
      sed "s/\/cloudweb_media/media/g" > edam_stand_alone_importer.py

cat $BIOSPHERE_HOME/edam/static/js/tree-edam-stand-alone.js | \
      sed "s/\/cloudweb_media/media/g" > ./js/tree-edam-stand-alone.js

cat $BIOSPHERE_HOME/edam/static/js/tree-d3js.js | \
      grep -v "glyphicon glyphicon-link" > ./js/tree-d3js.js

echo "importation ok"
git status
