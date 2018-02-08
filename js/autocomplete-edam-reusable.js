/**
* DEPRECATED
* Build the autocomplete from a tree contained in a file, and rely on the presence of browser variable
* @depretated
* @param {dict} the tree
* @param {str} the target where we should build the autocomplete
*/
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
            build_autocomplete_from_tree(data,elt);
        }
    });
}

function fake_interactive_edam_browser(){
    var identifierToElement=[],
        identifierAccessor = function (d) {
            return d.data.uri;
        },
        textAccessor = function (d) {
            if (typeof d.text == "undefined")
                return identifierAccessor(d);
            if (d.text.constructor === Array)
                return d.text[0];
            return d.text;
        };

    function buildIdentifierToElement(element,parent) {
        node=identifierToElement[identifierAccessor(element)];
        if (typeof node != "undefined"){
            if (typeof node.duplicate == "undefined")
                node.duplicate=[];
            node.duplicate.push(element);
            element.duplicate=node.duplicate;
        }else{
            identifierToElement[identifierAccessor(element)]=element;
        }
        element.parent=parent;
        for(var i=0;i<(element.children||[]).length;i++){
            buildIdentifierToElement(element.children[i],element);
        }
    }//end of function buildIdentifierToElement

    /**
     * The browser
     */
    function browser(){}
    /**
     * The browser
     */
    function interactive_tree(){}
    browser.interactive_tree = interactive_tree;
    /**
     * The tree's commands
     */
    function cmd() {
        return cmd;
    };
    interactive_tree.cmd = cmd;
    /**
     * Iterate over ell the elements of the tree
     * @return cmd() itself
     */
    cmd.forEachElement = function (fcn){
        $.each(identifierToElement,fcn);
        return cmd;
    }

    /**
     * Read-only accessor to the interactive tree
     * @return {object} the tree
     */
    browser.interactive_tree=function(){
        return interactive_tree;
    }
    /**
     * Read-only proxy to use the identifierAccessor of the interactive_tree
     * @param {object} an element
     * @return {object} the value return by the identifierAccessor for the given parameter
     */
    browser.identifierAccessor = identifierAccessor;
    /**
     * Read-only proxy to use the textAccessor of the interactive_tree
     * @param {object} an element
     * @return {object} the value return by the textAccessor for the given parameter
     */
    browser.textAccessor = textAccessor;
    /**
     * Get the current branch or load the branch given in parameter if it is not
     * the current branch
     * @param {string} value
     */
    browser.current_branch = function(value) {
        $.ajax({
            type: "GET",
            dataType: "json",
            url:getTreeFile(value),
            data: {},
            success: function (data, textStatus, xhr) {
                buildIdentifierToElement(data, null);
            }
        });
        return browser;
    };
    return browser;
}

/**
* Build the autocomplete from the edam browser.
* @param {object} the edam browser instance
* @param {str} the target where we should build the autocomplete
*/
function build_autocomplete_from_edam_browser(edam_browser, elt){
    if(typeof elt == "undefined"){
        elt='.search-term';
    }
    var t;

    if($(elt).data('ui-autocomplete') != undefined)
        $(elt).autocomplete("destroy");

    edam_browser.interactive_tree().cmd().forEachElement(
        function(i,elt){
            var uri = edam_browser.identifierAccessor(elt);
            var key = uri.substring(uri.lastIndexOf('/')+1);
            var values =[edam_browser.textAccessor(elt),key];
            if(elt.exact_synonyms) values=values.concat(elt.exact_synonyms);
            if(elt.narrow_synonyms) values=values.concat(elt.narrow_synonyms);
            elt.__autocomplete_from_edam_browser=values.join(' ').toUpperCase();
        }
    );
    function span_matched(match) {
      return '<span class="matched">'+match+'</span>';
    }

    $(elt).autocomplete({
        source : function (request, response) {
            function addIfseedInString(seed,str){ifdata.push(elt)}
            var data=[];
            var tree=edam_browser.interactive_tree().cmd();
            var term=request.term.toUpperCase();
            tree.forEachElement(
                function(i,elt){
                    if (elt.__autocomplete_from_edam_browser.indexOf(term)!=-1)
                        data.push(elt)
                }
            )
            response(data)
        },
        minLength: 2,
        select : function(event, ui){ // lors de la sélection d'une proposition
            $(event.target).attr("data-selected",edam_browser.identifierAccessor(ui.item));
            edam_browser.interactive_tree().cmd.selectElement(edam_browser.identifierAccessor(ui.item),true);
        },
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
        var identifier = edam_browser.identifierAccessor(item);
        identifier = identifier.substring(identifier.lastIndexOf('/')+1);
        var branch = item.deprecated ? "deprecated" : identifier.substring(0,identifier.indexOf("_"));
        var re=new RegExp($(elt).val(), 'ig');
        return $( "<li class=\"autocomplete-entry\">" )
            .append(
                '<div>'+
                '<div>'+
                    '<span style="">'+
                        edam_browser.textAccessor(item).replace(re,span_matched) +
                    '</span>'+
                    '<span style="">'+
                        '<span class="label label-info pull-right bg-edam-'+branch+'" title="'+branch+'">'+
                            identifier.replace(re,span_matched)+
                        '</span>'+
                    '</span>'+
                '</div>'+
                '<div>'+
                    item.definition.replace(re,span_matched)+
                '</div>'+
                '</div>' )
            .appendTo( ul );
    }
    ;
    $(elt).prop('disabled',false);
}