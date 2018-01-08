function biotool_api(){
    function api(){}

    function generic_counter(get_api_url, callback){
        return $.ajax({
            url:get_api_url(),
            type: "GET",
            dataType: "json",
            data: {},
            success: function(data, statut){
                callback(data['count'],data,statut);
            },
            error:function (textStatus, xhr) {
                console.error(textStatus);
                console.error(xhr);
                data={'count':'0'};
                callback(data['count'],data,textStatus);
            },
        });
    }
    //getter for nothing
    var get_for_nothing=function (name){
        var getter = function(){}
        getter.count=function(callback){}
        getter.is_enabled=function(){
            return false;
        }
        getter.get_url=function(){}
        getter.get_api_url=function(){}
        return getter;
    }

    // generic getter
    api.get_for=function (branch, name, uri){
        if (typeof name == "undefined")
            return get_for_nothing();
        name=name.toLowerCase();
        if (branch=="deprecated")
            branch = uri.substring(uri.lastIndexOf("/")+1,uri.lastIndexOf("_"));
        if (branch=="topic")
            return api.get_for_topic(name);
        if (branch=="operation")
            return api.get_for_operation(name);
        if (branch=="format")
            return api.get_for_format(name);
        if (branch=="data")
            return api.get_for_data(name);
        return get_for_nothing();
    }
    //getter for topics
    api.get_for_topic=function (name){
        //getter object
        var getter = function(){}
        //function to count the number of tools associated
        getter.count=function(callback){
            return generic_counter(getter.get_api_url,callback);
        }
        //is the count function enabled
        getter.is_enabled=function(){
            return true;
        }
        //get the url returning the tools for human
        getter.get_url=function(){
            return "https://bio.tools/?format=json&topic="+name;
        }
        //get the url returning the tools for api call
        getter.get_api_url=function(){
            return "https://bio.tools/api/tool/?format=json&topic="+name
        }
        return getter;
    }
    //getter for operations
    api.get_for_operation=function (name){
        //getter object
        var getter = function(){}
        //function to count the number of tools associated
        getter.count=function(callback){
            return generic_counter(getter.get_api_url,callback);
        }
        //is the count function enabled
        getter.is_enabled=function(){
            return true;
        }
        //get the url returning the tools for human
        getter.get_url=function(){
            return "https://bio.tools/?format=json&function="+name;
        }
        //get the url returning the tools for api call
        getter.get_api_url=function(){
            return "https://bio.tools/api/tool/?format=json&function="+name
        }
        return getter;
    }
    //getter for data
    var get_for_data_and_format=function (name){
        //getter object
        var getter = function(){}
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
                    )
                }
            );
        }
        //is the count function enabled
        getter.is_enabled=function(){
            return true;
        }
        //get the url returning the tools for human
        getter.get_url=function(){
            return [
                "https://bio.tools/?format=json&input="+name,
                "https://bio.tools/?format=json&output="+name
            ];
        }
        //get the url returning the tools for api call
        getter.get_api_url=function(){
            return [
                "https://bio.tools/api/tool/?format=json&input="+name,
                "https://bio.tools/api/tool/?format=json&output="+name
            ];
        }
        return getter;
    }
    api.get_for_data=get_for_data_and_format;
    api.get_for_format=get_for_data_and_format;
    return api;
}
