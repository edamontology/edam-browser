function fake_interactive_edam_browser(){
    var identifierToElement={},
        identifierAccessor = function (d) {
            return d.data.uri;
        },
        textAccessor = function (d) {
            if (typeof d.text == "undefined")
                return identifierAccessor(d);
            if (d.text.constructor === Array)
                return d.text[0];
            return d.text;
        },
        interactive_tree=function(){
            return interactive_tree;
        },
        loadingDoneHandler=function(){};

    function buildIdentifierToElement(element,parent) {
        element.parent=parent;
        if(identifierAccessor(element)==="owl:DeprecatedClass"){
            element.deprecated=true;
        }
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
            if (element.deprecated){
                element.children[i].deprecated=true;
            }
            buildIdentifierToElement(element.children[i],element);
        }
    }//end of function buildIdentifierToElement

    /**
     * The browser
     */
    function browser(){}
    /**
     * Read-only accessor to the interactive tree
     * @return {object} the tree
     */
    browser.interactive_tree = interactive_tree;
    /**
     * Accessor to the method launch when the tree has been built
     * @param {function} value - an implementation of function (){...}
     */
    interactive_tree.loadingDoneHandler = function(value) {
        if (!arguments.length) return loadingDoneHandler;
        loadingDoneHandler = value;
        return interactive_tree;
    };
    /**
     * The tree's commands
     */
    function cmd() {
        return cmd;
    }
    interactive_tree.cmd = cmd;
    /**
     * Return the element that have this identifier
     * @return cmd() itself
     */
    cmd.getElementByIdentifier = function (identifier){
        return identifierToElement[identifier];
    };
    /**
     * Iterate over ell the elements of the tree
     * @return cmd() itself
     */
    cmd.forEachElement = function (fcn){
        $.each(identifierToElement,fcn);
        return cmd;
    };
    cmd.selectElement = function(){};
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
                loadingDoneHandler();
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

    function initIndex(){
        edam_browser.interactive_tree().cmd().forEachElement(
            function(i,elt){
                var uri = edam_browser.identifierAccessor(elt);
                var key = uri.substring(uri.lastIndexOf('/')+1);
                var values =[edam_browser.textAccessor(elt),key];
                if(elt.data.definition) values.push(elt.data.definition);
                if(elt.data.exact_synonyms) values=values.concat(elt.data.exact_synonyms);
                if(elt.data.narrow_synonyms) values=values.concat(elt.data.narrow_synonyms);
                elt.__autocomplete_from_edam_browser=values.join(' ').toUpperCase();
            }
        );
    }
    initIndex();
    function span_matched(match) {
      return '<span class="matched">'+match+'</span>';
    }

    $(elt).autocomplete({
        source : function (request, response) {
            var data=[];
            var tree=edam_browser.interactive_tree().cmd();
            var terms=request.term.toUpperCase().split(" ");
            tree.forEachElement(
                function(i,elt){
                    if(typeof elt.__autocomplete_from_edam_browser == "undefined")
                        initIndex();
                    for(var j=0;j<terms.length;j++){
                        if (elt.__autocomplete_from_edam_browser.indexOf(terms[j])==-1)
                            return;
                    }
                    data.push({value:edam_browser.textAccessor(elt),node:elt});
                }
            );
            response(data);
        },
        minLength: 2,
        select : function(event, ui){ // lors de la sélection d'une proposition
            $(event.target).attr("data-selected",edam_browser.identifierAccessor(ui.item.node));
            edam_browser.interactive_tree().cmd.selectElement(edam_browser.identifierAccessor(ui.item.node),true);
        },
        response: function( event, ui ) {
            if (typeof (window.Levenshtein) == "undefined")
                return ;
            var searched = $(event.target).val().toUpperCase(),
                i;
            for (i=0;i<ui.content.length;i++){
                ui.content[i].lev = window.Levenshtein(ui.content[i].label.toUpperCase(),searched);
                                  //+ window.Levenshtein(ui.content[i].node.__autocomplete_from_edam_browser,searched) / 5;
            }
            ui.content.sort(function(a, b) {
              return a.lev - b.lev;
            });
            ui.content.splice(20);
        }
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
        var identifier = edam_browser.identifierAccessor(item.node);
        identifier = identifier.substring(identifier.lastIndexOf('/')+1);
        //var branch = item.deprecated ? "deprecated" : identifier.substring(0,identifier.indexOf("_"));
        var branch = identifier.substring(0,identifier.indexOf("_"));
        var re=new RegExp($(elt).val(), 'ig');
        return $( "<li class=\"autocomplete-entry\">" )
            .append(
                '<div>'+
                '<div>'+
                    '<span style="">'+
                        edam_browser.textAccessor(item.node).replace(re,span_matched) +
                    '</span>'+
                    '<span style="">'+
                        '<span class="label label-info pull-right bg-edam-'+branch+'" title="'+branch+'">'+
                            identifier.replace(re,span_matched)+
                        '</span>'+
                        (item.node.deprecated ?'<span class="label label-info pull-right bg-edam-deprecated">deprecated</span>':'')+
                    '</span>'+
                '</div>'+
                (item.node.data.definition?
                '<div>'+
                    item.node.data.definition.replace(re,span_matched)+
                '</div>':"")+
                '</div>' )
            .appendTo( ul );
    }
    ;
    $(elt).prop('disabled',false);
}