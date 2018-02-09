var browser;

function fill_form(identifier, parent, branch){
    tree_file = getTreeFile(branch);
    build_autocomplete_from_edam_browser(browser);
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
        if(target.duplicate){
            parents={};
            parents[target.parent.data.uri]=target.parent;
            $.each(target.duplicate,function(id,clone){
                parents[clone.parent.data.uri]=clone.parent;
            })
            parents=$.map(parents, function(value, key) { return value });
        }else{
            parents=[target.parent];
        }

        $(".search-term[name=parent-0]").attr('data-initial',parents[0].data.uri);
        $(".search-term[name=parent-0]").attr('data-selected',parents[0].data.uri);
        $(".search-term[name=parent-0]").val(parents[0].text);
        for(var i=1;i<parents.length;i++){
            /*$(".search-term[name=parent-0]")
                .clone().attr("name","parent-"+i)
                .insertBefore($(".search-term[name=parent-0]").parent().children("button"));
            $(".search-term[name=parent-"+i+"]")
                .val(parents[i].text)
                .attr('data-initial',parents[i].data.uri);
            $(".search-term[name=parent-"+i+"]")
                .val(parents[i].text)
                .attr('data-selected',parents[i].data.uri);
//            build_autocomplete(
//                getTreeFile(getCookie("edam_browser_branch","topic")),
            build_autocomplete_from_edam_browser(browser,
                ".search-term[name=parent-"+i+"]"
            );*/
            addTermField("#parent_container","parent",parents[i]);
        }
        for(var i=0;i<(target.has_topic||[]).length;i++){
            addTermField("#has_topic_container","has_topic",browser.interactive_tree.cmd.getElementByIdentifier(target.has_topic[i]));
        }
        for(var i=0;i<(target.is_format_of||[]).length;i++){
            addTermField("#is_format_of_container","is_format_of",browser.interactive_tree.cmd.getElementByIdentifier(target.is_format_of[i]));
        }
        for(var i=0;i<(target.has_input||[]).length;i++){
            addTermField("#has_input_container","has_input",browser.interactive_tree.cmd.getElementByIdentifier(target.has_input[i]));
        }
        for(var i=0;i<(target.has_output||[]).length;i++){
            addTermField("#has_output_container","has_output",browser.interactive_tree.cmd.getElementByIdentifier(target.has_output[i]));
        }
    }else{
        $(".search-term").val(parentOfNewTerm.text);
    }
    $("form [disabled=disabled]").attr("disabled", false);
}
function join_if_exists(tab){
    if (typeof tab == "undefined"){
        return "";
    }
    return tab.join('; ');
}
function addTermField(container, kind, initial_term){
    var i = $(container).find(".search-term").length;
    $(".search-term[name=parent-0]")
        .clone()
        .attr("name",kind+"-"+i)
        .insertBefore($(container).children("button"));

    $(".search-term[name="+kind+"-"+i+"]")
                .val(initial_term?initial_term.text:"")
                .attr('data-initial',initial_term?initial_term.data.uri:"");
//    build_autocomplete(
//        getTreeFile(getCookie("edam_browser_branch","topic")),
    build_autocomplete_from_edam_browser(browser,
        ".search-term[name="+kind+"-"+i+"]"
    );
}

uri = "";
parent_uri=null;

window.onload = function() {
    var identifier=getUrlParameter('term');
    var branch=getUrlParameter('branch');
    if(identifier){
        $('#pageTitle .new').hide();
    }else{
        $('#pageTitle .change').hide();
    }
    $('#pageTitle .branch').text(branch);
    browser = fake_interactive_edam_browser();
    browser.interactive_tree.loadingDoneHandler(function(){
        fill_form(identifier, getUrlParameter('parent'), branch);
    });
    browser.current_branch( getUrlParameter('branch'));
}

function sendToGitHub(){
    var ids=["#id_parent", "#id_label", "#id_definition", "#id_exactSynonyms", "#id_narrowSynonyms"];
    for (var i=0;i<$(".search-term").length;i++){
        ids.push(".search-term[name=parent-"+i+"]");
    }
    msg="";
    msg+="[//]: # (You can add comment regarding your issue hereafter)\n";
    if ($("#id_github_comments").val()){
        msg+="### Comments\n";
    }
    msg+=$("#id_github_comments").val();
    msg+="\n\n";
    msg+="[//]: # (End of issue comments)\n";
    msg+="### Hereafter are the initial version et proposed modification of attributes of the given term\n";
    for(var i =0;i<ids.length;i++){
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
