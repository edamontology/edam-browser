function getInitURI(branch){
    if (branch == "deprecated")
        return getCookie("edam_browser_"+branch,"owl:DeprecatedClass");
    if(branch == "data")
        return getCookie("edam_browser_"+branch,"http://edamontology.org/data_1916");
    if(branch == "format")
        return getCookie("edam_browser_"+branch,"http://edamontology.org/format_3464");
    if(branch == "operation")
        return getCookie("edam_browser_"+branch,"http://edamontology.org/operation_2451");
    if(branch == "topic")
        return getCookie("edam_browser_"+branch,"http://edamontology.org/topic_0091");
    if(branch == "custom_file")
        return getCookie("edam_browser_"+branch,"");
    if(branch == "custom_url")
        return getCookie("edam_browser_"+branch,"");
}

function getTreeFile(branch){
    if (branch == "deprecated")
        return "media/deprecated_extended.biotools.min.json";
    if(branch == "data")
        return "media/data_extended.biotools.min.json";
    if(branch == "format")
        return "media/format_extended.biotools.min.json";
    if(branch == "operation")
        return "media/operation_extended.biotools.min.json";
    if(branch == "topic")
        return "media/topic_extended.biotools.min.json";
    if(branch == "custom_url")
        return getCookie("edam_browser_"+branch+"_url",);
    return ""
}

function loadTree(branch,tree) {
    $("#edam-branches .branch").removeClass("active");
    if (typeof branch == "undefined"){
        branch=getCookie("edam_browser_branch","topic");
    }
    $("#edam-branches .branch."+branch).addClass("active");
    setCookie("edam_browser_branch",branch);
    current_branch=branch;
    tree_file=getTreeFile(branch);
    if(tree_file==""){
        build_autocomplete_from_tree(tree)
        my_tree.data(tree);
    }else{
        build_autocomplete(tree_file);
        my_tree.data_url(tree_file);
    }
}

