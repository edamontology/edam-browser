function build_interactive_tree(
        target_selector,
        data_url,
){
    chart = interactive_tree()
        .identifierAccessor(function(d){return d.data.uri;})
        .debug(false)
    ;

    d3.select(target_selector).call(chart); // draw chart in div
    chart.data_url(data_url);
    return chart;
}

if (!Array.prototype.remove) {
    Array.prototype.remove = function(val) {
        var i = this.indexOf(val);
        return i>-1 ? this.splice(i, 1) : [];
    };
}


function interactive_tree() {
    var height=800,
        debug=false,
        margin = {top: 10, right: 50, bottom: 10, left: 80},
        voidHandler=function(name){return function(){if(debug)console.log(name);}},
        initiallySelectedNodeHandler = voidHandler("initiallySelectedNodeHandler"),
        addingElementHandler = voidHandler("addingElementHandler"),
        openElementHandler = voidHandler("openElementHandler"),
        clickedElementHandler = voidHandler("clickedElementHandler"),
        removingElementHandler = voidHandler("removingElementHandler"),
        loadingDoneHandler = voidHandler("loadingDoneHandler"),
        removeNodesWithNoSelectedDescendant = false,
        identifierAccessor=function(d){return d.id;},
        textAccessor=function(d) {
            if (typeof d.text == "undefined")
                return identifierAccessor(d);
            if (d.text.constructor === Array)
                return d.text[0];
            return d.text;
        },
        nodeEqualityOverride=function (e,f){return identifierAccessor(e)==identifierAccessor(f);},
        tooltipEnabled=false,
        use_shift_to_open=false,
        use_control_to_open=true,
        use_alt_to_open=false,
        use_shift_to_add=true,
        use_control_to_add=false,
        use_alt_to_add=false,
        uri="",
//      target_selector,
        root,
        treeSelectedNode=[],
        treeSelectedNodeAncestors=null,
        duration = 500,
        update,
        id=0
        identifierToNode={};

    function chart(selection){
        selection.each(function() {
            var tree = d3.layout.tree()
                    .nodeSize([12, 50])
                    .separation(function(a, b) {
                        a_count = a.children ? a.children.length : 1;
                        b_count = b.children ? b.children.length : 1;
                        return ((a_count+b_count)/2) +  (a.parent == b.parent ? 0 : 1);
                    });

            var diagonal = d3.svg.diagonal()
                .projection(function(d) { return [d.y, d.x]; });

            var zoom = d3.behavior.zoom().translate([50,height/2]);
            var vis = d3.select(this).append("svg:svg")
                .attr("width", "100%")
                .attr("height", height + margin.top + margin.bottom)
                .call(zoom.on("zoom", function () {
                    vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
                }))
              .append("svg:g")
                .attr("transform", "translate(" + 50 + "," + height/2 + ")");

            if (tooltipEnabled){
                var tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0)
                    .on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 1);
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                        tooltip.transition()
                        .delay(200)
                        .style("top",  "-200px");
                    });
            }

            update = function (source) {
                if (treeSelectedNodeAncestors == null){
                    refreshTreeSelectedNodeAncestors();
                }
                //var duration = d3.event && d3.event.altKey ? 5000 : 500;

                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse();

                // Normalize for fixed-depth.
                nodes.forEach(function(d) { d.y = d.depth * 180; });

                // Update the nodes…
                var node = vis.selectAll("g.node")
                    .data(nodes, function(d) { return d.id || (d.id = ++id); });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("svg:g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        if (typeof d.parent == "undefined" || d.parent == null)
                            return "translate(0,0)";
                        return "translate(" + d.parent.y + "," + d.parent.x + ")";
                    })
                    .on("click", function(d,i) { handleClick(d);});

                nodeEnter.append("svg:text")
                    .text(textAccessor)
                    .style("fill-opacity", 1e-6);

                nodeEnter.append("svg:circle")
                    .attr("r", 1e-6)
                    .attr("class", function(d) { return d._children || d.children ? "has-children" : ""; })
                    .on("mouseover", function(d) {
                        if (typeof tooltip == "undefined") return;
                        tooltip.transition()
                                .duration(200)
                                .style("opacity", 1);
                        innerUri = d.data.uri.replace("http://edamontology.org","/edamontology").replace("_","/")
                        tooltip
                        .html(
                            "<div class=\"panel panel-default\"><div class=\"panel-heading\">"+
                            d.text+
                            "</div>"+
                            "<div class=\"panel-body\">"+
                            "Definition: "+d.definition+"<br/>"+
                            "URI: "+d.data.uri+"<br/>"+
                            "</div></div>"
                        )
                        .style("left", (d3.event.pageX+20) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                            if (typeof tooltip == "undefined") return;
                            tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
                            tooltip.transition()
                            .delay(200)
                            .style("top",  "-200px");
                    });

                // Transition nodes to their new position.
                var nodeUpdate = node
                    .transition()
                    .duration(duration)
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                    ;

                nodeUpdate.select("circle")
                    .attr("r", 4.5)
                    .attr("class", function(d){
                        if (isNodeSelected(d, treeSelectedNode))
                            return "selected";
                        if (d._children || d.children)
                            return  "has-children";
                        return "";
                    });

                nodeUpdate.select("text")
                    .attr("x", function(d) { return d.children? -10 : 10; })
                    .attr("dy", function(d) { return d.parent && d.children && d.parent.children.length == 1 ? "-0.2em" : ".35em"; })
                    .attr("text-anchor", function(d) { return d.children  ? "end" : "start"; })
                    .style("fill-opacity", '')
                    .style("font-size", '')
                    .attr("class", function(d) { return isNodeSelected(d, treeSelectedNode) ? "selected" : ""; });

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update the links…
                var link = vis.selectAll("path.link")
                    .data(tree.links(nodes), function(d) { return d.target.id; });

                // Enter any new links at the parent's previous position.
                link.enter().insert("svg:path", "g")
                    .attr("d", function(d) {
                        if (typeof d.source == "undefined" || d.source == null)
                            var o = {x: source.x0, y: source.y0};
                        else
                            var o = {x: d.source.x, y: d.source.y};
                        return diagonal({source: o, target: o});
                    })
                    .transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal)
                    .attr("class", function(d){
                        if ($.inArray(d.target, treeSelectedNodeAncestors) > -1)
                            return "link selected";
                        return "link";
                    });

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    })
                  .remove();

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }//end of update(source)

        });//end of selection.each
    }//end of function chart


    // Toggle children.
    function toggle(d) {
        toggleForceExpand(d,false);
    }
    function toggleForceExpand(d,force) {
        if(force && d.children){
            return;
        }
        if (d.children) {// collapse
            d._children = d.children;
            d.children = null;
        } else {// expand
            d.children = d._children;
            d._children = null;
        }
    }//end of toggleForceExpand
    function toggleForceCollapse(d) {
        if (d.children) {// collapse
            d._children = d.children;
            d.children = null;
        }
    }//end of toggleForceCollapse

    //Handle selection of a node
    function handleClick(d){
        if (d3.event.shiftKey && use_shift_to_open
         || d3.event.ctrlKey  && use_control_to_open
         || d3.event.altKey   && use_alt_to_open){
            openElementHandler(d);
        }else if (d3.event.shiftKey && use_shift_to_add
               || d3.event.ctrlKey  && use_control_to_add
               || d3.event.altKey   && use_alt_to_add){
            var i = treeSelectedNode.indexOf(d);
            if(i>-1){
                //removing ?
                attemptToRemoveElement(d);
            }else{
                //adding ?
                attemptToSelectElement(d);
            }
        }else if (!d3.event.shiftKey && !d3.event.ctrlKey && !d3.event.altKey){
            toggle(d);
            clickedElementHandler(d);
        }
        update(d);
    }//end of handleClick

    function attemptToRemoveElement(d){
        if(removingElementHandler(d)!=false){
            treeSelectedNode.splice(i, 1);
            if(d.duplicate){
                for(var i=0;i<treeSelectedNode.length;i++){
                    if(nodeEqualityOverride(treeSelectedNode[i],d)){
                        treeSelectedNode.splice(i, 1);
                        i--;
                    }
                }
            }
            refreshTreeSelectedNodeAncestors();
        }
    }

    function attemptToSelectElement(d){
        if(addingElementHandler(d)!=false){
            if(d.duplicate){
                recursivePush(d,root);
            }else{
                treeSelectedNode.push(d);
            }
            refreshTreeSelectedNodeAncestors();
        }
    }

    function recursivePush(refNode,org) {
        if (nodeEqualityOverride(refNode,org))
            treeSelectedNode.push(org);
        if (org.children)
            for(var i=0;i<org.children.length;i++)
                recursivePush(refNode,org.children[i]);
        if (org._children)
            for(var i=0;i<org._children.length;i++)
                recursivePush(refNode,org._children[i]);
    }//end of recursivePush

    function refreshTreeSelectedNodeAncestors() {
        treeSelectedNodeAncestors=[];
        var candidate;
        for(var i=0;i<treeSelectedNode.length;i++){
            candidate=treeSelectedNode[i];
            while(candidate != null && treeSelectedNodeAncestors.indexOf(candidate)==-1){
                treeSelectedNodeAncestors.push(candidate);
                candidate=candidate.parent;
            }
        }
    }//end of refreshTreeSelectedNodeAncestors

    function parenthood(element,parent) {
        node=identifierToNode[identifierAccessor(element)];
        if (typeof node != "undefined"){
            if (typeof node.duplicate == "undefined")
                node.duplicate=[];
            node.duplicate.push(element);
        }else{
            identifierToNode[identifierAccessor(element)]=element;
        }
        element.parent=parent;
        if (element.children) {
            for(var i=0;i<element.children.length;i++){
                parenthood(element.children[i],element);
            }
        }
    }//end of function parenthood

    function shouldRemoveThisNodesAsItHasNoSelectedDescendant(element) {
        var b=true;
        if (element.children) {
            for(var i=0;i<element.children.length;i++){
                if(shouldRemoveThisNodesAsItHasNoSelectedDescendant(element.children[i])){
                    element.children.splice(i, 1);
                    i--;
                }else{
                    b=false;
                }
            }
            if(element.children.length==0){
                element.children=null;
            }
        }
        b = b && !initiallySelectedNodeHandler(element);
        if(b){
            element.children=null;
            element._children=null;
        }
        return b;
    }//end of function shouldRemoveThisNodesAsItHasNoSelectedDescendant

    function expandToFromElement(identifier, element, alsoSelectedIt) {
        var b=false;
        if(identifier==identifierAccessor(element)){
            if (alsoSelectedIt)
                attemptToSelectElement(node);
            return true;
        }
        if (element.children) {
            var ch=element.children;
            for(var i=0;i<ch.length;i++){
                if(expandToFromElement(identifier, ch[i], alsoSelectedIt)){
                    toggleForceExpand(element, true);
                    b=true;//return true;
                }
            }
        }else
        if (element._children) {
            var ch=element._children;
            for(var i=0;i<ch.length;i++){
                if(expandToFromElement(identifier, ch[i], alsoSelectedIt)){
                    toggleForceExpand(element, true);
                    b=true;//return true;
                }
            }
        }
        return b;
    }//end of expandToFromElement

    function isNodeSelected(node){
        return $.inArray(node, treeSelectedNode) > -1;
    }//end of isNodeSelected

    function collapseNotSelectedNode(node){
        var hasSelectedDescendant=false;
        if (node.children) {
            for(var i=0;i<node.children.length;i++){
                if(collapseNotSelectedNode(node.children[i])){
                    hasSelectedDescendant=true;
                }
            }
        }
        if(!hasSelectedDescendant)
            toggleForceCollapse(node);
        if(isNodeSelected(node))
            return true;
        return hasSelectedDescendant;
    }//end of collapseNotSelectedNode

    //accessors
    function cmd() {
        return cmd;
    };
    cmd.expandToNode = function (identifier) {
        expandToFromElement(identifier,root);
        update(root);
        return cmd;
    };
    cmd.selectNode = function (identifier, status, andExpand) {
        if (typeof status == "undefined"){
            return isNodeSelected()
        }
        node=identifierToNode[identifier];
        if (status)
            expandToFromElement(identifier,root,true);
        else
            attemptToRemoveElement(node);
        update(node);
        return cmd;
    };
    cmd.collapseNotSelectedNode = function (){
        collapseNotSelectedNode(root);
        update(root);
        return cmd;
    }

    // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
    chart.cmd = cmd;
    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };
    chart.debug = function(value) {
        if (!arguments.length) return debug;
        debug = value;
        return chart;
    };
    chart.use_shift_to_open = function(value) {
        if (!arguments.length) return use_shift_to_open;
        use_shift_to_open = value;
        return chart;
    };
    chart.use_control_to_open = function(value) {
        if (!arguments.length) return use_control_to_open;
        use_control_to_open = value;
        return chart;
    };
    chart.use_alt_to_open = function(value) {
        if (!arguments.length) return use_alt_to_open;
        use_alt_to_open = value;
        return chart;
    };
    chart.use_shift_to_add = function(value) {
        if (!arguments.length) return use_shift_to_add;
        use_shift_to_add = value;
        return chart;
    };
    chart.use_control_to_add = function(value) {
        if (!arguments.length) return use_control_to_add;
        use_control_to_add = value;
        return chart;
    };
    chart.use_alt_to_add = function(value) {
        if (!arguments.length) return use_alt_to_add;
        use_alt_to_add = value;
        return chart;
    };
    chart.textAccessor = function(value) {
        if (!arguments.length) return textAccessor;
        textAccessor = value;
        return chart;
    };
    chart.identifierAccessor = function(value) {
        if (!arguments.length) return identifierAccessor;
        identifierAccessor = value;
        return chart;
    };
    chart.data_url = function(value) {
        if (!arguments.length) return;

        d3.json(value, function(json) {
                root = json;
                root.x0 = height / 2;
                root.y0 = 0;

                parenthood(root,null);

                if(removeNodesWithNoSelectedDescendant){
                    shouldRemoveThisNodesAsItHasNoSelectedDescendant(root);
                }
                collapseNotSelectedNode(root);

                update(root);
                loadingDoneHandler();
            }
        );
        return chart;
    };



    return chart;
}