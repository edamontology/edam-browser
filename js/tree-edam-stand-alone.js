function makeTreeShortcut(branch) {
    $("#edam-branches .branch").removeClass("active");
    if (typeof branch == "undefined"){
        branch=getCookie("edam_browser_branch","all");
    }
    $("#edam-branches .branch."+branch).addClass("active");
    setCookie("edam_browser_branch",branch);
    if (branch == "all"){
        tree_file="media/edam_browser_tree.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/topic_0091")];
    }else if(branch == "data"){
        tree_file="media/edam_browser_tree.data_0006.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/data_1916")];
    }else if(branch == "format"){
        tree_file="media/edam_browser_tree.format_1915.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/format_3464")];
    }else if(branch == "operation"){
        tree_file="media/edam_browser_tree.operation_0004.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/operation_2451")];
    }else if(branch == "topic"){
        tree_file="media/edam_browser_tree.topic_0003.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/topic_0091")];
    }
    current_branch=branch;
    root_uri=getRootURIForBranch(branch);
    makeEdamTree(initURI,
         $('#removeNodesWithNoSelectedDescendant:checked').length==1,
        tree_file,
        {
            "selectedElementHandler":standAloneSelectedElementHandler,
            "addingElementHandler":function (d){
                selectedName=d["name"];
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
    console.log(tree);
}

function standAloneSelectedElementHandler (d, do_not_open){
    if (!do_not_open){
        if(selectedName!=""){
            tree.removeByText(selectedName,false);
        }
        tree.openByURI(d["uri"]);
        setCookie("edam_browser_"+current_branch,d["uri"]);
    }
    selectedName=d["name"];
    identifier = d['uri'].substring(d['uri'].lastIndexOf("/")+1);
    console.log("click on "+identifier);
    $("#details-"+identifier).remove();
    details = $("<div class=\"panel panel-default\" id=\"details-"+identifier+"\">"+
        "<div class=\"panel-heading\">Details of term \"<span class=\"term-name-heading\"></span>\"</div>"+
        "<div class=\"panel-body\"><table></table></div>"+
        "</div>");
    details.find(".term-name-heading").text(d["name"]);
    $.ajax({
        type: "GET",
        url:"media/edam_browser_leaf."+identifier+".json",
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
    });
    $("#edamAccordion").prepend(details);
    return false;
}

function interactive_edam_uri(value){
    /*if (value.startsWith("http://edamontology.org/")){
        return "<a href=\"#\" onclick=\"tree.removeByText(selectedName,false);tree.openByURI(this.text);\">"+value+"</a>";
    }*/
    return value;
}

function append_row(table,name,value){
    name=name.replace("_"," ");
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
var selectedName="";
var selectedURI="";
var loadingDone=0;

window.onload = function() {
    makeTreeShortcut();
}