function interactive_edam_browser(){
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
        setCookie("edam_browser_"+current_branch, d.data.uri);
        var identifier=d.data.uri.substring(d.data.uri.lastIndexOf('/')+1);
        window.location.hash = identifier+ (current_branch=="deprecated"?"&deprecated":"")+ (current_branch.substring(0,6)=="custom"?"&"+current_branch:"");
        if(current_branch!="custom_url" && window.location.search){
            setUrlParameters("");
        }
        $("#details-"+identifier).remove();
        details = "";
        details += '<div class="panel-group" id="details-'+identifier+'">';
        details +=     '<div class="panel panel-default">';
        details +=         '<div class="panel-heading">';
        details +=             '<h4 class="panel-title">';
        details +=                 '<a data-toggle="collapse" href="#collapse-'+identifier+'">Details of term "<span class="term-name-heading"></span>"</a>';
        details +=                 '<a title="edit this term" type="button" class="btn btn-default btn-xs pull-right" target="_blank" href="edit.html?term='+identifier+'&branch='+current_branch+'"><span class="glyphicon glyphicon-pencil"></span></a>';
        details +=                 '<a title="add a child to this term" type="button" class="btn btn-default btn-xs pull-right" target="_blank" href="edit.html?parent='+identifier+'&branch='+current_branch+'"><span class="glyphicon glyphicon-plus"></span></a>';
        details +=             '</h4>';
        details +=         '</div>';
        details +=         '<div id="collapse-'+identifier+'" class="panel-collapse collapse">';
        details +=             '<div class="panel-body"><table class="table table-condensed"><tbody></tbody></table></div>';
        details +=         '</div>';
        details +=     '</div>';
        details += '</div>';
        details=$(details);
        details.find(".term-name-heading").text(d.text);
        var table = details.find("tbody");
        table.children().remove();
        var table_parent = details.find("table").parent();
        var fields=[
            "text",
            "definition",
            "comment",
            "uri",
            "exact_synonyms",
            "narrow_synonyms",
        ];
        if(current_branch=="data" || current_branch=="custom" || current_branch=="deprecated"){
            fields.push("has_topic");
        }
        if(current_branch=="format" || current_branch=="custom" || current_branch=="deprecated"){
            fields.push("is_format_of");
        }
        if(current_branch=="operation" || current_branch=="custom" || current_branch=="deprecated"){
            fields.push("has_topic");
            fields.push("has_input");
            fields.push("has_output");
        }
        fields.forEach(function(entry) {
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
        append_row(table,"Links",
        "Open "+
        "<a target=\"_blank\" href=\"http://bioportal.bioontology.org/ontologies/EDAM/?p=classes&conceptid=http%3A%2F%2Fedamontology.org%2F"+identifier+"\">in BioPortal</a>"+
        ", "+
        "<a target=\"_blank\" href=\"https://www.ebi.ac.uk/ols/ontologies/edam/terms?iri=http%3A%2F%2Fedamontology.org%2F"+identifier+"\">in OLS</a>"+
        "."

        );
        $("#edamAccordion").find(".panel-group").first().find(".collapse").collapse("hide");
        if($("#edamAccordion").find(".panel-group").length>0){
            $("#edamAccordion").prepend($("#history-separator").show());
        }
        $("#edamAccordion").prepend(details);
        $("#edamAccordion").find(".panel-group").first().find(".collapse").collapse("show");
        return false;
    }

    function interactive_edam_uri(value){
        if ((""+value).startsWith("http://edamontology.org/")){
            return "<a href=\"#"+ value.substring(value.lastIndexOf('/')+1) + (current_branch=="deprecated"?"&deprecated":"")+"\" onclick=\"my_tree.cmd.selectElement(this.text,true);\">"+value+"</a>";
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
        name=name.replace(/[_]/g,"&nbsp;");
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

    function metaInformationHandler(meta){
        if (typeof meta == "undefined"){
            $("#version").html("<i>n/a</i>");
            $("#release_date").html("<i>n/a</i>");
            $("#meta_data_url").html("<i>n/a</i>");
            return;
        }
        $("#version").html(meta.version);
        $("#release_date").html(meta.date);
        $("#meta_data_url").attr("href", meta.data_url).add("[for=meta_data_url]").toggle(typeof meta.data_url != "undefined");
        $("#meta_data_file").attr("href", meta.data_file).add("[for=meta_data_file]").toggle(typeof meta.data_file != "undefined");
//        $("#meta_data_filename").attr("href", meta.data_filename).visible(typeof meta.data_filename != "undefined");
    }

    var tree = interactive_tree()
        .identifierAccessor(identifierAccessorEDAM)
        .clickedElementHandler(function(d){
            if(tree.cmd.isElementSelected(tree.identifierAccessor()(d)))
                return;
            tree.cmd.selectElement(tree.identifierAccessor()(d),true,true)
            return;
        })
        .addingElementHandler(function(d){
            tree.cmd.clearSelectedElements(false);
            standAloneSelectedElementHandler(d,)
            return true;
        })
        .initiallySelectedElementHandler(function(d){
            return tree.identifierAccessor()(d) === getInitURI(current_branch);
        })
        .loadingDoneHandler(function(){
            tree.cmd.selectElement(getInitURI(current_branch),true,true)
        })
        .metaInformationHandler(metaInformationHandler)
        .debug(false)
        .use_shift_to_open(false)
        .use_control_to_open(false)
        .use_alt_to_open(false)
        .use_shift_to_add(false)
        .use_control_to_add(false)
        .use_alt_to_add(false)
    ;
    return tree;
}

function identifierAccessorDefault(d){
    return d.id;
}

function identifierAccessorEDAM(d){
    return d.data.uri;
}

function textAccessorDefault(d){
    return d.text;
}

function textAccessorEDAM(d){
    return d.name;
}

function selectCustom(){
    branch="custom";
    $("[name=identifier_accessor][value='"+getCookie("edam_browser_"+branch+"_identifier_accessor","")+"']").prop("checked",true);
    $("[name=text_accessor][value='"+getCookie("edam_browser_"+branch+"_text_accessor","")+"']").prop("checked",true);
    $("#myModal").modal('show');
}

function loadCustom(){
    var branch;
    var from=$("form")[0];
    if(!from.checkValidity()){
        $(from).find("[type=submit]").click()
        return;
    }
    setUrlParameters($(from).serialize());
    if(typeof getUrlParameter("url")=="undefined")
        branch="custom_file";
    else
        branch="custom_url";
    setCookie("edam_browser_"+branch+"_url", getUrlParameter("url"));
    setCookie("edam_browser_"+branch+"_identifier_accessor", getUrlParameter("identifier_accessor"));
    setCookie("edam_browser_"+branch+"_text_accessor", getUrlParameter("text_accessor"));
    $("#myModal").modal('hide');
    if(branch=="custom_url"){
        loadTree(branch);
        return;
    }
    var reader = new FileReader();
    var file=$("#id_file")[0].files[0];
    reader.readAsText(file);
    reader.onload = function(event) {
        json = JSON.parse(event.target.result);
        if(typeof json["meta"]=="undefined"){
            json["meta"]={};
        }
        json["meta"]["data_file"]=file.name;
        json["meta"]["date"]=file.lastModifiedDate.toLocaleString();
        loadTree(branch, json);
    };
    reader.onerror = function() {
        alert('Unable to read ' + file.fileName);
    };
}
