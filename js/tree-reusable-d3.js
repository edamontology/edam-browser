/**
 * Build an interactive tree
 * @return {object} the tree
 */
function interactive_tree() {
    var height=800,
        debug=false,
        margin = {top: 10, right: 50, bottom: 10, left: 80},
        voidHandler=function(name){return function(){if(debug)console.log(name);}},
        initiallySelectedElementHandler = voidHandler("initiallySelectedElementHandler"),
        addingElementHandler = voidHandler("addingElementHandler"),
        openElementHandler = voidHandler("openElementHandler"),
        clickedElementHandler = function(d){if(debug)console.log(identifierAccessor(d))},
        removingElementHandler = voidHandler("removingElementHandler"),
        loadingDoneHandler = voidHandler("loadingDoneHandler"),
        metaInformationHandler = voidHandler("metaInformationHandler"),
        removeElementsWithNoSelectedDescendant = false,
        sortChildren = false,
        identifierAccessor=function(d){return d.id;},
        textAccessor=function(d) {
            if (typeof d.text == "undefined")
                return identifierAccessor(d);
            if (d.text.constructor === Array)
                return d.text[0];
            return d.text;
        },
        elementEquality=function (e,f){return identifierAccessor(e)==identifierAccessor(f);},
        tooltipBuilder=function(d) {
            return  "<div class=\"panel panel-default card\"><div class=\"panel-heading\">"+
                    textAccessor(d)+
                    "</div>"+
                    "<div class=\"panel-body\">"+
                    "Identifier: "+identifierAccessor(d)+
                    "</div></div>"
        },
        tooltipEnabled=false,
        use_shift_to_open=false,
        use_control_to_open=true,
        use_alt_to_open=false,
        use_shift_to_add=true,
        use_control_to_add=false,
        use_alt_to_add=false,
        target_selector=null,
        data_url=null,
        root,
        treeSelectedElement=[],
        treeSelectedElementAncestors=null,
        duration = 500,
        update,
        reset,
        id=0
        identifierToElement={};

    function chart(selection){
        selection.each(function() {
            target_selector=this;
            var tree = d3.layout.tree()
                    .nodeSize([12, 50])
                    .separation(function(a, b) {
                        a_count = a.children ? a.children.length : 1;
                        b_count = b.children ? b.children.length : 1;
                        return ((a_count+b_count)/2) +  (a.parent == b.parent ? 0 : 1);
                    });

            var diagonal = d3.svg.diagonal()
                .projection(function(d) { return [d.y, d.x]; });

            var zoom = d3.behavior.zoom();
            var vis = d3.select(this).append("svg:svg")
                .attr("width", "100%")
                .attr("height", height + margin.top + margin.bottom)
                .call(zoom.on("zoom", function () {
                    vis.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
                }))
              .append("svg:g");

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

            reset = function(){
                zoom.translate([50,height/2]).scale(1);
                d3.select(target_selector)
                    .select("svg>g")
                    .attr("transform", "translate(" + 50 + "," + height/2 + ")");
            }

            update = function (source) {
                if (treeSelectedElementAncestors == null){
                    refreshTreeSelectedElementAncestors();
                }
                //var duration = d3.event && d3.event.altKey ? 5000 : 500;

                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse();

                // Normalize for fixed-depth.
                nodes.forEach(function(d) { d.y = d.depth * 180; });

                // Update the nodes…
                var node = vis.selectAll("g.node")
                    .data(nodes, function(d) { return d.__d3js_id || (d.__d3js_id = ++id); });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("svg:g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    })
                    .on("click", function(d,i) { handleClick(d);});

                nodeEnter.append("svg:text")
                    .text(textAccessor)
                    .style("fill-opacity", 1e-6);

                nodeEnter.append("svg:circle")
                    .attr("r", 1e-6)
                    .attr("class", function(d) { return d._children || d.children ? "has-children" : ""; })
                    .on("mouseover", function(d) {
                        if (!tooltipEnabled) return;
                        tooltip
                            .transition()
                            .duration(200)
                            .style("opacity", 1);
                        tooltip
                            .html(tooltipBuilder(d))
                            .style("left", (d3.event.pageX+20) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                            tooltip
                                .transition()
                                .duration(200)
                                .style("opacity", 0);
                            tooltip
                                .transition()
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
                        if (isElementSelected(d, treeSelectedElement))
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
                    .attr("class", function(d) { return isElementSelected(d, treeSelectedElement) ? "selected" : ""; });

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                     })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update the links…
                var link = vis.selectAll("path.link")
                    .data(tree.links(nodes), function(d) { return d.target.__d3js_id; });

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    })
                  .remove();

                // Enter any new links at the parent's previous position.
                link.enter().insert("svg:path", "g")
                    .attr("data-id", function(d) { return d.target.__d3js_id; })
                    .attr("d", function(d) {
                        var o = {x: source.x0, y: source.y0};
                        return diagonal({source: o, target: o});
                    })
                    .attr("class","link");

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal)
                    .attr("class", function(d){
                        if ($.inArray(d.target, treeSelectedElementAncestors) > -1)
                            return "link selected";
                        return "link";
                    });

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }//end of update(source)

            if(data_url!=null){
                reset();
                update(root);
                loadingDoneHandler();
            }

        });//end of selection.each
    }//end of function chart

    // Toggle children.
    function toggle(d) {
        if (d.children) {// collapse
            d._children = d.children;
            d.children = null;
        } else {// expand
            d.children = d._children;
            d._children = null;
        }
    }//end of toggle
    function toggleForceExpand(d) {
        if(d.children)
            return;
        toggle(d);
    }//end of toggleForceExpand
    function toggleForceCollapse(d) {
        if(d._children)
            return;
        toggle(d);
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
            var pos = treeSelectedElement.indexOf(d);
            if(i>-1){
                //removing ?
                attemptToRemoveElement(d, pos);
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

    function attemptToRemoveElement(d, pos){
        if(typeof pos == "undefined" || pos == -1)
            pos = treeSelectedElement.indexOf(d);
        if(removingElementHandler(d)!=false){
            treeSelectedElement.splice(pos, 1);
            if(d.duplicate){
                for(var i=pos;i<treeSelectedElement.length;i++){
                    if(elementEquality(treeSelectedElement[i],d)){
                        treeSelectedElement.splice(i, 1);
                        i--;
                    }
                }
            }
            refreshTreeSelectedElementAncestors();
        }
    }//end of attemptToRemoveElement

    function attemptToSelectElement(d){
        if(addingElementHandler(d)!=false){
            if(d.duplicate){
                recursivePush(d,root);
            }else{
                treeSelectedElement.push(d);
            }
            refreshTreeSelectedElementAncestors();
        }
    }//end of attemptToSelectElement

    function recursivePush(refElement,org) {
        if (elementEquality(refElement,org))
            treeSelectedElement.push(org);
        if (org.children)
            for(var i=0;i<org.children.length;i++)
                recursivePush(refElement,org.children[i]);
        if (org._children)
            for(var i=0;i<org._children.length;i++)
                recursivePush(refElement,org._children[i]);
    }//end of recursivePush

    function refreshTreeSelectedElementAncestors() {
        treeSelectedElementAncestors=[];
        var candidate;
        for(var i=0;i<treeSelectedElement.length;i++){
            candidate=treeSelectedElement[i];
            while(candidate != null && treeSelectedElementAncestors.indexOf(candidate)==-1){
                treeSelectedElementAncestors.push(candidate);
                candidate=candidate.parent;
            }
        }
    }//end of refreshTreeSelectedElementAncestors

    function parenthood(element,parent) {
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
        if (element.children) {
            if (sortChildren) {
                element.children.sort(
                    function (a,b) {
                        a=textAccessor(a);
                        b=textAccessor(b)
                        if (a < b)
                            return -1;
                        if (a > b)
                            return 1;
                        return 0;
                    }
                );
            }
            for(var i=0;i<element.children.length;i++){
                parenthood(element.children[i],element);
            }
        }
        if (initiallySelectedElementHandler(element)){
            treeSelectedElement.push(element);
        }
    }//end of function parenthood

    function shouldRemoveThisElementsAsItHasNoSelectedDescendant(element) {
        var b=true;
        if (element.children) {
            for(var i=0;i<element.children.length;i++){
                if(shouldRemoveThisElementsAsItHasNoSelectedDescendant(element.children[i])){
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
        b = b && !initiallySelectedElementHandler(element);
        if(b){
            element.children=null;
            element._children=null;
        }
        return b;
    }//end of function shouldRemoveThisElementsAsItHasNoSelectedDescendant

    function browseToFromElement(identifier, element, selectedIt, expandToIt) {
        var b=false;
        if(identifier==identifierAccessor(element)){
            if (selectedIt)
                attemptToSelectElement(element);
            return true;
        }
        if (element.children) {
            var ch=element.children;
            for(var i=0;i<ch.length;i++){
                if(browseToFromElement(identifier, ch[i], selectedIt, expandToIt)){
                    if (expandToIt)
                        toggleForceExpand(element);
                    b=true;//return true;
                }
            }
        }else
        if (element._children) {
            var ch=element._children;
            for(var i=0;i<ch.length;i++){
                if(browseToFromElement(identifier, ch[i], selectedIt, expandToIt)){
                    if (expandToIt)
                        toggleForceExpand(element);
                    b=true;//return true;
                }
            }
        }
        return b;
    }//end of browseToFromElement

    function isElementSelected(node){
        return $.inArray(node, treeSelectedElement) > -1;
    }//end of isElementSelected

    function collapseNotSelectedElement(node){
        var hasSelectedDescendant=false;
        if (node.children) {
            for(var i=0;i<node.children.length;i++){
                if(collapseNotSelectedElement(node.children[i])){
                    hasSelectedDescendant=true;
                }
            }
        }
        if(!hasSelectedDescendant)
            toggleForceCollapse(node);
        if(isElementSelected(node))
            return true;
        return hasSelectedDescendant;
    }//end of collapseNotSelectedElement

    function expandSelectedElement(node){
        var hasSelectedDescendant=false;
        if (node._children) {
            for(var i=0;i<node._children.length;i++){
                if(expandSelectedElement(node._children[i])){
                    hasSelectedDescendant=true;
                }
            }
        }else if (node.children) {
            for(var i=0;i<node.children.length;i++){
                if(expandSelectedElement(node.children[i])){
                    hasSelectedDescendant=true;
                }
            }
        }
        if(hasSelectedDescendant){
            console.log("Ex:"+node);
            toggleForceExpand(node);
        }
        if(isElementSelected(node))
            return true;
        return hasSelectedDescendant;
    }//end of expandSelectedElement

    function getFartherAncestorCollapsed(node){
        var source=node;
        var pointer=node;
        while(pointer.parent){
            if(pointer._children)
                source=pointer;
            pointer=pointer.parent;
        }
        return source
    }//end of getFartherAncestorCollapsed

    function initTreeAndTriggerUpdate(){
        treeSelectedElement=[];
        treeSelectedElementAncestors=[];
        metaInformationHandler(root.meta)
        root.x0 = 0;
        root.y0 = 0;

        parenthood(root,null);

        if(removeElementsWithNoSelectedDescendant){
            shouldRemoveThisElementsAsItHasNoSelectedDescendant(root);
        }
        collapseNotSelectedElement(root);

        if(update){
            reset();
            update(root);
            loadingDoneHandler();
        }
    }

    //accessors
    function cmd() {
        return cmd;
    };
    /**
     * Ask to expand to element identified by identifier
     * @param {string} identifier - the element identifier that is returned by identifierAccessor
     * @return cmd() itself
     */
    cmd.collapseElement = function (identifier) {
        toggleForceCollapse(identifierToElement[identifier]);
        update(root);
        return cmd;
    };
    /**
     * Ask to collapse an element
     * @param {string} identifier - the element identifier that is returned by identifierAccessor
     * @return cmd() itself
     */
    cmd.expandElement = function (identifier) {
        var source=getFartherAncestorCollapsed(identifierToElement[identifier]);
        browseToFromElement(identifier, root, false, true);
        update(source);
        return cmd;
    };
    /**
     * Add/remove elements identified by the identifier depending of the boolean status, and expand to selected element(s) when asked
     * @param {string} identifier - the element identifier that is returned by identifierAccessor
     * @param {boolean} status - true to add, false to remove
     * @param {boolean} [andExpand=true] - expand to selected element(s)
     * @return cmd() itself
     */
    cmd.selectElement = function (identifier, status, andExpand) {
        var node=identifierToElement[identifier];
        if (typeof node == "undefined")
            return cmd;
        var source=getFartherAncestorCollapsed(node);
        if (status)
            browseToFromElement(identifier, root, true, typeof andExpand == "undefined" || andExpand);
        else
            attemptToRemoveElement(node);
        update(source);
        return cmd;
    };
    /**
     *
     * @param {string} identifier - the element identifier that is returned by identifierAccessor
     * @return {boolean} true is the element is selected
     */
    cmd.isElementSelected = function (identifier) {
        return isElementSelected(identifierToElement[identifier]);
    };
    /**
     * Ask to de-select all elements
     * @param {boolean} [redraw=true] - redraw the tree
     * @return cmd() itself
     */
    cmd.clearSelectedElements = function (redraw) {
        treeSelectedElement=[];
        refreshTreeSelectedElementAncestors();
        if(redraw!=false)
            update(root);
        return cmd;
    };
    /**
     * Ask to collapse all elements that have no selected descendants
     * @return cmd() itself
     */
    cmd.collapseNotSelectedElement = function (){
        collapseNotSelectedElement(root);
        update(root);
        return cmd;
    }
    /**
     * Ask to expand to all selected elements
     * @return cmd() itself
     */
    cmd.expandSelectedElement = function (){
        expandSelectedElement(root);
        update(root);
        return cmd;
    }

    // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
    chart.cmd = cmd;
    /**
     * Accessor configuring the height of the svg containing the tree
     * @param {boolean} value
     */
    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };
    /**
     * Accessor configuring the animation's duration
     * @param {boolean} value
     */
    chart.duration = function(value) {
        if (!arguments.length) return duration;
        duration = value;
        return chart;
    };
    /**
     * Accessor configuring if debug message should be displayed
     * @param {boolean} value
     */
    chart.debug = function(value) {
        if (!arguments.length) return debug;
        debug = value;
        return chart;
    };
    /**
     * Accessor configuring if the tooltip should be displayed
     * @param {boolean} value
     */
    chart.tooltipEnabled = function(value) {
        if (!arguments.length) return tooltipEnabled;
        tooltipEnabled = value;
        return chart;
    };
    /**
     * Accessor configuring if the children should be sorted
     * @param {boolean} value
     */
    chart.sortChildren = function(value) {
        if (!arguments.length) return sortChildren;
        sortChildren = value;
        return chart;
    };
    /**
     * Accessor configuring if shift key should be used to open externally an element
     * @param {boolean} [value=false]
     */
    chart.use_shift_to_open = function(value) {
        if (!arguments.length) return use_shift_to_open;
        use_shift_to_open = value;
        return chart;
    };
    /**
     * Accessor configuring if alt control should be used to open externally an element
     * @param {boolean} [value=true]
     */
    chart.use_control_to_open = function(value) {
        if (!arguments.length) return use_control_to_open;
        use_control_to_open = value;
        return chart;
    };
    /**
     * Accessor configuring if alt key should be used to open externally an element
     * @param {boolean} [value=false]
     */
    chart.use_alt_to_open = function(value) {
        if (!arguments.length) return use_alt_to_open;
        use_alt_to_open = value;
        return chart;
    };
    /**
     * Accessor configuring if shift key should be used to add/remove an element to/from selection
     * @param {boolean} [value=true]
     */
    chart.use_shift_to_add = function(value) {
        if (!arguments.length) return use_shift_to_add;
        use_shift_to_add = value;
        return chart;
    };
    /**
     * Accessor configuring if control key should be used to add/remove an element to/from selection
     * @param {boolean} [value=false]
     */
    chart.use_control_to_add = function(value) {
        if (!arguments.length) return use_control_to_add;
        use_control_to_add = value;
        return chart;
    };
    /**
     * Accessor configuring if alt key should be used to add/remove an element to/from selection
     * @param {boolean} [value=false]
     */
    chart.use_alt_to_add = function(value) {
        if (!arguments.length) return use_alt_to_add;
        use_alt_to_add = value;
        return chart;
    };
    /**
     * Accessor to the url where the json formatted tree can be found
     * @param {string} value - a valid url
     */
    chart.data_url = function(value) {
        if (!arguments.length) return data_url;
        data_url = value;
        d3.json(value, function(json) {
                if(typeof json["meta"]=="undefined"){
                    json["meta"]={};
                }
                json["meta"]["data_url"]=data_url;
                chart.data(json)
            }
        );
        return chart;
    };
    /**
     * Accessor to the url where the json formatted tree can be found
     * @param {string} value - a valid url
     */
    chart.data = function(value) {
        if (!arguments.length) return root;
        root = value;
        initTreeAndTriggerUpdate()
        return chart;
    };
    /**
     * Accessor to the method returning the text of an element (toString)
     * @param {function} value - an implementation of function (a){...} returning the text
     */
    chart.textAccessor = function(value) {
        if (!arguments.length) return textAccessor;
        textAccessor = value;
        return chart;
    };
    /**
     * Accessor to the method returning the identifier of an element
     * @param {function} value - an implementation of function (a){...} returning the identifier
     */
    chart.identifierAccessor = function(value) {
        if (!arguments.length) return identifierAccessor;
        identifierAccessor = value;
        return chart;
    };
    /**
     * Accessor to the method building the tooltip of an element
     * @param {function} value - an implementation of function (d){...} returning the html code contained in the tooltip
     */
    chart.tooltipBuilder = function(value) {
        if (!arguments.length) return tooltipBuilder;
        tooltipBuilder = value;
        return chart;
    };
    /**
     * Accessor to the method testing if an element is initially selected
     * @param {function} value - an implementation of function (d){...} returning true if the element is initially selected
     */
    chart.initiallySelectedElementHandler = function(value) {
        if (!arguments.length) return initiallySelectedElementHandler;
        initiallySelectedElementHandler = value;
        return chart;
    };
    /**
     * Accessor to the method testing the validity of the selection of an element
     * @param {function} value - an implementation of function (d){...} returning true if the element can be selected
     */
    chart.addingElementHandler = function(value) {
        if (!arguments.length) return addingElementHandler;
        addingElementHandler = value;
        return chart;
    };
    /**
     * Accessor to the method launch when an element have been requested to open externally
     * @param {function} value - an implementation of function (d){...}
     */
    chart.openElementHandler = function(value) {
        if (!arguments.length) return openElementHandler;
        openElementHandler = value;
        return chart;
    };
    /**
     * Accessor to the method launch when an element have been clicked
     * @param {function} value - an implementation of function (){...}
     */
    chart.clickedElementHandler = function(value) {
        if (!arguments.length) return clickedElementHandler;
        clickedElementHandler = value;
        return chart;
    };
    /**
     * Accessor to the method testing the validity of the deselection of an element
     * @param {function} value - an implementation of function (d){...} returning true if the element can be deselected
     */
    chart.removingElementHandler = function(value) {
        if (!arguments.length) return removingElementHandler;
        removingElementHandler = value;
        return chart;
    };
    /**
     * Accessor to the method launch when the tree has been built
     * @param {function} value - an implementation of function (){...}
     */
    chart.loadingDoneHandler = function(value) {
        if (!arguments.length) return loadingDoneHandler;
        loadingDoneHandler = value;
        return chart;
    };
    /**
     * Accessor to the method launch when a tree is being loaded with the meta information fetched from the root element
     * @param {function} value - an implementation of function (meta){...}
     */
    chart.metaInformationHandler = function(value) {
        if (!arguments.length) return metaInformationHandler;
        metaInformationHandler = value;
        return chart;
    };
    /**
     * Accessor to the method testing equality between two nodes
     * @param {function} value - an implementation of function (a,b){...} returning true if a and b are equals
     */
    chart.elementEquality = function(value) {
        if (!arguments.length) return elementEquality;
        elementEquality = value;
        return chart;
    };
    return chart;
}