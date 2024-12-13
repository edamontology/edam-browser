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

const customRe = new RegExp("^(http|https)://", "i");

var browser = interactive_edam_browser();
//enabling access from html to the browser variable
window.browser=browser;

window.onload =  function (){

    configGtag();
    getDarkMode();
    var id,branch,version;
    var $inputs = $('#id_file,#id_url');
    $inputs.on('input', function () {
        $inputs.not(this).prop('disabled', $(this).val().length);
    }).on('change', function () {
        $inputs.not(this).prop('disabled', $(this).val().length);
    });
    if(typeof getUrlParameter("url") != "undefined"){
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
                id=("http://edamontology.org/"+id).replace("http://edamontology.org/http://edamontology.org/","http://edamontology.org/");
            }
            setCookie("edam_browser_"+branch,id);
        }
    }else if(window.location.hash) {
        let hash=window.location.hash.substring(1);
        let pos = hash.lastIndexOf('&');
        if (pos!=-1){
        id=hash.substring(0,hash.indexOf('&'))
        id=("http://edamontology.org/"+id).replace("http://edamontology.org/http://edamontology.org/","http://edamontology.org/");
        var params = hash.split('&').reduce(function (res, item) {
                var parts = item.split('=');
                res[parts[0]] = parts[1];
                return res;
            }, {});
        
            branch=params['branch'];
            version=params['version'];
            if(!branch)
                branch="edam"
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
    if(!version){
        version='stable';
    }
    d3.select("#tree").call(browser.interactive_tree()); // draw chart in div
    if(branch=="custom_file"){
        browser.cmd.selectCustom();
    }else if(branch=="custom_url"){
        browser.cmd.loadCustom();
    }else{
        browser.current_branch(branch,version);
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

    window.triggerVersion = function (){
        $("#versionModal").modal('show');
    }
};

const configGtag = function(){
    install('UA-115521967-1');    
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-115521967-1');

};

const updateVersion=function(version){
    const versionDict={
        "custom":6,
        "latest":0,
        "stable":1,
        "1.24":2,
        "1.23":3,
        "bioimaging":4,
        "geo":5,
    };
    let index;
    if(customRe.test(version))
        index=versionDict["custom"];
    else if (version=="undefined")
        index=versionDict["stable"];
    else 
        index=versionDict[version]
    var text = $(".version-group .dropdown-menu li a")[index]?.innerText
    $('.version-title').html(text)
}


const updateBranch=function(branch){
    const branchDict={"edam":0,"data":1,"format":2,"operation":3,"topic":4,"deprecated":5,"edam_w_deprecated":6};
    let index;
    if (version=="undefined")
        index=branchDict["edam"];
    else 
        index=branchDict[branch]
    var text = $(".branch-group .dropdown-menu li a")[index]?.innerText
    $('.branch-title').html(text)
}

export {updateBranch,updateVersion}