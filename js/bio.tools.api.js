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
        pusher(node);
        job_length+=queue.length;
        function call_callback(){
            var total=0;
            $.each(queue,function(i,e){
                total+=e[field_name];
            });
            callback({
                'descendants':queue.length,
                'total':total
            });
        }
        if (job_length==0)
            call_callback();
        var generic_counter_for_this_i = function(j){
            generic_counter(
                function(){
                    return get_api_url(queue[j].text);
                },
                function(data,count,status){
                    queue[j][field_name]=count.count;
                    if(job_length==1){
                        call_callback();
                    }
                    job_length--;
                }
            );
        };
        for(var i=0;i<queue.length;i++){
            if (typeof queue[i][field_name] == "undefined")
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

    //getter for topics
    api.get_for_topic=function (name, uri, node){
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
            return "https://bio.tools/?format=json&topic="+name;
        };
        //get the url returning the tools for api call
        getter.get_api_url=function(value){
            return "https://bio.tools/api/tool/?format=json&topic="+(value||name);
        };
        return getter;
    };//end of function get_for_topic

    //getter for operations
    api.get_for_operation=function (name, uri, node){
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
            return "https://bio.tools/?function="+name;
        };
        //get the url returning the tools for api call
        getter.get_api_url=function(value){
            return "https://bio.tools/api/tool/?format=json&function="+(value||name);
        };
        return getter;
    };//end of function get_for_operation

    //getter for data
    var get_for_data_and_format=function (name, uri, node){
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
                "https://bio.tools/?format=json&input="+name,
                "https://bio.tools/?format=json&output="+name
            ];
        };
        //get the url returning the tools for api call
        getter.get_api_url=function(value){
            return [
                "https://bio.tools/api/tool/?format=json&input="+(value||name),
                "https://bio.tools/api/tool/?format=json&output="+(value||name)
            ];
        };
        return getter;
    };//end of function get_for_data_and_format

    api.get_for_data=get_for_data_and_format;
    api.get_for_format=get_for_data_and_format;
    return api;
}
