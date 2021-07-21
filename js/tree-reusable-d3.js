import * as d3 from 'd3'
import { getCookie } from './utils.js';
import { jsonTreeFromURL } from "edam2json-js";


/**
 * Build an interactive tree
 * @return {object} the tree
 */

var interactive_tree = function() {
    var debug=false,
        margin = {top: 10, right: 50, bottom: 10, left: 80},
        voidHandler=function(name){return function(){if(debug)console.log(name);};},
        voidHandlerStrBlank=function(name){return function(){if(debug)console.log(name);return"";};},
        initiallySelectedElementHandler = voidHandler("initiallySelectedElementHandler"),
        addingElementHandler = voidHandler("addingElementHandler"),
        openElementHandler = voidHandler("openElementHandler"),
        clickedElementHandler = function(d){if(debug)console.log(identifierAccessor(d));},
        removingElementHandler = voidHandler("removingElementHandler"),
        loadingDoneHandler = voidHandler("loadingDoneHandler"),
        metaInformationHandler = voidHandler("metaInformationHandler"),
        removeElementsWithNoSelectedDescendant = false,
        additionalCSSClassForNode = voidHandlerStrBlank("additionalCSSClassForNode"),
        additionalCSSClassForLink = voidHandlerStrBlank("additionalCSSClassForLink"),
        sortChildren = false,
        identifierAccessor=function(d){return d.data.id;},
        textAccessor=function(d) {
            if (typeof d.data.text == "undefined")
                return identifierAccessor(d);
            if (d.data.text.constructor === Array)
                return d.data.text[0];
            return d.data.text;
        },
        elementEquality=function (e,f){return identifierAccessor(e)==identifierAccessor(f);},
        tooltipBuilder=function(d, tooltipContainer) {
            var c = "<div class=\"panel panel-default card\"><div class=\"panel-heading\">"+
                    textAccessor(d)+
                    "</div>"+
                    "<div class=\"panel-body\">"+
                    "Identifier: "+identifierAccessor(d)+
                    "</div></div>";
            tooltipContainer.html(c);
        },
        preTreatmentOfLoadedTree=function(tree){return  tree;},
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
        updateWithoutPanAndZoomTuning,
        minX,
        minY,
        maxX,
        maxY,
        reset,
        manualZoom,
        moveElementsIntoView,
        id=0,
        identifierToElement={};

    function chart(selection){
        selection.each(function() {
            target_selector=this;
            var treemap = d3.tree()
                    .nodeSize([12, 50])
                    .separation(function(a, b) {
                        let a_count = a.children ? a.children.length : 1;
                        let b_count = b.children ? b.children.length : 1;
                        return ((a_count+b_count)/2) +  (a.parent == b.parent ? 0 : 1);
                    });

            var diagonal = d3.linkHorizontal()
                               .x(function(d) { return d.y; })
                               .y(function(d) { return d.x; });

            var zoom = d3.zoom()
                .on("zoom", function () {
                    var currentTransform=vis.attr("transform")||'';
                    currentTransform=currentTransform.replace("(1)","(1.0000000)");
                    if (currentTransform.includes((d3.zoomTransform(svg.node()).k.toString()+".0000000").substring(0,6)))
                        if (!svg.node().classList.contains("auto-drag"))
                            svg.node().classList.add("dragged-or-moved");
                    vis.attr("transform", d3.event.transform);
                })
                .on("end", function () {
                    vis.attr("transform", d3.event.transform);
                    svg.node().classList.remove("dragged-or-moved");
                });

            var svg = d3.select(this).append("svg:svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .call(zoom);
            var vis = svg.append("svg:g");

            var body = d3.select("body");
            var tooltip = (body.select("div.tooltip").empty() ? body.append("div") : body.select("div.tooltip"))
                .attr("class", "tooltip")
                .style("opacity", 0)
                .on("mouseover", function(d) {
                    if(tooltip.style("opacity")==0)
                        return;
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
                    .style("top",  "-2000px");
                });

            reset = function(){
                var shift;
                if(vis.select("g.node").node())
                    shift=vis.select("g.node").node().getBoundingClientRect().width;
                else
                    shift=margin.left;
                var t = d3.zoomIdentity.translate(shift,$(target_selector).height()/2).scale(1);
                svg.call(zoom.transform, t);
            };

            manualZoom = function(type){
                if(type=='in'){
                    zoom.scaleBy(svg, 2);                
                }
                else if (type=='out'){
                    zoom.scaleBy(svg, 0.5);                
                }

            };

            moveElementsIntoView = function(elements){
                let width = $(target_selector).width();
                let height = $(target_selector).height();
                let scale = d3.zoomTransform(svg.node()).k;
                let x = -elements[0].y0;
                let y = -elements[0].x0;

                x= x*scale+width/2;
                y = y*scale+height/2;

                var t = d3.zoomIdentity.translate(x,y).scale(scale);
                svg.transition()
                    .duration(duration)
                    .call(zoom.transform, t)
                    .node().classList.add("auto-drag");
                setTimeout(function() {
                    svg.node().classList.remove("auto-drag")
                }, duration);
            };

            update = function (source) {
                //getting the box surronding the svg element ()
                var svgBox=vis.node().getBBox();
                minX=svgBox.x;
                minY=svgBox.y;
                maxX=svgBox.width+svgBox.x;
                maxY=svgBox.height+svgBox.y;
                updateWithoutPanAndZoomTuning(source);
                var xShift=(maxX-minX)/2;
                zoom.translateExtent([[minX-xShift,minY-xShift], [maxX+xShift,maxY+xShift]]);
            };

            updateWithoutPanAndZoomTuning = function (source) {
                if (treeSelectedElementAncestors == null){
                    refreshTreeSelectedElementAncestors();
                }

                // Compute the new tree layout.
                var treeData = treemap(root);

                var nodes = treeData.descendants(),
                    links = treeData.descendants().slice(1);

                // Normalize for fixed-depth.
                nodes.forEach(function(d) { d.y = d.depth * 180; });

                // ****************** Nodes section ***************************

                // Update the nodes…
                var node = vis.selectAll("g.node")
                    .data(nodes, function(d) { return d.__d3js_id || (d.__d3js_id = ++id); });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("svg:g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + (source.y0 || source.y) + "," + (source.x0 || source.x) + ")";
                    })
                    .on("dblclick", () => {
                        //stop doubleclick zoom effect
                        d3.event.stopPropagation();
                    })
                    .on("click", function(d,i) { handleClick(d);});

                nodeEnter.append("svg:text")
                    .text(textAccessor)
                    .style("fill-opacity", 1e-6);
                nodeEnter.append("svg:text")
                    .text(textAccessor)
                    .style("fill-opacity", 1e-6);

                nodeEnter.append("svg:circle")
                    .attr("r", 1e-6)
                    .attr("class", function(d) {
                        return (d._children || d.children ? "has-children " : " ") + additionalCSSClassForNode(d);
                    })
                    .on("mouseover", function(d) {
                        if (!tooltipEnabled) return;
                        tooltipBuilder(d, tooltip);
                        let parentWidth = body._groups[0][0].clientWidth;
                        let tooltipWidth = tooltip._groups[0][0].clientWidth;
                        let tooltipX = d3.event.layerX+20;
                        tooltip
                            .interrupt()
                            .transition()
                            .duration(200)
                            .style("opacity", 1);
                        //checking if the tooltip is cropped and moving it to the left
                        if (parentWidth<tooltipWidth+tooltipX){
                            tooltipX = d3.event.layerX-10-tooltip._groups[0][0].clientWidth;
                        }
                        tooltip
                            .style("left", tooltipX + "px")
                            .style("top", (d3.event.layerY-5) + "px");
                    })
                    .on("mouseout", function(d) {
                            tooltip
                                .transition()
                                .duration(200)
                                .style("opacity", 0);
                            tooltip
                                .transition()
                                .delay(200)
                                .style("top",  "-2000px");
                    });

                // UPDATE
                var nodeUpdate = nodeEnter.merge(node);

                // Transition nodes to their new position.
                nodeUpdate.transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        minX= minX ? Math.min(minX,d.y  ):d.y   ;
                        minY= minY ? Math.min(minY,d.x  ):d.x   ;
                        maxX=(maxX ? Math.max(maxX,d.y  ):d.y  );
                        maxY=(maxY ? Math.max(maxY,d.x  ):d.x  );
                        return "translate(" + d.y + "," + d.x + ")";
                    })
                    ;

                nodeUpdate.select("circle")
                    .attr("r", 4.5)
                    .attr("class", function(d){
                        if (isElementSelected(d, treeSelectedElement))
                            return "selected " + additionalCSSClassForNode(d);
                        return (d._children || d.children ? "has-children " : " ") + additionalCSSClassForNode(d);
                    });

                nodeUpdate.selectAll("text")
                    .attr("x", function(d) { return d.children? -10 : 10; })
                    .attr("dy", function(d) { return d.parent && d.children && d.parent.children.length == 1 ? "-0.2em" : ".35em"; })
                    .attr("text-anchor", function(d) { return d.children  ? "end" : "start"; })
                    .style("fill-opacity", '')
                    .style("font-size", '')
                    .attr("class", function(d) { return isElementSelected(d, treeSelectedElement) ? "selected" : ""; });

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit()
                    .transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                     })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.selectAll("text")
                    .style("font-size", '1px')
                    .style("fill-opacity", 1e-6);

                // ****************** links section ***************************

                // Update the links…
                var link = vis.selectAll("path.link")
                    .data(links, function(d) { return d.__d3js_id; });

                // Transition exiting nodes to the parent's new position.

                // Enter any new links at the parent's previous position.
                var linkEnter = link.enter().insert("svg:path", "g")
                    .attr("data-id", function(d) { return d.__d3js_id; })
                    .attr("d", function(d) {
                        var o = {x: (source.x0 || source.x), y: (source.y0 || source.y)};
                        return diagonal({source:o, target:o});
                    })
                    .attr("class", function(d) {
                        return "link " + additionalCSSClassForLink(d);
                    });

                // UPDATE
                var linkUpdate = linkEnter.merge(link);

                // Transition links to their new position.
                linkUpdate.transition()
                    .duration(duration)
                    .attr('d', function(d){ return diagonal({source:d, target:d.parent});})
                    .attr("class", function(d){
                        if ($.inArray(identifierAccessor(d), treeSelectedElementAncestors) > -1)
                            return "link selected " + additionalCSSClassForLink(d);
                        return "link " + additionalCSSClassForLink(d);
                    });

                var linkExit = link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = {x: source.x, y: source.y};
                        return diagonal({source:o, target:o});
                    })
                  .remove();

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            };//end of update(source)

            if(data_url!=null){
                update(root);
                reset();
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
        if (d3.event.shiftKey && use_shift_to_open ||
            d3.event.ctrlKey  && use_control_to_open ||
            d3.event.altKey   && use_alt_to_open){
            openElementHandler(d);
        }else if (d3.event.shiftKey && use_shift_to_add ||
                  d3.event.ctrlKey  && use_control_to_add ||
                  d3.event.altKey   && use_alt_to_add){
            var pos = treeSelectedElement.indexOf(d);
            if(pos>-1){
                //removing ?
                attemptToRemoveElement(d, pos);
            }else{
                //adding ?
                attemptToSelectElement(d);
            }
        }else if (!d3.event.shiftKey && !d3.event.ctrlKey && !d3.event.altKey && d3.event.detail == 1){
            chart.cmd.clearSelectedElements(false);
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
        var i;
        if (elementEquality(refElement,org))
            treeSelectedElement.push(org);
        if (org.children)
            for(i=0;i<org.children.length;i++)
                recursivePush(refElement,org.children[i]);
        if (org._children)
            for(i=0;i<org._children.length;i++)
                recursivePush(refElement,org._children[i]);
    }//end of recursivePush

    function refreshTreeSelectedElementAncestors() {
        treeSelectedElementAncestors=[];
        var candidate;
        for(var i=0;i<treeSelectedElement.length;i++){
            candidate=treeSelectedElement[i];
            while(candidate != null/* && treeSelectedElementAncestors.indexOf(identifierAccessor(candidate))==-1*/){
                var id_candidate = identifierAccessor(candidate);
                if($.inArray(id_candidate, treeSelectedElementAncestors))
                    treeSelectedElementAncestors.push(id_candidate);
                candidate=candidate.parent;
            }
        }
    }//end of refreshTreeSelectedElementAncestors

    function parenthood(element,parent) {
        let node=identifierToElement[identifierAccessor(element)];
        if (typeof node != "undefined"){
            if (typeof node.duplicate == "undefined")
                node.duplicate=[node];
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
                        a=textAccessor(a).toUpperCase();
                        b=textAccessor(b).toUpperCase();
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
        var ch,i;
        if (element.children) {
            ch=element.children;
            for(i=0;i<ch.length;i++){
                if(browseToFromElement(identifier, ch[i], selectedIt, expandToIt)){
                    if (expandToIt)
                        toggleForceExpand(element);
                    b=true;//return true;
                }
            }
        }else
        if (element._children) {
            ch=element._children;
            for(i=0;i<ch.length;i++){
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
        var i;
        if (node._children) {
            for(i=0;i<node._children.length;i++){
                if(expandSelectedElement(node._children[i])){
                    hasSelectedDescendant=true;
                }
            }
        }else if (node.children) {
            for(i=0;i<node.children.length;i++){
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

    function expandAllDescendantElement(node){
        var i,
            children = node._children || node.children;
        if (children) {
            for(i=0;i<children.length;i++){
                expandAllDescendantElement(children[i]);
            }
        }
        toggleForceExpand(node);
    }//end of expandAllElement

    function getFartherAncestorCollapsed(node){
        var source=node;
        var pointer=node;
        while(pointer.parent){
            if(pointer._children)
                source=pointer;
            pointer=pointer.parent;
        }
        return source;
    }//end of getFartherAncestorCollapsed

    function initTreeAndTriggerUpdate(){
        treeSelectedElement=[];
        treeSelectedElementAncestors=[];
        metaInformationHandler(root.data.meta);
        root.x0 = 0;
        root.y0 = 0;

        parenthood(root,null);
        refreshTreeSelectedElementAncestors();

        if(removeElementsWithNoSelectedDescendant){
            shouldRemoveThisElementsAsItHasNoSelectedDescendant(root);
        }
        collapseNotSelectedElement(root);

        if(update){
            update(root);
            loadingDoneHandler();
            reset();
        }
    }

    //accessors
    function cmd() {
        return cmd;
    }
    /**
     * Ask to collapse to element identified by identifier
     * @param {string} identifier - the element identifier that is returned by identifierAccessor
     * @return cmd() itself
     */
    cmd.collapseElement = function (identifier) {
        toggleForceCollapse(identifierToElement[identifier]);
        update(root);
        return cmd;
    };
    /**
     * Ask to expand an element
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
    };
    /**
     * Ask to expand to all selected elements
     * @return cmd() itself
     */
    cmd.expandSelectedElement = function (){
        expandSelectedElement(root);
        update(root);
        return cmd;
    };
    /**
     * Ask to expand to all selected elements
     * @return cmd() itself
     */
    cmd.expandAllDescendantElement = function (identifier){
        console.log(identifierAccessor(root));
        var node=identifierToElement[identifier] || root;
        browseToFromElement(identifier,root,false,true);
        expandAllDescendantElement(node);
        update(node);
        return cmd;
    };
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
    /**
     * Iterate over ell the elements of the tree
     * @return cmd() itself
     */
    cmd.resetPanAndZoom = function (){
        reset();
        return cmd;
    };

    /**
     * Zooming in and out with buttons
     * @param {string} type Zooming type (in or out)
     * @return cmd() itself
     */
    cmd.manualZoomInAndOut = function (type){
        manualZoom(type);
        return cmd;
    };
    
     /**
     *
     * @param {Object[]} elements - the identifiers that should be visible after the call of this method
     */
      cmd.moveElementsIntoView = function (elements) {
        moveElementsIntoView(elements);
    };

    // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
    chart.cmd = cmd;
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

        identifierToElement={};
        data_url = value;
        jsonTreeFromURL(value,(tree) => {
            localStorage.setItem("current_edam",JSON.stringify(tree))
            setCookie("edam_url",value)
            tree.meta.data_url=data_url;
            chart.data(tree);
            });
    }

    
    /**
     * Accessor to the url where the json formatted tree can be found
     * @param {string} value - a valid url
     */
    chart.data = function(value) {
        if (!arguments.length) return root;
        identifierToElement={};
        root = d3.hierarchy(preTreatmentOfLoadedTree(value), function(d) { return d.children; });
        initTreeAndTriggerUpdate();
        return chart;
    };
    /**
     * Accessor to the method adding classed to nodes
     * @param {function} value - an implementation of function (d){...} returning a class name(s)
     */
    chart.additionalCSSClassForNode = function(value) {
        if (!arguments.length) return additionalCSSClassForNode;
        additionalCSSClassForNode = value;
        return chart;
    };
    /**
     * Accessor to the method adding classed to links
     * @param {function} value - an implementation of function (d){...} returning a class name(s)
     */
    chart.additionalCSSClassForLink = function(value) {
        if (!arguments.length) return additionalCSSClassForLink;
        additionalCSSClassForLink = value;
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
     * Accessor to the method building the tooltip of an element
     * @param {function} value - an implementation of function (d){...} returning the html code contained in the tooltip
     */
    chart.preTreatmentOfLoadedTree = function(value) {
        if (!arguments.length) return preTreatmentOfLoadedTree;
        preTreatmentOfLoadedTree = value;
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

export {interactive_tree}