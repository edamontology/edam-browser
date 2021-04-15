function biotool_api(){
    function api(){}

    function generic_counter(get_api_url, callback){
        return $.ajax({
            url:get_api_url(),
            type: "GET",
            dataType: "json",
            data: {},
            success: function(data, statut){
                callback(data.count,data,statut);
            },
            error:function (textStatus, xhr) {
                console.error(textStatus);
                console.error(xhr);
                data={'count':'0'};
                callback(data.count,data,textStatus);
            },
        });
    }//end of generic_counter

    function decorate_children_with_count(node, get_api_url, callback, suffix){
        var field_name='__biotool_api_count'+(suffix||'');
        var queue = [];
        var job_length=0;
        // recursive function that add in queue the element and all its descendant
        var pusher = function(n){
            queue.push(n);
            var i;
            if (typeof n[field_name] != "undefined")
                job_length--;
            for(i=0;i<(n._children||[]).length;i++){
                pusher(n._children[i]);
            }
            for(i=0;i<(n.children||[]).length;i++){
                pusher(n.children[i]);
            }
        };
        // run pusher, fill queue with all the elements
        pusher(node);
        job_length+=queue.length;
        // create a callback caller that sum all descendant usage and call the actual callback
        function call_callback(){
            var total=0,
                total_d={};
            $.each(queue,function(i,e){
                total_d[e.data.data.uri]=e[field_name];
            });
            for (var key in total_d){
                total+=total_d[key];
            }
            callback({
                'descendants':queue.length,
                'total':total
            });
        }
        // if nothing to do, just run the callback
        if (job_length==0)
            call_callback();
        // create function that will call generic_counter not for the current elements, but an element passed as arg
        var generic_counter_for_this_i = function(j){
            generic_counter(
                function(){
                    // get the api url for the focused elements
                    return get_api_url(queue[j].data.data.uri);
                },
                function(data,count,status){
                    // decorate the element with the count returned by bio.tools
                    queue[j][field_name]=count.count;
                    if(job_length==1){
                        // when we are the last job, run the callback
                        call_callback();
                    }
                    job_length--;
                }
            );
        };
        for(var i=0;i<queue.length;i++){
            if (typeof queue[i][field_name] == "undefined")
                // for each element, run the custom generic_counter
                generic_counter_for_this_i(i);
        }
    }//end of decorate_children_with_count

    //getter for nothing
    var get_for_nothing=function (name){
        var getter = function(){};
        getter.count=function(callback){};
        getter.is_enabled=function(){
            return false;
        };
        getter.get_url=function(){};
        getter.get_api_url=function(){};
        return getter;
    };//end of function get_for_nothing

    // generic getter
    api.get_for=function (branch, name, uri, node){
        if (typeof name == "undefined")
            return get_for_nothing();
        //name=name.toLowerCase();
        if (branch=="deprecated")
            branch = uri.substring(uri.lastIndexOf("/")+1,uri.lastIndexOf("_"));
        if (branch=="topic" || branch.indexOf('edam')!=-1 && uri.indexOf('topic')!=-1)
            return api.get_for_topic(name, uri, node);
        if (branch=="operation" || branch.indexOf('edam')!=-1 && uri.indexOf('operation')!=-1)
            return api.get_for_operation(name, uri, node);
        if (branch=="format" || branch.indexOf('edam')!=-1 && uri.indexOf('format')!=-1)
            return api.get_for_format(name, uri, node);
        if (branch=="data" || branch.indexOf('edam')!=-1 && uri.indexOf('data')!=-1)
            return api.get_for_data(name, uri, node);
        return get_for_nothing();
    };//end of function get_for

    //getter for term with single usage (tagging)
    var get_for_single_search=function(uiKey, apiKey){
        return function (name, uri, node){
            var identifier = uri.substring(uri.lastIndexOf("/")+1);
            //getter object
            var getter = function(){};
            //function to count the number of tools associated
            getter.count=function(callback){
                return generic_counter(getter.get_api_url,callback);
            };
            //function to count the number of tools associated including descendants
            getter.count_with_descendants=function(callback){
                return decorate_children_with_count(node, getter.get_api_url, callback);
            };
            //is the count function enabled
            getter.is_enabled=function(){
                return true;
            };
            //get the url returning the tools for human
            getter.get_url=function(){
                return "https://bio.tools/t?"+uiKey+"=%22"+identifier+"%22";
            };
            //get the url returning the tools for api call
            getter.get_api_url=function(value){
                // use value when provided, otherwise user uri
                return "https://bio.tools/api/tool/?format=json&"+apiKey+"=%22"+(value||uri)+"%22";
            };
            return getter;
        };
    };//end of function get_for_single_search
    api.get_for_topic=get_for_single_search("topicID", "topicID");
    api.get_for_operation=get_for_single_search("operationID", "operationID");

    //getter for term with two usage (input and output)
    var get_for_double_search=function(uiInKey,uiOutKey,apiInKey,apiOutKey){
        return function (name, uri, node){
            var identifier = uri.substring(uri.lastIndexOf("/")+1);
            //getter object
            var getter = function(){};
            //function to count the number of tools associated
            getter.count=function(callback){
                return generic_counter(
                    function(){return getter.get_api_url()[0];},
                    function(cpt_in, data_in){
                        generic_counter(
                            function(){return getter.get_api_url()[1];},
                            function(cpt_out, data_out){
                                callback([cpt_in,cpt_out], [data_in, data_out]);
                            }
                        );
                    }
                );
            };
            //function to count the number of tools associated including descendants
            getter.count_with_descendants=function(callback){
                return decorate_children_with_count(
                    node,
                    function(value){return getter.get_api_url(value)[0];},
                    function(res_input){
                        decorate_children_with_count(
                            node,
                            function(value){return getter.get_api_url(value)[1];},
                            function(res_output){
                                callback({
                                    'input':res_input,
                                    'output':res_output
                                });
                            },
                            "_ouput"
                        );
                    },
                    "_input"
                );
            };
            //is the count function enabled
            getter.is_enabled=function(){
                return true;
            };
            //get the url returning the tools for human
            getter.get_url=function(){
                return [
                    "https://bio.tools/t?"+uiInKey+"=%22"+identifier+"%22",
                    "https://bio.tools/t?"+uiOutKey+"=%22"+identifier+"%22"
                ];
            };
            //get the url returning the tools for api call
            getter.get_api_url=function(value){
                // use value when provided, otherwise user uri
                return [
                    "https://bio.tools/api/tool/?format=json&"+apiInKey+"=%22"+(value||uri)+"%22",
                    "https://bio.tools/api/tool/?format=json&"+apiOutKey+"=%22"+(value||uri)+"%22"
                ];
            };
            return getter;
        };
    };//end of function get_for_double_search

    api.get_for_data=get_for_double_search("inputDataTypeID","outputDataTypeID","inputDataTypeID","outputDataTypeID");
    api.get_for_format=get_for_double_search("inputID","outputID","inputDataFormatID","outputDataFormatID");
    return api;
}
