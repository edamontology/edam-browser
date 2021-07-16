import "../jquery-import.js"

import "popper.js"
import "jquery-ui-themes/themes/smoothness/jquery-ui.css"
import 'jquery-ui-bundle'; 
import 'bootstrap'

import 'bootstrap/dist/css/bootstrap.css' 
import '@fortawesome/fontawesome-free/css/all.css'
import "../css/bootstrap.xl.css"
import "../css/tree-reusable-d3.css"
import '../css/autocomplete-edam-reusable.css'
import "../css/index.css" 
import "../css/edam.css"
import "../css/dark-theme.css"	

import 'regenerator-runtime/runtime';
import * as d3 from 'd3';

import {interactive_tree} from "./tree-reusable-d3.js"

import gtag, { install } from 'ga-gtag';


window.interactive_tree = interactive_tree;

import {getUrlParameter,setCookie,getCookie,setUrlParameters,getDarkMode} from "./utils.js"
import {getInitURI,interactive_edam_browser} from "./tree-edam-stand-alone.js"

var browser = interactive_edam_browser();
//enabling access from html to the browser variable
window.browser=browser;

window.onload =  function (){
    configGtag();
    getDarkMode();
    var id;
    var $inputs = $('#id_file,#id_url');
    $inputs.on('input', function () {
        $inputs.not(this).prop('disabled', $(this).val().length);
    }).on('change', function () {
        $inputs.not(this).prop('disabled', $(this).val().length);
    });
    let branch
    if(typeof getUrlParameter("url") != "undefined"){
        branch="custom_url";
        setCookie("edam_browser_branch",branch);
        setCookie("edam_browser_custom_loaded_url", getUrlParameter("url"));
        setCookie("edam_browser_custom_identifier_accessor", getUrlParameter("identifier_accessor"));
        setCookie("edam_browser_custom_text_accessor", getUrlParameter("text_accessor"));
        $("[name=identifier_accessor][value='"+getCookie("edam_browser_custom_identifier_accessor","")+"']").prop("checked",true);
        $("#id_url").val(getUrlParameter("url"));
        $("#id_url").change();
        $("[name=text_accessor][value='"+getCookie("edam_browser_custom_text_accessor","")+"']").prop("checked",true);
        console.log(window.location.hash)
        if(window.location.hash) {
            let id = window.location.hash.substring(1);
            let pos = id.lastIndexOf('&');
            if (pos!=-1){
                id=id.substring(0,pos);
            }
            setCookie("edam_browser_"+branch,id);
        }
    }else if(window.location.hash) {
        let hash=window.location.hash.substring(1);
        let pos = hash.lastIndexOf('&');
        if (pos!=-1){
            id=hash.substring(0,pos);
            branch=hash.substring(pos+1);
        }else{
            //only home-EDAM arrives here, so ok to work with edam
            //id=branch;
            //branch=branch.substring(branch.lastIndexOf('/')+1,branch.lastIndexOf('_'));
            id=("http://edamontology.org/"+hash).replace("http://edamontology.org/http://edamontology.org/","http://edamontology.org/");
            branch="edam";
        }
        if(id==="")
            id=getInitURI(branch);
        setCookie("edam_browser_branch",branch);
        setCookie("edam_browser_"+branch,id);
    }else{
        branch=getCookie("edam_browser_branch","edam");
        if (branch=="custom_url"){
            //if branch is custom we simulate the form to be filled, and submitted.
            $("[name=identifier_accessor][value='"+getCookie("edam_browser_custom_identifier_accessor","")+"']").prop("checked",true);
            $("[name=text_accessor][value='"+getCookie("edam_browser_custom_text_accessor","")+"']").prop("checked",true);
            $("#id_url").val( getCookie("edam_browser_custom_loaded_url", ""));
            $inputs.change();
            setUrlParameters($("#custom_ontology_from").serialize());
        }
    }
    d3.select("#tree").call(browser.interactive_tree()); // draw chart in div
    if(branch=="custom_file"){
        browser.cmd.selectCustom();
    }else if(branch=="custom_url"){
        browser.cmd.loadCustom();
    }else{
        browser.current_branch(branch);
    }
    var treeElement = document.getElementById("tree-and-controls");
    treeElement.style.height = localStorage.getItem("tree-and-controls-height");
    var resizer = document.getElementById("handle");
    resizer.addEventListener("mousedown", initDrag, false);
    var startY, startHeight;
    function initDrag(e) {
        startY = e.clientY;
        startHeight = parseInt(
        document.defaultView.getComputedStyle(treeElement).height,
        10
        );
        document.documentElement.addEventListener("mousemove", doDrag, false);
        document.documentElement.addEventListener("mouseup", stopDrag, false);
        document.getElementsByTagName("body")[0].classList.add("user-select-none");
    }
    function doDrag(e) {
        treeElement.style.height = startHeight + e.clientY - startY + "px";
    }
    function stopDrag(e) {
        document.documentElement.removeEventListener("mousemove", doDrag, false);
        document.documentElement.removeEventListener("mouseup", stopDrag, false);
        localStorage.setItem("tree-and-controls-height", treeElement.style.height);
        document.getElementsByTagName("body")[0].classList.remove("user-select-none");
    }
    $("#tree-settings").find("input").each(function( index ) {
        var $this=$(this);
        $this.prop("checked" , (localStorage.getItem($this.prop("name"))||$this.data("default")) == "true");
        if ($this.data("saved")!=="false"){
            $this.change(function(){
                localStorage.setItem($this.prop("name"), $this.prop('checked'));
            });
        }
    });
};

const configGtag = function(){
    install('UA-115521967-1');    
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-115521967-1');

};