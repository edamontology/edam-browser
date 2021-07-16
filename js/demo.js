import "../jquey-import.js"

import "jquery-ui-themes/themes/smoothness/jquery-ui.css"
import 'jquery-ui-bundle'; 
import 'bootstrap'

import 'bootstrap/dist/css/bootstrap.css' 
import "../css/tree-reusable-d3.css"

import 'regenerator-runtime/runtime';
import * as d3 from 'd3';

import {interactive_tree} from "./tree-reusable-d3.js"
import gtag, { install } from 'ga-gtag';


var my_tree;
function demo() {
  let delay = 0;
  let step = 2500;
  delay += step;
  setTimeout(function () {
    my_tree.cmd.selectElement("http://edamontology.org/topic_3174", true);
    $("#simple-pre").append(
      $(
        '<p>Add Metagenomics:</p><pre>my_tree.cmd.selectElement("http://edamontology.org/topic_3174",true);</pre>'
      )
    );
    $("#simple-pre")
      .stop()
      .animate({ scrollTop: $("#simple-pre")[0].scrollHeight }, 800);
  }, delay);
  delay += step;
  setTimeout(function () {
    my_tree.cmd.selectElement("http://edamontology.org/topic_0091", false);
    $("#simple-pre").append(
      $(
        '<p>Remove Bioinformatics:</p><pre>my_tree.cmd.selectElement("http://edamontology.org/topic_0091",false);</pre>'
      )
    );
    $("#simple-pre")
      .stop()
      .animate({ scrollTop: $("#simple-pre")[0].scrollHeight }, 800);
  }, delay);
  delay += step;
  setTimeout(function () {
    my_tree.cmd.expandElement("http://edamontology.org/topic_3065");
    $("#simple-pre").append(
      $(
        '<p>Expand to Embriology:</p><pre>my_tree.cmd.expandElement("http://edamontology.org/topic_3065");</pre>'
      )
    );
    $("#simple-pre")
      .stop()
      .animate({ scrollTop: $("#simple-pre")[0].scrollHeight }, 800);
  }, delay);
  delay += step;
  setTimeout(function () {
    my_tree.cmd.selectElement("http://edamontology.org/topic_3174", false);
    $("#simple-pre").append(
      $(
        '<p>Remove Metagenomics:</p><pre>my_tree.cmd.selectElement("http://edamontology.org/topic_3174",false);</pre>'
      )
    );
    $("#simple-pre")
      .stop()
      .animate({ scrollTop: $("#simple-pre")[0].scrollHeight }, 800);
  }, delay);
  delay += step;
  setTimeout(function () {
    my_tree.cmd.selectElement("http://edamontology.org/topic_3401", true);
    $("#simple-pre").append(
      $(
        '<p>Add Pain medecine:</p><pre>my_tree.cmd.selectElement("http://edamontology.org/topic_3401",true);</pre>'
      )
    );
    $("#simple-pre")
      .stop()
      .animate({ scrollTop: $("#simple-pre")[0].scrollHeight }, 800);
  }, delay);
  delay += step;
  setTimeout(function () {
    my_tree.cmd.collapseNotSelectedElement();
    $("#simple-pre").append(
      $(
        "<p>Collapse not selected node:</p><pre>my_tree.cmd.collapseNotSelectedElement();</pre>"
      )
    );
    $("#simple-pre")
      .stop()
      .animate({ scrollTop: $("#simple-pre")[0].scrollHeight }, 800);
  }, delay);
  setTimeout(function () {
    my_tree.cmd.collapseElement("http://edamontology.org/topic_3303");
    $("#simple-pre").append(
      $(
        '<p>Collapse Medecine:</p><pre>my_tree.cmd.collapseElement("http://edamontology.org/topic_3303");</pre>'
      )
    );
    $("#simple-pre")
      .stop()
      .animate({ scrollTop: $("#simple-pre")[0].scrollHeight }, 800);
  }, delay);
  delay += step;
  setTimeout(function () {
    my_tree.cmd.selectElement(
      "http://edamontology.org/topic_3065",
      true,
      false
    );
    $("#simple-pre").append(
      $(
        '<p>Add Embriology without expanding to it:</p><pre>my_tree.cmd.selectElement("http://edamontology.org/topic_3065",true,false);</pre>'
      )
    );
    $("#simple-pre")
      .stop()
      .animate({ scrollTop: $("#simple-pre")[0].scrollHeight }, 800);
  }, delay);
  delay += step;
  setTimeout(function () {
    my_tree.cmd.expandSelectedElement();
    $("#simple-pre").append(
      $(
        "<p>Expand to selected elements:</p><pre>my_tree.cmd.expandSelectedElement();</pre>"
      )
    );
    $("#simple-pre")
      .stop()
      .animate({ scrollTop: $("#simple-pre")[0].scrollHeight }, 800);
  }, delay);
  delay += step;
}
window.onload = function () {
    configGtag();
  my_tree = interactive_tree()
    .identifierAccessor(function (d) {
      return d.data.data.uri;
    })
    .debug(true)
    .duration(1000)
    .tooltipEnabled(true)
    .initiallySelectedElementHandler(function (d) {
      return d.data.data.uri === "http://edamontology.org/topic_0091";
    })
    .openElementHandler(function (d) {
      alert(d.data.data.uri);
    })
    .loadingDoneHandler(demo);
  d3.select("#tree").call(my_tree); // draw chart in div
  my_tree.data_url("media/edam_extended.biotools.min.json");
  $("#simple-pre").append(
    $(`<p>Starting from this minimal working example: </p><pre>
&lt;!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"&gt;
&lt;html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en"&gt;
&lt;head&gt;
    &lt;script src="https://code.jquery.com/jquery-3.2.1.min.js"&gt;&lt;/script&gt;
    &lt;script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"&gt;&lt;/script&gt;
    &lt;script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.13.0/d3.min.js"&gt;&lt;/script&gt;
    &lt;script src="js/tree-reusable-d3.js"&gt;&lt;/script&gt;
    &lt;link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"/&gt;
    &lt;link href="css/tree-reusable-d3.css" rel="stylesheet"&gt;
    &lt;script type="text/javascript"&gt;
        var my_tree;
        window.onload = function() {
            my_tree = interactive_tree()
                //overriding as the identifier by default consider d.data.id
                .identifierAccessor(function(d){return d.data.data.uri;})
                .debug(true)
                .duration(1000)
                .tooltipEnabled(true)
                //at first Bioinformatics should be selected
                .initiallySelectedElementHandler(function(d){
                    return d.data.data.uri==="http://edamontology.org/topic_0091"
                })
                //Show a JS alert when you ctrl-click on a node
                .openElementHandler(function(d){
                    alert("Ctrl-clicked (Open action) on "+d.data.data.uri);
                })
            ;
            // pre-draw/build chart in div
            d3.select("#tree").call(my_tree);
            //indicated where the data can be found
            my_tree.data_url("media/edam_extended.biotools.min.json");
        }
    &lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;div id="tree" style="height:99vh"&gt;&lt;/div&gt;
&lt;/body&gt;</pre>`)
  );
};

const configGtag =function(){
    install('UA-115521967-1');    
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-115521967-1');
}