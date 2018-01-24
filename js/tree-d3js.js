/*displayEdam("#tree",
	    "/rainbio/getDescendantForEdamNode?uri=http%3A%2F%2Fedamontology.org%2Ftopic_3070",
	    function(e){
	        console.log("added element: "+e);
	        return true;
	    },
	    function(e){
	        console.log("removed element: "+e);
	        return true;
	    },
	    function(e){
	        console.log("Loading done"+e);
	        return true;
	    });
*/

if (!Array.prototype.remove) {
    Array.prototype.remove = function(val) {
        var i = this.indexOf(val);
        return i>-1 ? this.splice(i, 1) : [];
    };
}

function displayTreeReadOnly(targetId,uriToLoad,initiallySelectedNodeHandler){
    displayTree(targetId,uriToLoad,{
    "initiallySelectedNodeHandler":initiallySelectedNodeHandler,
    "addingElementHandler":function (e){return false;},
    "removingElementHandler":function (e){return false;},
    "removeNodesWithNoSelectedDescendant":false
    });
}

function displayTree(targetId,uriToLoad,handlers,properties){
    if(typeof handlers == "undefined")
        handlers={};
    if(typeof properties == "undefined")
        properties={"use_tooltip":true};
    if(typeof properties["use_control_to_add"]  == "undefined") properties["use_control_to_add"] =false;
    if(typeof properties["use_shift_to_add"]    == "undefined") properties["use_shift_to_add"]   = true;
    if(typeof properties["use_alt_to_add"]      == "undefined") properties["use_alt_to_add"]     =false;
    if(typeof properties["use_control_to_open"] == "undefined") properties["use_control_to_open"]= true;
    if(typeof properties["use_shift_to_open"]   == "undefined") properties["use_shift_to_open"]  =false;
    if(typeof properties["use_alt_to_open"]     == "undefined") properties["use_alt_to_open"]    =false;

    var voidHandler=function(){};
    var initiallySelectedNodeHandler = voidHandler;
    var addingElementHandler = voidHandler;
    var openElementHandler = voidHandler;
    var selectedElementHandler = voidHandler;
    var removingElementHandler = voidHandler;
    var loadingDoneHandler = voidHandler;
    var initiallySelectedNodeHandler = handlers["initiallySelectedNodeHandler"];
    var addingElementHandler = handlers["addingElementHandler"];
    var openElementHandler = handlers["openElementHandler"];
    var selectedElementHandler = handlers["selectedElementHandler"];
    var removingElementHandler = handlers["removingElementHandler"];
    var loadingDoneHandler = handlers["loadingDoneHandler"];
    var nodeEqualityOverride = handlers["nodeEqualityOverride"];
    var getHeight = handlers["getHeight"];
    var removeNodesWithNoSelectedDescendant = typeof handlers["removeNodesWithNoSelectedDescendant"] != "undefined" && handlers["removeNodesWithNoSelectedDescendant"];
    if(typeof nodeEqualityOverride == "undefined")
        nodeEqualityOverride=function (e,f){return e==f;}
    if(typeof getHeight == "undefined")
        getHeight=function (){return 800;}
    var t0 = performance.now();
    var m = [10, 50, 10, 80],
        w = 200 - m[1] - m[3],
        h = getHeight() - m[0] - m[2],
        i = 0,
        root,
        treeSelectedNode=[],
        treeSelectedNodeAncestors=null,
        duration = 500;
    /*var m = [20, 120, 20, 120],
        w = 1280 - m[1] - m[3],
        h = 800 - m[0] - m[2],
        i = 0,
        root;*/

    var tree = d3.layout.tree()
            .nodeSize([12, 50])
            .separation(function(a, b) {
                a_count = a.children ? a.children.length : 1;
                b_count = b.children ? b.children.length : 1;
                //child_mult=a.children || b.children ? 3 : 1;
                return ((a_count+b_count)/2) +  (a.parent == b.parent ? 0 : 1);
            });

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

    var zoom = d3.behavior.zoom().translate([50,h/2]);
    var vis = d3.select(targetId).append("svg:svg")
        .attr("width", "100%")
        .attr("height", h + m[0] + m[2])
        .call(zoom.on("zoom", function () {
            vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        }))
      .append("svg:g")
        .attr("transform", "translate(" + 50 + "," + h/2 + ")");

    if (properties["use_tooltip"])
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


    var loading=vis.append("svg:text")
        .attr("x", w/2)
        .attr("text-anchor", "middle")
        .text("loading")
        .style("fill-opacity", 1)
        .style("font-size", "20")
        .style("font-weight","bold")
        .style("fill","#666");

        function update(source) {
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
                .data(nodes, function(d) { return d.id || (d.id = ++i); });

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
                //.attr("dy", ".35em")
                //.attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                //.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                //.attr("x",  10)
                //.attr("text-anchor", "start")
                //.attr("y", -10)
                //.attr("text-anchor", "middle")
                .text(function(d) {
                    if (typeof d.text == "undefined")
                        return d.uri;
                    if (d.text.constructor === Array)
                        return d.text[0];
                    return d.text;
                })
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
                    if ($.inArray(d, treeSelectedNode) > -1)
                        return "selected";
                    if (d._children || d.children)
                        return  "has-children";
                    return "";
                });

            nodeUpdate.select("text")
                .attr("x", function(d) { return d.children? -10 : 10; })
                .attr("dy", function(d) { return d.parent && d.children && d.parent.children.length == 1 ? "-0.2em" : ".35em"; })
                .attr("text-anchor", function(d) { return d.children  ? "end" : "start"; })
                .style("fill-opacity", 1)
                .style("font-size", "12")
                .style("font-weight", function(d) { return  $.inArray(d, treeSelectedNode) > -1 ? "bold" : "normal"; });

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
    }

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
    }
    function toggleForceCollapse(d) {
        if (d.children) {// collapse
            d._children = d.children;
            d.children = null;
        }
    }

    //Handle selection of a node
    function handleClick(d){
        if (d3.event.shiftKey && properties["use_shift_to_open"]
         || d3.event.ctrlKey  && properties["use_control_to_open"]
         || d3.event.altKey   && properties["use_alt_to_open"]){
            openElementHandler(d);
        }else if (d3.event.shiftKey && properties["use_shift_to_add"]
               || d3.event.ctrlKey  && properties["use_control_to_add"]
               || d3.event.altKey   && properties["use_alt_to_add"]){
            var i = treeSelectedNode.indexOf(d);
            if(i>-1){
                //removing ?
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
                }
            }else{
                //adding ?
                if(addingElementHandler(d)!=false){
                    if(d.duplicate){
                        recursivePush(d,root);
                    }else{
                        treeSelectedNode.push(d);
                    }
                }
            }
        }else if (!d3.event.shiftKey && !d3.event.ctrlKey && !d3.event.altKey){
            toggle(d);
            selectedElementHandler(d);
        }
        update(d);
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
    }

    function openBySomething(element,searchedStuff, getteur) {
        var b=false;
        if(searchedStuff==getteur(element)){
            addingElementHandler(element);
            if(treeSelectedNode.indexOf(element)==-1)
                treeSelectedNode.push(element);
            return true;
        }
        if (element.children) {
            var ch=element.children;
            for(var i=0;i<ch.length;i++){
                if(openBySomething(ch[i], searchedStuff, getteur)){
                    toggleForceExpand(element,true);
                    b=true;//return true;
                }
            }
        }else
        if (element._children) {
            var ch=element._children;
            for(var i=0;i<ch.length;i++){
                if(openBySomething(ch[i], searchedStuff, getteur)){
                    toggleForceExpand(element,true);
                    b=true;//return true;
                }
            }
        }
        return b;
    }

    function removeByText(searchedName, alsoClose) {
        for(var i=0;i<treeSelectedNode.length;i++){
            if(searchedName==treeSelectedNode[i].text){
                removingElementHandler(treeSelectedNode[i]);
                if (alsoClose==true){
                    toggleForceCollapse(treeSelectedNode[i]);
                }
                treeSelectedNode.splice(i, 1);
                i--;
            }
        }
        refreshTreeSelectedNodeAncestors();
        update(root);
    }

    function removeByURI(uri,alsoClose) {
        for(var i=0;i<treeSelectedNode.length;i++){
            if(uri==treeSelectedNode[i].data.uri){
                removingElementHandler(treeSelectedNode[i]);
                if (alsoClose==true){
                    toggleForceCollapse(treeSelectedNode[i]);
                }
                treeSelectedNode.splice(i, 1);
                i--;
            }
        }
        refreshTreeSelectedNodeAncestors();
        update(root);
    }

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
    }

    var returnedTree = {
        openByText : function (searchedName) {
            if(openBySomething(root,searchedName,function(element){return element.text;})){
                refreshTreeSelectedNodeAncestors();
                update(root);
                return true;
            };
            return false;
        },
        openByURI : function (uri) {
            if(openBySomething(root,uri,function(element){return element.data.uri;})){
                refreshTreeSelectedNodeAncestors();
                update(root);
                return true;
            };
            return false;
        },
        closeByText : function (searchedName) {
            removeByText(searchedName,true);
        },
        closeByURI : function (uri) {
            removeByURI(uri,true);
        },
        removeByText : removeByText,
        removeByURI : removeByURI
    }

    d3.json(
        //"/static/d3/flare.json"
        //"/static/d3/biology.json"
        //"/static/d3/biology.json"
        //"/rainbio/getDescendantForEdamNode?uri=http%3A%2F%2Fedamontology.org%2Ftopic_3070"
        uriToLoad
        , function(json) {
            loading
            .transition()
            .duration(duration/2)
            .style("fill-opacity", 1e-6)
            .remove();
            root = json;
            root.x0 = h / 2;
            root.y0 = 0;


            function parenthood(element,parent) {
                element.parent=parent;
                if (element.children) {
                    for(var i=0;i<element.children.length;i++){
                        parenthood(element.children[i],element);
                    }
                }
            }
            parenthood(root,null);


            //Initialize the display : hide all node, and how root only
            //function toggleAll(d) {
            //    if (d.children) {
            //        d.children.forEach(toggleAll);
            //        toggle(d);
            //    }
            //}
            //root.children.forEach(toggleAll);

            if(removeNodesWithNoSelectedDescendant){
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
                }
                shouldRemoveThisNodesAsItHasNoSelectedDescendant(root);
            }

            function toggleNotSelected(element) {
                var b=false;
                if (element.children) {
                    for(var i=0;i<element.children.length;i++){
                        b=toggleNotSelected(element.children[i]) || b;
                    }
                }
                if(!b)
                    toggle(element);
                if(initiallySelectedNodeHandler(element)){
                    addingElementHandler(element);
                    treeSelectedNode.push(element);
                    b=true;
                }
                return b;
            }
            toggleNotSelected(root);


            //toggle(root);
            //toggle(root.children[0],true);
            //toggle(root.children[0].children[2],true);
            //toggle(root.children[0].children[2].parent);

            update(root);
            var t1 = performance.now();
            console.log("Tree creation took " + (t1 - t0) + " milliseconds.")
            loadingDoneHandler(returnedTree);
        }
    );

    return returnedTree;
}
