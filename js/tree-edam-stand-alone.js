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
    if(branch == "edam")
        return getCookie("edam_browser_"+branch,"http://edamontology.org/topic_0091");
    if(branch == "edam_w_deprecated")
        return getCookie("edam_browser_"+branch,"http://edamontology.org/topic_0091");
    if(branch == "custom_file")
        return getCookie("edam_browser_"+branch,"");
    if(branch == "custom_url")
        return getCookie("edam_browser_"+branch,"");
}

function getTreeFile(branch){
    if (branch == "deprecated")
        return "media/edam_extended.biotools.min.json";
        //return "media/deprecated_extended.biotools.min.json";
    if(branch == "data")
        return "media/edam_extended.biotools.min.json";
        //return "media/data_extended.biotools.min.json";
    if(branch == "format")
        return "media/edam_extended.biotools.min.json";
        //return "media/format_extended.biotools.min.json";
    if(branch == "operation")
        return "media/edam_extended.biotools.min.json";
        //return "media/operation_extended.biotools.min.json";
    if(branch == "topic")
        return "media/edam_extended.biotools.min.json";
        //return "media/topic_extended.biotools.min.json";
    if(branch == "edam")
        return "media/edam_extended.biotools.min.json";
    if(branch == "edam_w_deprecated")
        return "media/edam_extended.biotools.min.json";
    if(branch == "custom_url")
        return getCookie("edam_browser_custom_loaded_url","");
    return "";
}

