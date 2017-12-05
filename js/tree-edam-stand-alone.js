function makeTreeShortcut(branch) {
    $("#edam-branches .branch").removeClass("active");
    if (typeof branch == "undefined"){
        branch=getCookie("edam_browser_branch","topic");
    }
    $("#edam-branches .branch."+branch).addClass("active");
    setCookie("edam_browser_branch",branch);
    if (branch == "deprecated"){
        tree_file="media/deprecated_extended.biotools.json";
        initURI=[getCookie("edam_browser_"+branch,"owl:DeprecatedClass")];
    }else if(branch == "data"){
        tree_file="media/data_extended.biotools.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/data_1916")];
    }else if(branch == "format"){
        tree_file="media/format_extended.biotools.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/format_3464")];
    }else if(branch == "operation"){
        tree_file="media/operation_extended.biotools.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/operation_2451")];
    }else if(branch == "topic"){
        tree_file="media/topic_extended.biotools.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/topic_0091")];
    }
    current_branch=branch;
    root_uri=getRootURIForBranch(branch);
    window.location.hash = initURI[0].substring(initURI[0].lastIndexOf('/')+1) + (branch=="deprecated"?"&deprecated":"");
    makeEdamTree(initURI,
         $('#removeNodesWithNoSelectedDescendant:checked').length==1,
        tree_file,
        {
            "selectedElementHandler":standAloneSelectedElementHandler,
            "addingElementHandler":function (d){
                selectedURI=d.data.uri;
                if (loadingDone == 0) {
                    standAloneSelectedElementHandler(d,true);
                }
                return false;
            },
            "removingElementHandler":function (d){return false;},
        },
        {
            "use_tooltip":true,
            "file_url_as_response_of_url":false,
            "is_view":true
        }
    );
    build_autocomplete(tree_file);
}

function standAloneSelectedElementHandler (d, do_not_open){
    if (!do_not_open){
        if(selectedURI!=""){
            tree.removeByURI(selectedURI,false);
        }
        tree.openByURI(d.data.uri);
        setCookie("edam_browser_"+current_branch,d.data.uri);
    }
    selectedURI=d.data.uri;
    identifier = selectedURI.substring(selectedURI.lastIndexOf("/")+1);
    window.location.hash = identifier;
    $("#details-"+identifier).remove();
    details = $("<div class=\"panel panel-default\" id=\"details-"+identifier+"\">"+
        "<div class=\"panel-heading\">Details of term \"<span class=\"term-name-heading\"></span>\"</div>"+
        "<div class=\"panel-body\"><table></table></div>"+
        "</div>");
    details.find(".term-name-heading").text(d.text);
    var table = details.find("table").clone();
    table.children().remove();
    var table_parent = details.find("table").parent();
    [
        "text",
        "definition",
        "comment",
        "uri",
        "exact_synonyms",
        "narrow_synonyms",
    ].forEach(function(entry) {
        if("uri"==entry)
            append_row(table,"URI",d.data.uri);
        else
            append_row(table,entry,d[entry]);
    });
    table_parent.find("table").remove();
    table.appendTo(table_parent);
    /*
    $.ajax({
        type: "GET",
        url:"media/edam_browser/edam_browser_leaf."+identifier+".json",
        data: {},
        success: function (data, textStatus, xhr) {
            var table = details.find("table").clone();
            table.children().remove();
            var table_parent = details.find("table").parent();
            [
                "name",
                "parents_uri",
                "definition",
                "comment",
                "exact_synonyms",
                "narrow_synonyms",
                "related_synonyms",
                "broad_synonyms",
            ].forEach(function(entry) {
                append_row(table,entry,data[entry]);
                delete data[entry];
            });
            delete data['synonyms'];
            for (var key in data) {
                append_row(table,key,data[key]);
            }
            table_parent.find("table").remove();
            table.appendTo(table_parent);
        },
        error: function (textStatus, xhr) {
            console.err(textStatus);
            console.err(xhr);
        }
    });*/
    $("#edamAccordion").prepend(details);
    return false;
}

function interactive_edam_uri(value){
    if (value.startsWith("http://edamontology.org/")){
        return "<a href=\"#"+ value.substring(value.lastIndexOf('/')+1) + (branch=="deprecated"?"&deprecated":"")+"\" onclick=\"tree.removeByURI(selectedURI,false);selectedURI=this.text;tree.openByURI(selectedURI);\">"+value+"</a>";
    }
    return value;
}

function append_row(table,name,value){
    if (typeof value == "undefined"){
        value="";
    }
    name=name.replace("_","&nbsp;");
    name=name.charAt(0).toUpperCase()+name.substring(1);
    if (value.constructor === Array){
        if (value.length>1){
            value_txt="";
            for (i=0; i<value.length;i++){
                if (value[i] != ""){
                    value_txt = value_txt + "<li>"+interactive_edam_uri(value[i])+"</li>";
                }
            }
            value="<ul>"+value_txt+"</ul>";
        }else{
            value=interactive_edam_uri(value[0]);
        }
    }
    $("<tr><th>"+name+"</th><td>"+interactive_edam_uri(value)+"</td></tr>").appendTo(table);
}

function build_autocomplete(tree_file){
    $.ajax({
        type: "GET",
        dataType: "json",
        url:tree_file,
        data: {},
        success: function (data, textStatus, xhr) {
            var source = [];
            function traverse(node) {
                source.push({
                    value : node.text,
                    label : node.text,
                    definition : node.definition,
                    uri : node.data.uri,
                    key : node.data.uri.substring(node.data.uri.lastIndexOf('/')+1),
                });
                if (node.children) {
                    $.each(node.children, function(i, child) {
                         traverse(child);
                    });
                }
            }
            traverse(data);
            $('#search-term').autocomplete({
                source : source,
                minLength: 2,
                select : function(event, ui){ // lors de la sélection d'une proposition
                    if(selectedURI!=""){
                        tree.removeByURI(selectedURI,false);
                    }
                    selectedURI=ui.item.uri;
                    tree.openByURI(ui.item.uri);
                    setCookie("edam_browser_"+current_branch,d.data.uri);
                }
            })
            .autocomplete( "instance" )._renderItem = function( ul, item ) {
              return $( "<li>" )
                .append( "<div><b>" + item.label + "</b> ("+item.key+")<br><small>" + item.definition + "</small></div>" )
                .appendTo( ul );
            };
        }
    });
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname, default_value) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    if (typeof default_value == "undefined")
        return "";
    return default_value;
}

initURI=[];
root_uri="";
var current_branch="";
var selectedURI="";
var loadingDone=0;

function getHeight(){
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0)*0.90;
}

window.onload = function() {
    if(window.location.hash) {
        branch=window.location.hash.substring(1);
        pos = branch.lastIndexOf('&');
        if (pos!=-1){
            id=branch.substring(0,pos);
            branch=branch.substring(pos+1);
        }else{
            id=branch;
            branch=branch.substring(0,branch.lastIndexOf('_'));
        }
        setCookie("edam_browser_branch",branch);
        setCookie("edam_browser_"+branch,"http://edamontology.org/"+id);
    }
    makeTreeShortcut();
}