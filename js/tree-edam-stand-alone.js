function makeTreeShortcut(branch) {
    loadingDone=0;
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
        tree_file="media/data_extended.biotools.min.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/data_1916")];
    }else if(branch == "format"){
        tree_file="media/format_extended.biotools.min.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/format_3464")];
    }else if(branch == "operation"){
        tree_file="media/operation_extended.biotools.min.json";
        initURI=[getCookie("edam_browser_"+branch,"http://edamontology.org/operation_2451")];
    }else if(branch == "topic"){
        tree_file="media/topic_extended.biotools.min.json";
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
            "use_tooltip":false,
            "file_url_as_response_of_url":false,
            "is_view":true
        }
    );
    build_autocomplete(tree_file);
}

function c_times_formater(c){
    return (c==0?"not used":c+" times");
}

function standAloneSelectedElementHandler (d, do_not_open){
    if (!do_not_open){
        if(selectedURI!=""){
            tree.removeByURI(selectedURI,false);
        }
        tree.openByURI(d.data.uri);
        setCookie("edam_browser_"+current_branch,d.data.uri);
    }
    var selectedURI=d.data.uri;
    var identifier = selectedURI.substring(selectedURI.lastIndexOf("/")+1);
    window.location.hash = identifier+ (current_branch=="deprecated"?"&deprecated":"");
    $("#details-"+identifier).remove();
    details = "";
    details += '<div class="panel-group" id="details-'+identifier+'">';
    details +=     '<div class="panel panel-default">';
    details +=         '<div class="panel-heading">';
    details +=             '<h4 class="panel-title">';
    details +=                 '<a data-toggle="collapse" href="#collapse-'+identifier+'">Details of term "<span class="term-name-heading"></span>"</a>';
    details +=             '</h4>';
    details +=         '</div>';
    details +=         '<div id="collapse-'+identifier+'" class="panel-collapse collapse">';
    details +=             '<div class="panel-body"><table></table></div>';
    details +=         '</div>';
    details +=     '</div>';
    details += '</div>';
    details=$(details);
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
    var caller=biotool_api().tools_for(current_branch, d['text']);
    if (caller.is_enabled()){
        var id = append_row(table,"Used in bio.tools","<i>loading</i>");
        caller.count(function(c){
            var elt=$('#details-'+identifier+' .'+id);
            elt.empty();
            if (c  instanceof Array){
                $('<span>'
                 +'<a href="'+caller.get_url()[0]+'" target="_blank">'+c_times_formater(c[0])+'</a> as input, '
                 +'<a href="'+caller.get_url()[1]+'" target="_blank">'+c_times_formater(c[1])+'</a> as output.'
                 +'</span>').appendTo(elt);
            }else{
                $('<a href="'+caller.get_url()+'" target="_blank">'+c_times_formater(c)+'</a>').appendTo(elt);
            }
        });
    }
    table_parent.find("table").remove();
    table.appendTo(table_parent);
    $("#edamAccordion").children().first().find(".collapse").collapse("hide");
    $("#edamAccordion").prepend(details);
    $("#edamAccordion").children().first().find(".collapse").collapse("show");
    return false;
}

function interactive_edam_uri(value){
    if ((""+value).startsWith("http://edamontology.org/")){
        return "<a href=\"#"+ value.substring(value.lastIndexOf('/')+1) + (current_branch=="deprecated"?"&deprecated":"")+"\" onclick=\"tree.removeByURI(selectedURI,false);selectedURI=this.text;tree.openByURI(selectedURI);\">"+value+"</a>";
    }
    return value;
}

function append_row(table,name,value){
    var id=name.replace(/ /g,'-').replace(/\./g,'-').toLowerCase()+"-val";
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
    $("<tr><th>"+name+"</th><td class=\""+id+"\">"+interactive_edam_uri(value)+"</td></tr>").appendTo(table);
    return id;
}

function build_autocomplete(tree_file){
    $('#search-term').val('');
    $('#search-term').prop('disabled',true);
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
                    key : node.data.uri.substring(node.data.uri.lastIndexOf('/')+1),
                    node : node,
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
                    selectedURI=ui.item.node.data.uri;
                    tree.openByURI(ui.item.node.data.uri);
                    standAloneSelectedElementHandler(ui.item.node,true);
                    setCookie("edam_browser_"+current_branch, selectedURI);
                }
            })
            .autocomplete( "instance" )._renderItem = function( ul, item ) {
              return $( "<li>" )
                .append( "<div><b>" + item.node.text + "</b> ("+item.key+")<br><small>" + item.node.definition + "</small></div>" )
                .appendTo( ul );
            };
            $('#search-term').prop('disabled',false);
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
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0)*0.75;
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
