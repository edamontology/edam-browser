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

function build_autocomplete_from_tree(data, elt){
    function identifierAccessor(node){
        if (typeof browser != "undefined")
            return browser.identifierAccessor(node);
        return node.data.uri;
    }
    function textAccessor(node){
        if (typeof browser != "undefined")
            return browser.textAccessor(node);
        return node.text;
    }

    if(typeof elt == "undefined"){
        elt='.search-term';
    }
    var source = [];
    var source_dict = {};
    function traverse(node) {
        var uri = identifierAccessor(node);
        var key = uri.substring(uri.lastIndexOf('/')+1);
        var values =[node.text,key];
        if(node.exact_synonyms) values=values.concat(node.exact_synonyms);
        if(node.narrow_synonyms) values=values.concat(node.narrow_synonyms);
        candidate={
            value : node.text,
            label : values.join(' '),
            key : key,
            node : node,
        }
        source_dict[candidate.key] = candidate;
        if (node.children) {
            $.each(node.children, function(i, child) {
                 traverse(child);
            });
        }
        if (node._children) {
            $.each(node._children, function(i, child) {
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
            $(event.target).attr("data-selected",identifierAccessor(ui.item.node));
            if (typeof browser != "undefined"){
                browser.interactive_tree().cmd.selectElement(browser.identifierAccessor(ui.item.node),true);
            }
        },
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
        var branch = item.key.substring(0,item.key.indexOf("_"));
          return $( "<li>" )
            .append(
                "<div class=\"autocomplete-entry\">"+
                "<b>" + textAccessor(item.node) + "</b>"+
                " ("+item.key+")"+
                "<span class=\"label label-info pull-right\">"+branch+"</span>"+
                "<br>"+
                "<small>"+
                item.node.definition+
                "</small>"+
                "</div>" )
            .appendTo( ul );
    };
    $(elt).prop('disabled',false);
}