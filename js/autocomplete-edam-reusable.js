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
        }
    });
}

function build_autocomplete_from_tree(data, elt){
    if(typeof elt == "undefined"){
        elt='.search-term';
    }
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
                my_tree.cmd.selectElement(ui.item.node.data.uri,true);
            }
        }
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
        var branch = item.key.substring(0,item.key.indexOf("_"));
          return $( "<li>" )
            .append(
                "<div class=\"autocomplete-entry\">"+
                "<b>" + item.node.text + "</b>"+
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