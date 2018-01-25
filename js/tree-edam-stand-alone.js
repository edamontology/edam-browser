function getTreeFileAndInitURI(branch){
    if (branch == "deprecated"){
        tree_file="media/deprecated_extended.biotools.min.json";
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
    return {'tree_file':tree_file,'initURI':initURI};
}

function makeTreeShortcut(branch) {
    loadingDone=0;
    $("#edam-branches .branch").removeClass("active");
    if (typeof branch == "undefined"){
        branch=getCookie("edam_browser_branch","topic");
    }
    $("#edam-branches .branch."+branch).addClass("active");
    setCookie("edam_browser_branch",branch);
    var ti=getTreeFileAndInitURI(branch);
    tree_file=ti.tree_file;
    initURI=ti.initURI;
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

function get_length_biotools(data){
    return data.list.length;
}

function get_name_biotools(data, i){
    return data.list[i].name;
}

function has_next_biotools(data){
    return data.next != null;
}

function to_biotools_href(c,url,data){
    return to_generic_href(c,url,data,get_length_biotools,get_name_biotools,has_next_biotools);
}

function get_length_tess(data){
    return data.length;
}

function get_name_tess(data, i){
    return data[i].title;
}

function has_next_tess(data){
    return false;
}

function to_tess_href(c,url,data){
    return to_generic_href(c,url,data,get_length_tess,get_name_tess,has_next_tess);
}

function get_name_bioweb(data, i){
    return data[i].name;
}

function to_bioweb_href(c,url,data){
    return to_generic_href(c,url,data,get_length_tess,get_name_bioweb,has_next_tess);
}

function to_generic_href(c,url,data, get_length, get_name, has_next){
    var data_content="";
    if(c>0){
        data_content = "title=\"Some associated elements\" data-toggle=\"popover\" data-trigger=\"hover\" data-html=\"true\" data-content=\"<table class='table table-condensed'>";
        var i=0;
        for(;i<get_length(data)&&i<10;i++){
            data_content+="<tr><td>"+get_name(data,i)+"</td></tr>";
        }
        if(i<get_length(data) || has_next_biotools(data)){
            data_content+="<tr><td>...</td></tr>";
        }
        data_content+='</table>"';
        msg = c+" times";
    }else if (c == 0) {
        msg = "not used";
    }else {
        msg = "<i>unknown</i>";
    }
    return '<a href="'+url+'" target="_blank" '+data_content+'>'+msg+'</a>';
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
    var identifier = selectedURI.substring(selectedURI.lastIndexOf("/")+1);
    window.location.hash = identifier+ (current_branch=="deprecated"?"&deprecated":"");
    $("#details-"+identifier).remove();
    details = "";
    details += '<div class="panel-group" id="details-'+identifier+'">';
    details +=     '<div class="panel panel-default">';
    details +=         '<div class="panel-heading">';
    details +=             '<h4 class="panel-title">';
    details +=                 '<a data-toggle="collapse" href="#collapse-'+identifier+'">Details of term "<span class="term-name-heading"></span>"</a>';
    details +=                 '<a title="edit this term" type="button" class="btn btn-default btn-xs pull-right" target="_blank" href="edit.html?term='+identifier+'"><span class="glyphicon glyphicon-pencil"></span></a>';
    details +=                 '<a title="add a child to this term" type="button" class="btn btn-default btn-xs pull-right" target="_blank" href="edit.html?parent='+identifier+'"><span class="glyphicon glyphicon-plus"></span></a>';
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
    var caller_b=biotool_api().get_for(current_branch, d['text'], d.data.uri);
    if (caller_b.is_enabled()){
        var id_b = append_row(table,"Used in <a target=\"_blank\" href=\"https://bio.tools\">bio.tools</a>","<i>loading</i>");
        caller_b.count(function(c,data){
            var elt=$('#details-'+identifier+' .'+id_b);
            elt.empty();
            if (c  instanceof Array){
                $('<span>'
                 + to_biotools_href(c[0],caller_b.get_url()[0],data[0]) + ' as input, '
                 + to_biotools_href(c[1],caller_b.get_url()[1],data[1]) + ' as output.'
                 +'</span>').appendTo(elt);
            }else{
                $(to_biotools_href(c,caller_b.get_url(),data)).appendTo(elt);
            }
            $('#details-'+identifier+' .'+id_b+' [data-toggle="popover"]').popover();
        });
    }
    var caller_t=tess_api().get_for(current_branch, d['text'], d.data.uri);
    if (caller_t.is_enabled()){
        var id_t = append_row(table,"Used in <a target=\"_blank\" href=\"https://tess.elixir-europe.org/\">TeSS</a>","<i>loading</i>");
        caller_t.count(function(c,data){
            var elt=$('#details-'+identifier+' .'+id_t);
            elt.empty();
            $(to_tess_href(c,caller_t.get_url(),data)).appendTo(elt);
            $('#details-'+identifier+' .'+id_t+' [data-toggle="popover"]').popover();
        });
    }
    var caller_w=bioweb_api().get_for(current_branch, d['text'], d.data.uri);
    if (caller_w.is_enabled()){
        var id_w = append_row(table,"Used in <a target=\"_blank\" href=\"https://bioweb.pasteur.fr/\">BioWeb</a>","<i>loading</i>");
        caller_w.count(function(c,data){
            var elt=$('#details-'+identifier+' .'+id_w);
            elt.empty();
            $(to_bioweb_href(c,caller_w.get_url(),data)).appendTo(elt);
            $('#details-'+identifier+' .'+id_w+' [data-toggle="popover"]').popover();
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
    var id=(name
        .replace(/[^a-zA-Z]/g,'-')
        .toLowerCase()+"-val")
        .replace(/[-]+/g,'-');
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

function build_autocomplete(tree_file, elt){
    if(typeof elt == "undefined"){
        elt='.search-term';
    }
    $(elt).prop('disabled',true);
    $.ajax({
        type: "GET",
        dataType: "json",
        url:tree_file,
        data: {},
        success: function (data, textStatus, xhr) {
            var source = [];
            var source_dict = {};
            function traverse(node) {
                candidate={
                    value : node.text,
                    key : node.data.uri.substring(node.data.uri.lastIndexOf('/')+1),
                    node : node,
                }
                source_dict[candidate.key] = candidate;
                if (node.children) {
                    $.each(node.children, function(i, child) {
                         traverse(child);
                    });
                }
            }
            traverse(data);
            for (var key in source_dict){
                source.push(source_dict[key]);
            }
            $(elt).autocomplete({
                source : source,
                minLength: 2,
                select : function(event, ui){ // lors de la sélection d'une proposition
                    $(event.target).attr("data-selected",ui.item.node.data.uri);
                    if (typeof tree != "undefined"){
                        if(selectedURI!=""){
                            tree.removeByURI(selectedURI,false);
                        }
                        selectedURI=ui.item.node.data.uri;
                        tree.openByURI(ui.item.node.data.uri);
                        standAloneSelectedElementHandler(ui.item.node,true);
                        setCookie("edam_browser_"+current_branch, selectedURI);
                    }
                }
            })
            .autocomplete( "instance" )._renderItem = function( ul, item ) {
              return $( "<li>" )
                .append( "<div><b>" + item.node.text + "</b> ("+item.key+")<br><small>" + item.node.definition + "</small></div>" )
                .appendTo( ul );
            };
            $(elt).prop('disabled',false);
        }
    });
}
