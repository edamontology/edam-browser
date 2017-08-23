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
            "addingElementHandler":function (d){selectedName=d["name"];return false;},
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

function standAloneSelectedElementHandler (d){
    if(selectedName!=""){
        tree.removeByText(selectedName,false);
    }
    selectedName=d["name"];
    console.log("click on "+d['uri']);
    tree.openByURI(d["uri"]);
    setCookie("edam_browser_"+current_branch,d["uri"]);
    return false;
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