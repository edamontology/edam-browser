import "../jquery-import"
import 'bootstrap'
import "jquery-ui-themes/themes/smoothness/jquery-ui.css"

import 'bootstrap/dist/css/bootstrap.css' 
import '@fortawesome/fontawesome-free/css/all.css'
import "../css/bootstrap.xl.css"

import '../css/autocomplete-edam-reusable.css'

import "../css/edam.css"
import "../css/dark-theme.css"	
import 'regenerator-runtime/runtime';
import 'jquery-ui-bundle'; 

import {getUrlParameter,getDarkMode} from "./utils.js"
import {fake_interactive_edam_browser,build_autocomplete_from_edam_browser} from "./autocomplete-edam-reusable.js"
var browser;

var typeDict={"has_topic_container":"topic","is_format_of_container":"data","has_input_container":"data","has_output_container":"data","is_identifier_of_container":"data"};

function fill_form(identifier, parent, branch){
    //not used, won't be used after loading from cache
    //let tree_file = getTreeFile(branch);
    build_autocomplete_from_edam_browser(browser,undefined,typeDict);
    browser.interactive_tree.cmd.getElementByIdentifier(identifier);
    build_form(
        browser.interactive_tree.cmd.getElementByIdentifier(identifier),
        browser.interactive_tree.cmd.getElementByIdentifier(parent)
    );
}

function build_form(target, parentOfNewTerm){
    var v;
    if (target){
        $("#id_label").val(v=target.text);
        $("#id_label").attr('data-initial',v);
        $("#id_definition").val(v=target.definition);
        $("#id_definition").attr('data-initial',v);
        $("#id_exactSynonyms").val(v=join_if_exists(target.exact_synonyms));
        $("#id_exactSynonyms").attr('data-initial',v);
        $("#id_narrowSynonyms").val(v=join_if_exists(target.narrow_synonyms));
        $("#id_narrowSynonyms").attr('data-initial',v);
        /*v=[];
        for(var i=0;i<target.parent.length;i++){
            v.push(target.parents[i].data.uri);
        }
        v=v.join("|");*/

        var parents;
        var i;
        if(target.duplicate){
            parents={};
            parents[target.parent.data.uri]=target.parent;
            $.each(target.duplicate,function(id,clone){
                parents[clone.parent.data.uri]=clone.parent;
            });
            parents=$.map(parents, function(value, key) { return value; });
        }else{
            parents=[target.parent];
        }

        $(".search-term[name=parent-0]").attr('data-initial',parents[0].data.uri);
        $(".search-term[name=parent-0]").attr('data-selected',parents[0].data.uri);
        $(".search-term[name=parent-0]").val(parents[0].text);
        for(i=1;i<parents.length;i++){
            addTermField("#parent_container","parent",parents[i]);
        }
        for(i=0;i<(target.has_topic||[]).length;i++){
            addTermField("#has_topic_container","has_topic",browser.interactive_tree.cmd.getElementByIdentifier(target.has_topic[i]));
        }
        for(i=0;i<(target.is_format_of||[]).length;i++){
            addTermField("#is_format_of_container","is_format_of",browser.interactive_tree.cmd.getElementByIdentifier(target.is_format_of[i]));
        }
        for(i=0;i<(target.has_input||[]).length;i++){
            addTermField("#has_input_container","has_input",browser.interactive_tree.cmd.getElementByIdentifier(target.has_input[i]));
        }
        for(i=0;i<(target.has_output||[]).length;i++){
            addTermField("#has_output_container","has_output",browser.interactive_tree.cmd.getElementByIdentifier(target.has_output[i]));
        }
        for(i=0;i<(target.is_identifier_of||[]).length;i++){
            addTermField("#is_identifier_of_container","is_identifier_of",browser.interactive_tree.cmd.getElementByIdentifier(target.is_identifier_of[i]));
        }
    }else{
        $(".search-term").val(parentOfNewTerm.text);
    }
    // toggle per-branch attributs
    var s_branch = getUrlParameter('term') || getUrlParameter('parent');
    s_branch = s_branch.substring(s_branch.lastIndexOf('/') + 1, s_branch.lastIndexOf('_'));
    if(is_descendant_of_or_is(target || parentOfNewTerm,"http://edamontology.org/data_0842")){
        s_branch="identifier";
    }
    $('.optional_rel').hide();
    $('.' + s_branch + '_rel').show();
    // unlock form
    $("form [disabled=disabled]").attr("disabled", false);
}
function is_descendant_of_or_is(node, ancestor_identifier){
    if (browser.identifierAccessor(node)===ancestor_identifier)
        return true;
    if (browser.identifierAccessor(node)==="owl:Thing")
        return false;
    return is_descendant_of_or_is(node.parent, ancestor_identifier);
}
function join_if_exists(tab){
    if (typeof tab == "undefined"){
        return "";
    }
    if(!Array.isArray(tab))
        return tab
    return tab.join('; ');
}
window.addTermField=function addTermField(container, kind, initial_term){
    var i = $(container).find(".search-term").length;
    $(".search-term[name=parent-0]")
        .clone()
        .attr("name",kind+"-"+i)
        .insertBefore($(container).children("button"));

    $(".search-term[name="+kind+"-"+i+"]")
                .val(initial_term?initial_term.text:"")
                .attr('data-initial',initial_term?initial_term.data.uri:"")
                .attr("data-selected",initial_term?initial_term.data.uri:"");
//    build_autocomplete(
//        getTreeFile(getCookie("edam_browser_branch","topic")),
    build_autocomplete_from_edam_browser(browser,
        ".search-term[name="+kind+"-"+i+"]",typeDict
    );
}