function interactive_edam_browser(){

    var __my_interactive_tree,
        current_branch="",
        identifier_accessor_mapping={},
        text_accessor_mapping={};

    function loadTree(branch, tree) {
        $("#edam-branches .branch").removeClass("active");
        if (typeof branch == "undefined"){
            branch=getCookie("edam_browser_branch","topic");
        }
        $("#edam-branches .branch."+branch).addClass("active");
        setCookie("edam_browser_branch",branch);
        current_branch=branch;
        tree_file=getTreeFile(branch);
        if(tree_file==""){
            __my_interactive_tree.data(tree);
            //build_autocomplete_from_tree(tree)
        }else{
            __my_interactive_tree.data_url(tree_file);
            //build_autocomplete(tree_file);
        }
        build_autocomplete_from_edam_browser(browser);
    }

    function selectCustom(){
        branch="custom";
        $("[name=identifier_accessor][value='"+getCookie("edam_browser_custom_identifier_accessor","")+"']").prop("checked",true);
        $("[name=text_accessor][value='"+getCookie("edam_browser_custom_text_accessor","")+"']").prop("checked",true);
        $("#id_url").val( getCookie("edam_browser_custom_loaded_url", ""));
        $("#id_url").change();
        $("#myModal").modal('show');
    }

    function loadCustom(){
        var branch;
        var from=$("#custom_ontology_from")[0];
        if(!from.checkValidity()){
            $(from).find("[type=submit]").click();
            return;
        }
        setUrlParameters($(from).serialize());
        if(typeof getUrlParameter("url")=="undefined")
            branch="custom_file";
        else
            branch="custom_url";
        setCookie("edam_browser_custom_loaded_url", getUrlParameter("url", ""));
        setCookie("edam_browser_custom_identifier_accessor", getUrlParameter("identifier_accessor"));
        setCookie("edam_browser_custom_text_accessor", getUrlParameter("text_accessor"));

        __my_interactive_tree.identifierAccessor(identifier_accessor_mapping[getUrlParameter("identifier_accessor")]);
        __my_interactive_tree.textAccessor(text_accessor_mapping[getUrlParameter("text_accessor")]);

        $("#myModal").modal('hide');
        $("#edamAccordion>.panel-group").remove();
        if(branch=="custom_url"){
            loadTree(branch);
            return;
        }
        var reader = new FileReader();
        var file=$("#id_file")[0].files[0];
        reader.readAsText(file);
        reader.onload = function(event) {
            json = JSON.parse(event.target.result);
            if(typeof json.meta=="undefined"){
                json.meta={"version":"v n/a"};
            }
            json.meta.data_file=file.name;
            json.meta.date=file.lastModifiedDate.toLocaleString();
            loadTree(branch, json);
        };
        reader.onerror = function() {
            alert('Unable to read ' + file.fileName);
        };
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

    function get_length_default(data){
        return data.length;
    }

    function get_name_default(data, i){
        return data[i];
    }

    function get_name_tess(data, i){
        return data[i].title;
    }

    function has_next_default(data){
        return false;
    }

    function to_tess_href(c,url,data){
        return to_generic_href(c,url,data,get_length_default,get_name_tess,has_next_default);
    }

    function to_biosphere_href(c,url,data){
        return to_generic_href(c,url,data,get_length_default,get_name_default,has_next_default);
    }

    function get_name_bioweb(data, i){
        return data[i].name;
    }

    function to_bioweb_href(c,url,data){
        return to_generic_href(c,url,data,get_length_default,get_name_bioweb,has_next_default);
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
        var uri=__my_interactive_tree.identifierAccessor()(d);
        var branch_of_term = get_branch_of_term(uri);
        setCookie("edam_browser_"+current_branch, uri);
        var identifier=uri.substring(uri.lastIndexOf('/')+1)
            .replace(/[^a-zA-Z_0-9]/g,'-')
            .toLowerCase()
            .replace(/[-]+/g,'-');
        window.location.hash = uri.replace("http://edamontology.org/","") + (current_branch!="edam"?"&"+current_branch:"");
        if(current_branch!="custom_url" && window.location.search){
            setUrlParameters("");
        }
        $("#details-"+identifier).remove();
        details = "";
        details += '<div class="panel-group" id="details-'+identifier+'">';
        details +=     '<div class="panel panel-default border-edam-'+branch_of_term+'">';
        details +=         '<div class="panel-heading xbg-edam-'+branch_of_term+'-light">';
        details +=             '<h4 class="panel-title">';
        details +=                 '<a data-toggle="collapse" href="#collapse-'+identifier+'">Details of term "<span class="term-name-heading"></span>"</a> ';
//        details +=                 '<span class="label label-default bg-edam-'+branch_of_term+'-light border-one-solid fg-edam-'+branch_of_term+' border-edam-'+branch_of_term+'">'+branch_of_term+'</span>';
        details +=                 '<span>';
        details +=                 '<a title="edit this term" type="button" class="btn btn-default btn-xs pull-right" target="_blank" href="edit.html?term='+uri+'&branch='+current_branch+'"><span class="glyphicon glyphicon-pencil"></span></a>';
        details +=                 '<a title="add a child to this term" type="button" class="btn btn-default btn-xs pull-right" target="_blank" href="edit.html?parent='+uri+'&branch='+current_branch+'"><span class="glyphicon glyphicon-plus"></span></a>';
        details +=                 '</span>';
        details +=             '</h4>';
        details +=         '</div>';
        details +=         '<div id="collapse-'+identifier+'" class="panel-collapse collapse">';
        details +=             '<div class="panel-body border-edam-'+branch_of_term+'"><table class="table table-condensed xborder-edam-'+branch_of_term+'"><tbody class="details"></tbody></table><table class="table table-condensed xborder-edam-'+branch_of_term+'"><tbody class="community"></tbody></table></div>';
        details +=         '</div>';
        details +=     '</div>';
        details += '</div>';
        details=$(details);
        details.find(".term-name-heading").text(d.data.text);
        var table = details.find("tbody.details");
        table.children().remove();
        var table_parent = details.find("table").parent();
        var fields=[
            "text",
            "definition",
            "comment",
            "exact_synonyms",
            "narrow_synonyms",
            "uri",
        ];
        if(typeof d.data.has_topic != "undefined")
            fields.push("has_topic");
        if(typeof d.data.is_format_of != "undefined")
            fields.push("is_format_of");
        if(typeof d.data.has_input != "undefined")
            fields.push("has_input");
        if(typeof d.data.has_output != "undefined")
            fields.push("has_output");
        if(typeof d.data.see_also != "undefined")
            fields.push("see_also");
        fields.forEach(function(entry) {
            if("uri"==entry)
                append_row(table,"URI",uri,false);
            else if("text"==entry)
                append_row(table,"Term",d.data[entry],false);
            else
                append_row(table,entry,d.data[entry]);
        });
        var community = details.find("tbody.community");
        var caller_b=biotool_api().get_for(current_branch, d.data.text, uri, d);
        if (caller_b.is_enabled()){
            var id_b = append_row(community,"<a target=\"_blank\" href=\"https://bio.tools\">bio.tools</a>","<i>loading</i>");
            caller_b.count(function(c,data){
                var elt=$('#details-'+identifier+' .'+id_b);
                var has_descendants=browser.identifierAccessor(d.parent)!="owl:Thing" && (d.children||d._children) && browser.identifierAccessor(d)!="http://edamontology.org/data_0842";
                elt.empty();
                if (c  instanceof Array){
                    $('<span>' +
                     to_biotools_href(c[0],caller_b.get_url()[0],data[0]) + ' as input<span class="'+id_b+'-dsc-i"></span>' +
                     (has_descendants?'<span class="'+id_b+'-dsc-i dscd" title="loading"> (<i class="fa fa-plus-square-o"></i> <span class="hit">?</span>)</span>':'') +
                     ', ' +
                     to_biotools_href(c[1],caller_b.get_url()[1],data[1]) + ' as output<span class="'+id_b+'-dsc-o"></span>' +
                     (has_descendants?'<span class="'+id_b+'-dsc-o dscd" title="loading"> (<i class="fa fa-plus-square-o"></i> <span class="hit">?</span>)</span>':'') +
                     '.' +
                     '</span>').appendTo(elt);
                    if(has_descendants){
                        caller_b.count_with_descendants(function (count){
                            $('#details-'+identifier+' .'+id_b+'-dsc-i .hit').text(count.input.total);
                            $('#details-'+identifier+' .'+id_b+'-dsc-i.dscd').attr("title",count.input.total+" times with its "+(count.input.descendants-1)+" descendants");
                            $('#details-'+identifier+' .'+id_b+'-dsc-o .hit').text(count.output.total);
                            $('#details-'+identifier+' .'+id_b+'-dsc-o.dscd').attr("title",count.output.total+" times with its "+(count.output.descendants-1)+" descendants");
                        });
                    }
                }else{
                    $(to_biotools_href(c,caller_b.get_url(),data)).appendTo(elt);
                    if(has_descendants){
                        $('<span class="'+id_b+'-descendants dscd" title="loading"> (<i class="fa fa-plus-square-o"></i> <span class="hit">?</span>)</span>').appendTo(elt);
                        caller_b.count_with_descendants(function (count){
                            $('#details-'+identifier+' .'+id_b+'-descendants .hit').text(count.total);
                            $('#details-'+identifier+' .'+id_b+'-descendants.dscd').attr("title",count.total+" times with its "+(count.descendants-1)+" descendants");
                        });
                    }
                }
                $('#details-'+identifier+' .'+id_b+' [data-toggle="popover"]').popover();
            });
        }
        var caller_s=biosphere_api().get_for(current_branch, d.data.text, uri, d);
        if (caller_s.is_enabled()){
            var id_s = append_row(community,"<a target=\"_blank\" href=\"https://biosphere.france-bioinformatique.fr\">Biosphere</a>","<i>loading</i>");
            caller_s.count(function(c,data){
                var elt=$('#details-'+identifier+' .'+id_s);
                elt.empty();
                $('<span>' +
                 to_biosphere_href(c[0],caller_s.get_url(),data[0]) + ' by appliances, ' +
                 to_biosphere_href(c[1],caller_s.get_url(),data[1]) + ' by tools.' +
                 '</span>').appendTo(elt);
                $('#details-'+identifier+' .'+id_s+' [data-toggle="popover"]').popover();
            });
        }
        var caller_w=bioweb_api().get_for(current_branch, d.data.text, uri, d);
        if (caller_w.is_enabled()){
            var id_w = append_row(community,"<a target=\"_blank\" href=\"https://bioweb.pasteur.fr/\">BioWeb</a>","<i>loading</i>");
            caller_w.count(function(c,data){
                var elt=$('#details-'+identifier+' .'+id_w);
                elt.empty();
                $(to_bioweb_href(c,caller_w.get_url(),data)).appendTo(elt);
                $('#details-'+identifier+' .'+id_w+' [data-toggle="popover"]').popover();
            });
        }
        var caller_t=tess_api().get_for(current_branch, d.data.text, uri, d);
        if (caller_t.is_enabled()){
            var id_t = append_row(community,"<a target=\"_blank\" href=\"https://tess.elixir-europe.org/\">TeSS</a>","<i>loading</i>");
            caller_t.count(function(c,data){
                var elt=$('#details-'+identifier+' .'+id_t);
                elt.empty();
                $(to_tess_href(c,caller_t.get_url(),data)).appendTo(elt);
                $('#details-'+identifier+' .'+id_t+' [data-toggle="popover"]').popover();
            });
        }
        if(uri.startsWith("http://edamontology.org/")){
            append_row(community,"Links",
            "Open in "+
            "<a target=\"_blank\" href=\"http://aber-owl.net/ontology/EDAM/#/Browse/%3Chttp%3A%2F%2Fedamontology.org%2F"+identifier+"%3E\">AberOWL</a>"+
            ", "+
            "<a target=\"_blank\" href=\"http://bioportal.bioontology.org/ontologies/EDAM/?p=classes&conceptid=http%3A%2F%2Fedamontology.org%2F"+identifier+"\">BioPortal</a>"+
            ", "+
            "<a target=\"_blank\" href=\"https://www.ebi.ac.uk/ols/ontologies/edam/terms?iri=http%3A%2F%2Fedamontology.org%2F"+identifier+"\">OLS</a>"+
            " or "+
            "<a target=\"_blank\" href=\"https://webprotege.stanford.edu/#projects/98640503-a37d-4404-84da-caf30fadd685/edit/Classes?selection=Class(%3Chttp://edamontology.org/"+identifier+"%3E)\">WebProt&eacuteg&eacute</a>"+
            "."
            );
        }
        if (community.children().length>0){
            community.parent().prepend($('<thead><tr><th colspan="2">Community usage</th></tr></thead>'));
        }else{
            community.parent().remove();
        }
        $("#edamAccordion").find(".panel-group").first().find(".collapse").collapse("hide");
        var length=$("#edamAccordion").find(".panel-group").length;
        if(length>0){
            $("#edamAccordion").prepend($("#history-separator"));
        }
        if(length>5){
            $("#edamAccordion").find(".panel-group").last().fadeOut(300, function() { $(this).remove(); });
        }
        $("#edamAccordion").prepend(details);
        $("#edamAccordion").find(".panel-group").first().find(".collapse").collapse("show");
        return false;
    }

    function interactive_edam_uri(value, translate_to_text){
        if (value.constructor === Object){
            return JSON.stringify(value);
        }
        value=(""+value).replace("&quot;","").replace("&quot;","");
        if (!value.startsWith("http://edamontology.org/")){
            if(value.startsWith("http://")||value.startsWith("https://")){
                return "<a href=\""+ value + "\" target=\"_blank\">"+value+"</a>";
            }
            return value;
        }

        if(current_branch.startsWith("custom"))
            return "<a href=\"#"+ value + "&"+current_branch + "\" onclick=\"browser.interactive_tree().cmd().selectElement(this.text,true);\">"+value+"</a>";

        branch_of_term = get_branch_of_term(value);
        var text;
        if(translate_to_text!=false && value.constructor != Object ){
            var element=__my_interactive_tree.cmd.getElementByIdentifier(value);
            if(typeof element != "undefined"){
                text=__my_interactive_tree.textAccessor()(element);
            }else{
            text=value;
            }
        }else{
            text=value;
        }
        return "<a "+
        "href=\"#"+ value + (current_branch=="deprecated"?"&deprecated":"")+"\" "+
        "onclick=\"setCookie('edam_browser_'+'"+current_branch+"','"+value+"');browser.current_branch('"+branch_of_term+"');browser.interactive_tree().cmd().selectElement('"+value+"',true)\""+
        "class=\"label bg-edam-"+branch_of_term+"-light fg-edam-"+branch_of_term+" border-one-solid border-edam-"+branch_of_term+"\" "+
        ">"+
        text+
        "</a>"
        //+' <i class="glyphicon glyphicon-stop bg-edam-'+branch_of_term+' fg-edam-'+branch_of_term+'"></i></a>'
        //+'<span class="badge bg-edam-'+branch_of_term+'">'+branch_of_term+'</span>'
        //+'<span class="label label-default bg-edam-'+branch_of_term+'-light fg-edam-'+branch_of_term+' border-edam-'+branch_of_term+'">'+branch_of_term+'</span>'
        ;
    }

    function get_branch_of_term(value){
        return value.substring(value.lastIndexOf('/')+1,value.lastIndexOf('_'));
    }

    function append_row(table, name, value, translate_uri_to_text){
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
                        value_txt = value_txt + "<li>"+interactive_edam_uri(value[i], translate_uri_to_text)+"</li>";
                    }
                }
                value='<ul class="list-unstyled">'+value_txt+'</ul>';
            }else{
                value=interactive_edam_uri(value[0], translate_uri_to_text);
            }
        }
        $("<tr><th>"+name+"</th><td class=\""+id+"\">"+interactive_edam_uri(value, translate_uri_to_text)+"</td></tr>").appendTo(table);
        return id;
    }

    function metaInformationHandler(meta){
        if (typeof meta == "undefined"){
            $("#version").html("<i>n/a</i>");
            $("#release_date").html("<i>n/a</i>");
            $("#meta_data_url").html("<i>n/a</i>");
            $("#meta_data_file").html("<i>n/a</i>");
            return;
        }
        $("#version").html(meta.version);
        $("#release_date").html(meta.date);
        $("#meta_data_url").attr("href", meta.data_url).add("[for=meta_data_url]").toggle(typeof meta.data_url != "undefined");
        $("#meta_data_file").html(meta.data_file).add("[for=meta_data_file]").toggle(typeof meta.data_file != "undefined");
//        $("#meta_data_filename").attr("href", meta.data_filename).visible(typeof meta.data_filename != "undefined");
    }

    function identifierAccessorDefault(d, notPreTreated){
        return (notPreTreated?d.id:d.data.id);
    }
    identifier_accessor_mapping['d.id']=identifierAccessorDefault;

    function identifierAccessorEDAM(d, notPreTreated){
        return (notPreTreated?d.data.uri:d.data.data.uri);
    }
    identifier_accessor_mapping['d.data.uri']=identifierAccessorEDAM;

    function textAccessorDefault(d){
        if (typeof d.data.text == "undefined"){
            var identifier = __my_interactive_tree.identifierAccessor()(d);
            if(identifier == "owl:Thing" && branch == "edam")
                return "EDAM"
            return identifier;
        }
        return d.data.text;
    }
    text_accessor_mapping['d.text']=textAccessorDefault;

    function textAccessorName(d){
        return d.data.name;
    }
    text_accessor_mapping['d.name']=textAccessorName;

    function markDeprecated(node){
        node.deprecated=true;
        var i;
        for(i=0;i<(node.children||[]).length;i++){
            markDeprecated(node.children[i]);
        }
        for(i=0;i<(node._children||[]).length;i++){
            markDeprecated(node._children[i]);
        }
    }

    __my_interactive_tree = interactive_tree()
        .identifierAccessor(identifierAccessorEDAM)
        /*.additionalCSSClassForNode(function(d){
            if (current_branch!="edam" &&
                current_branch!="data" &&
                current_branch!="format" &&
                current_branch!="operation" &&
                current_branch!="topic"
            )
                return ""
            return "bg-edam-"+get_branch_of_term(__my_interactive_tree.identifierAccessor()(d))+"-light";
        })*/
        .additionalCSSClassForLink(function(d){
            if (current_branch!="edam" &&
                current_branch!="edam_w_deprecated" &&
                current_branch!="data" &&
                current_branch!="format" &&
                current_branch!="operation" &&
                current_branch!="topic"
            )
                return "";
            return "fg-edam-"+get_branch_of_term(__my_interactive_tree.identifierAccessor()(d))+"-light";
        })/**/
        .clickedElementHandler(function(d){
            if(__my_interactive_tree.cmd.isElementSelected(__my_interactive_tree.identifierAccessor()(d)))
                return;
            if(__my_interactive_tree.identifierAccessor()(d) === "owl:Thing")
                return;
            __my_interactive_tree.cmd.selectElement(__my_interactive_tree.identifierAccessor()(d),true,true);
            return;
        })
        .addingElementHandler(function(d){
            __my_interactive_tree.cmd.clearSelectedElements(false);
            standAloneSelectedElementHandler(d,false);
            return true;
        })
        .preTreatmentOfLoadedTree(function(tree){
            var i;
            if(current_branch==="edam"){
                all_children=tree.children;
                tree.children=[];
                for(i=0;i<all_children.length;i++){
                    if (__my_interactive_tree.identifierAccessor()(all_children[i],true)!="owl:DeprecatedClass")
                        tree.children.push(all_children[i]);
                }
            }
            if(current_branch==="deprecated"){
                for(i=0;i<tree.children.length;i++){
                    if (__my_interactive_tree.identifierAccessor()(tree.children[i],true)==="owl:DeprecatedClass"){
                        tree.children[i].meta=tree.meta||{};
                        markDeprecated(tree.children[i]);
                        return tree.children[i];
                    }
                }
            }
            branches=[
                "data",
                "format",
                "operation",
                "topic",
            ];
            for (var id=0;id<branches.length;id++){
                if(current_branch===branches[id]){
                    for(i=0;i<tree.children.length;i++){
                        if (__my_interactive_tree.identifierAccessor()(tree.children[i],true).indexOf("/"+branches[id]+"_")!=-1){
                            tree.children[i].meta=tree.meta||{};
                            return tree.children[i];
                        }
                    }
                }
            }
            for(i=0;i<tree.children.length;i++){
                if (__my_interactive_tree.identifierAccessor()(tree.children[i],true)==="owl:DeprecatedClass"){
                    markDeprecated(tree.children[i]);
                    i=tree.children.length;
                }
            }
            return tree;
        })
        .initiallySelectedElementHandler(function(d){
            if (d.text && d.text.constructor === Object){
                d.text = JSON.stringify(d.text);
            }
            return __my_interactive_tree.identifierAccessor()(d) === getInitURI(current_branch);
        })
        .loadingDoneHandler(function(){
            __my_interactive_tree.cmd.selectElement("http://edamontology.org/"+getInitURI(current_branch),true,true);
            __my_interactive_tree.cmd.selectElement(getInitURI(current_branch),true,true);
            build_autocomplete_from_edam_browser(browser);
        })
        .metaInformationHandler(metaInformationHandler)
        .debug(false)
        .sortChildren(true)
        .use_shift_to_open(false)
        .use_control_to_open(false)
        .use_alt_to_open(false)
        .use_shift_to_add(false)
        .use_control_to_add(false)
        .use_alt_to_add(false)
    ;

    /**
     * The browser
     */
    function browser(){}
    /**
     * The browser's accessors
     */
    function cmd() {
        return cmd;
    }
    browser.cmd = cmd;
    /**
     * Command to prepare the modal to load a custom ontology
     * @param {boolean} value
     */
    cmd.selectCustom=function(){
        return selectCustom();
    };
    /**
     * Command to load a custom ontology
     * @param {boolean} value
     */
    cmd.loadCustom=function(){
        return loadCustom();
    };

    // getter and setter functions. ----------------------------------------------------------

    /**
     * Read-only accessor to the interactive tree
     * @return {object} the tree
     */
    browser.interactive_tree=function(){
        return __my_interactive_tree;
    };
    /**
     * Get the current branch or load the branch given in parameter if it is not
     * the current branch
     * @param {string} value
     */
    browser.current_branch = function(value) {
        if (!arguments.length) return current_branch;
        if (current_branch === value) return browser;
        __my_interactive_tree.identifierAccessor(identifierAccessorEDAM);
        __my_interactive_tree.textAccessor(textAccessorDefault);
        loadTree(value);
        return browser;
    };
    /**
     * Read-only proxy to use the identifierAccessor of the interactive_tree
     * @param {object} an element
     * @return {object} the value return by the identifierAccessor for the given parameter
     */
    browser.identifierAccessor = function(value) {
        return __my_interactive_tree.identifierAccessor()(value);
    };
    /**
     * Read-only proxy to use the textAccessor of the interactive_tree
     * @param {object} an element
     * @return {object} the value return by the textAccessor for the given parameter
     */
    browser.textAccessor = function(value) {
        return __my_interactive_tree.textAccessor()(value);
    };
    return browser;
}
