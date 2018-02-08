var browser;

function fill_form(identifier, parent, branch){
    tree_file = getTreeFile(branch);
    //build_autocomplete(tree_file);
    build_autocomplete_from_edam_browser(browser);
    if(identifier){
        $('#pageTitle .new').hide();
    }else{
        $('#pageTitle .change').hide();
    }
    $('#pageTitle .branch').text(branch);
    $.ajax({
        dataType: "json",
        url: tree_file,
        data: {},
        success: function(d){
            uri = "http://edamontology.org/" + identifier;
            parent_uri = "http://edamontology.org/" + parent;
            var stack=[];
            var target;
            stack.push(d);
            var all_elements={}
            all_elements[d.data.uri]=d.text;
            do{
                head = stack.pop();
                var children = head.children;
                head.children=null;
                if (typeof children != "undefined"){
                    for(var i =0; i<children.length;i++){
                        stack.push(children[i]);
                        if (typeof all_elements[children[i].data.uri] == "undefined"){
                            all_elements[children[i].data.uri]=children[i];
                            children[i].parent=[]
                        }else{
                            children[i] = all_elements[children[i].data.uri];
                        }
                        children[i].parent.push(head);
                    }
                }
            } while (stack.length>0);
            build_form(all_elements[uri], all_elements);
        },
        error:function (textStatus, xhr) {
            console.error(textStatus);
            console.error(xhr);
            callback(-1,[],textStatus);
        },
    });
}

function build_form(target, all_elements){
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
            v.push(target.parent[i].data.uri);
        }
        v=v.join("|");*/
        $(".search-term[name=parent-0]").attr('data-initial',target.parent[0].data.uri);
        $(".search-term[name=parent-0]").attr('data-selected',target.parent[0].data.uri);
        $(".search-term[name=parent-0]").val(target.parent[0].text);
        for(var i=1;i<target.parent.length;i++){
            $(".search-term[name=parent-0]")
                .clone().attr("name","parent-"+i)
                .insertBefore($(".search-term[name=parent-0]").parent().children("button"));
            $(".search-term[name=parent-"+i+"]")
                .val(target.parent[i].text)
                .attr('data-initial',target.parent[i].data.uri);
            $(".search-term[name=parent-"+i+"]")
                .val(target.parent[i].text)
                .attr('data-selected',target.parent[i].data.uri);
//            build_autocomplete(
//                getTreeFile(getCookie("edam_browser_branch","topic")),
            build_autocomplete_from_edam_browser(browser,
                ".search-term[name=parent-"+i+"]"
            );
        }
    }else{
        $(".search-term").val(all_elements[parent_uri].text);
    }
    $("form [disabled=disabled]").attr("disabled", false);
}
function join_if_exists(tab){
    if (typeof tab == "undefined"){
        return "";
    }
    return tab.join('; ');
}
function addParent(){
    var i = $(".search-term").length;
    $(".search-term[name=parent-0]")
        .clone()
        .attr("name","parent-"+i)
        .insertBefore($(".search-term[name=parent-0]").parent().children("button"));
    $(".search-term[name=parent-"+i+"]")
                .val("")
                .attr('data-initial',"");
//    build_autocomplete(
//        getTreeFile(getCookie("edam_browser_branch","topic")),
    build_autocomplete_from_edam_browser(browser,
        ".search-term[name=parent-"+i+"]"
    );
}

uri = "";
parent_uri=null;

window.onload = function() {
    browser = fake_interactive_edam_browser().current_branch( getUrlParameter('branch'));
    fill_form(getUrlParameter('term'), getUrlParameter('parent'), getUrlParameter('branch'));
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