let uri = "";
let parent_uri=null;

window.onload = function() {
    getDarkMode();
    uri=getUrlParameter('term');
    var branch=getUrlParameter('branch');
    if(uri){
        $('#pageTitle .new').hide();
    }else{
        $('#pageTitle .change').hide();
    }
    var sub_branch = getUrlParameter('term')+getUrlParameter('parent');
    sub_branch = sub_branch.substring(sub_branch.lastIndexOf('/')+1, sub_branch.lastIndexOf('_'));
    $('#pageTitle .branch').text(sub_branch);
    typeDict.parent_container=sub_branch;
    browser = fake_interactive_edam_browser();
    browser.interactive_tree.loadingDoneHandler(function(){
        fill_form(uri, getUrlParameter('parent'), branch);
    });
    browser.current_branch( getUrlParameter('branch'));
};

window.sendToGitHub=function sendToGitHub(){
    var ids=["#id_parent", "#id_label", "#id_definition", "#id_exactSynonyms", "#id_narrowSynonyms"];
    var i;
    $(".search-term").each(function(){
        ids.push(".search-term[name="+this.getAttribute("name")+"]");
    })
    let msg="";
    msg+="[//]: # (You can add comment regarding your issue hereafter)\n";
    if ($("#id_github_comments").val()){
        msg+="### Comments\n";
    }
    msg+=$("#id_github_comments").val();
    msg+="\n\n";
    msg+="[//]: # (End of issue comments)\n";
    msg+="### Hereafter are the initial version and proposed modification of attributes of the given term\n";
    for(i =0;i<ids.length;i++){
        var val = ($(ids[i]).attr('data-selected') || $(ids[i]).val());
        if(val!=$(ids[i]).attr('data-initial')){
            msg+="\n";
            msg+="| key | value |\n";
            msg+="| --- | --- |\n";
            msg+="| Attr  | **"+$(ids[i]).attr('name')+"** |\n";
            msg+="| Old | "+$(ids[i]).attr('data-initial')+" |\n";
            msg+="| New | "+val+" |\n";
            msg+="|  |  |\n";
            msg+="\n";
        }
    }
    if($('#pageTitle .new:visible').length>0){
        $("#sender [name=title]").val("[Edam Browser User] New child proposition for " + $("#id_parent").val());
    }else{
        $("#sender [name=title]").val("[Edam Browser User] Change proposition for " + uri);
    }
    $("#sender [name=body]").val(msg);
    $("#sender").submit();
}

export {typeDict}