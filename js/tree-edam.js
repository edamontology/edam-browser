

if(typeof paramsURI != "undefined" && typeof paramsURI.uri == "undefined")
    paramsURI.uri="http://edamontology.org/topic_0003";

/*function makeTree(initURI,removeNodesWithNoSelectedDescendant,jsonURL, is_view, use_input, handlers) {
    makeEdamTree(
        initURI,
        removeNodesWithNoSelectedDescendant,
        jsonURL,
        handlers,
        {
            "use_input":use_input,
            "is_view":is_view,
            "use_tooltip":true,
        }
    );
}*/

function makeEdamTree(initURI,removeNodesWithNoSelectedDescendant,jsonURL, handlers, properties) {
    properties["file_url_as_response_of_url"] = typeof (o=properties["file_url_as_response_of_url"]) != "undefined" ? o:false;

    if (properties["file_url_as_response_of_url"]){
        properties["file_url_as_response_of_url"]=false;
        $.ajax({
            dataType: "json",
            url: jsonURL,
            data: {},
            success: function(d){
                makeEdamTree(initURI,removeNodesWithNoSelectedDescendant,d["url"], handlers, properties);
            }
        });
        return ;
    }

    $("#selectedURIParent>li[id]").remove()
    $("#tree").children().remove();
    var voidHandler=function(e){};
    var default_local_uri_accessor=function(u){return u};
    var o;
    properties = typeof (o=properties) != "undefined" ? o:{};
    properties["is_view"]                     = typeof (o=properties["is_view"])                     != "undefined" ? o:false;
    properties["use_input"]                   = typeof (o=properties["use_input"])                   != "undefined" ? o:false;
    properties["use_tooltip"]                 = typeof (o=properties["use_tooltip"])                 != "undefined" ? o:false;

    if (properties["is_view"]){
        properties["use_control_to_add"]=false;
        properties["use_shift_to_add"]  =false;
        properties["use_alt_to_add"]    =false;
    }
    handlers = typeof (o=handlers) != "undefined" ? o:{};
    handlers["addingElementHandler"]   = typeof (o=handlers["addingElementHandler"])   != "undefined" ? o:voidHandler;
    handlers["openElementHandler"]     = typeof (o=handlers["openElementHandler"])     != "undefined" ? o:voidHandler;
    handlers["selectedElementHandler"] = typeof (o=handlers["selectedElementHandler"]) != "undefined" ? o:voidHandler;
    handlers["removingElementHandler"] = typeof (o=handlers["removingElementHandler"]) != "undefined" ? o:voidHandler;
    handlers["loadingDoneHandler"]     = typeof (o=handlers["loadingDoneHandler"])     != "undefined" ? o:voidHandler;
    handlers["local_uri_accessor"]     = typeof (o=handlers["local_uri_accessor"])     != "undefined" ? o:default_local_uri_accessor;
    tree=displayTree("#tree",
    jsonURL,
    {
        "initiallySelectedNodeHandler":
        function (e){
            for(var i=0;i<initURI.length;i++)
                if(initURI[i]==e.data.uri){/*console.log(e);*/return true;}
            return false;
        },
        "addingElementHandler":
        function(e){
            if(properties["is_view"]){
                if(initURI.indexOf(e.data.uri)==-1)
                return false;
            }
            console.log("added element: "+e.data.uri);
            local_uri=handlers["local_uri_accessor"](e.data.uri);
            safe_uri=e.data.uri.replace( /(:|\.|\/|\[|\]|,)/g, "_" );
            $("#"+safe_uri).remove();
            $("#selectedURIParent").children().last().before($.parseHTML(
            "<li id=\""+safe_uri+"\">"+
            (properties["use_input"]&&!properties["is_view"]?"<input type=\"hidden\" value=\""+e.data.uri+"\" name=\""+safe_uri+"\"/>":"")+
            ""+e.text+
            " <a href=\""+local_uri+"\" target=\"_blank\">"+
            "<span role=\"button\" class=\"glyphicon glyphicon-new-window open-selected-option\" aria-hidden=\"true\"></span>"+
            "</a>"+
            (!properties["is_view"]?
            " <span role=\"button\" class=\"glyphicon glyphicon-trash text-danger\" aria-hidden=\"true\" onclick=\"if($('#ro:checked').length!=0)return false;if (typeof shouldSave != 'undefined'){shouldSave();}tree.closeByText('"+e.text+"');$('#"+safe_uri+"').remove();\"></span>"
            :"")+
            ""+
            "</li>"));
            return handlers["addingElementHandler"](e);
        },
        "openElementHandler":handlers["openElementHandler"],
        "selectedElementHandler":handlers["selectedElementHandler"],
        "removingElementHandler":
        function(e){
            if(properties["is_view"])
                return false;
            console.log("removed element: "+e.data.uri);
            $("#"+e.data.uri.replace( /(:|\.|\/|\[|\]|,)/g, "_" )).remove();
            return handlers["removingElementHandler"](e);
        },
        "loadingDoneHandler":
        function(returnedTree){
            //for(i=0;i<allURI.length;i++){
                //returnedTree.closeByURI(allURI[i]);
                //returnedTree.openByURI(allURI[i]);
            //}
            var $wrapper = $('#selectedURIParent');
            $wrapper.find('li[id]').sort(function(a, b) {
            console.log($(a).contents()[1]);
            console.log($(a).text());
                var upA = $(a).text().toUpperCase();
                var upB = $(b).text().toUpperCase();
                return (upA < upB) ? -1 : (upA > upB) ? 1 : 0;
                //console.log(($(a).contents()[1]+"") < ($(b).contents()[1]+""));
                //return $(a).contents()[1] < $(b).contents()[1] ? 1 : -1;
                //return 0;
            })
            .appendTo($wrapper);
            $wrapper.find('li').not('[id]').appendTo($wrapper);
            console.log("loadingDone"+returnedTree);
            loadingDone=1;
            handlers["loadingDoneHandler"]();
        },
        "nodeEqualityOverride":
        function(e,f){
            return e.data.uri==f.data.uri;
        },
        "getHeight":(typeof getHeight == "undefined" ? void 0:getHeight)
        ,
        "removeNodesWithNoSelectedDescendant":removeNodesWithNoSelectedDescendant,
    },
    properties);
};

function getLabelFromURI(str){
    var pos=0
    pos = str.indexOf("/",pos+1);
    pos = str.indexOf("/",pos+1);
    start = str.indexOf("/",pos+1);
    end = str.indexOf("_",pos);
    return str.substring(start+1,end);
}

function getRootURIForBranch(branch){
    if (branch == "topic"){
        return "http://edamontology.org/topic_0003";
    }
    if (branch == "data"){
        return "http://edamontology.org/data_0006";
    }
    if (branch == "format"){
        return "http://edamontology.org/format_1915";
    }
    if (branch == "operation"){
        return "http://edamontology.org/operation_0004";
    }
    if (branch == "deprecated"){
        return "owl:DeprecatedClass";
    }
    return "http://www.w3.org/2002/07/owl#Thing";
}