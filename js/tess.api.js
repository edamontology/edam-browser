function tess_api(){
    function api(){}

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
    api.get_for=function (branch, name, uri, node){
        if (uri.indexOf("edam")==-1)
            return get_for_nothing();
        //getter object
        var getter = function(){}
        //function to count the number of tools associated
        getter.count=function(callback){
            return $.ajax({
                url:getter.get_api_url(),
                type: "GET",
                dataType: "json",
                data: {},
                success: function(data, statut){
                    callback(data.length,data,statut);
                },
                error:function (textStatus, xhr) {
                    console.error(textStatus);
                    console.error(xhr);
                    callback(-1,[],textStatus);
                },
            });
        }
        //is the count function enabled
        getter.is_enabled=function(){
            return typeof name != "undefined";
        }
        //get the url returning the tools for human
        getter.get_url=function(){
            return "https://tess.elixir-europe.org/materials?scientific_topics="+name.replace(/ /g,'+');
        }
        //get the url returning the tools for api call
        getter.get_api_url=function(){
            return "https://tess.elixir-europe.org/materials.json?scientific_topics="+name.replace(/ /g,'+');
        }
        return getter;
    }
    //getter for topics
    api.get_for_topic=function (name){
        return api.get_for("topic",name)
    }
    //getter for operations
    api.get_for_operation=function (name){
        return api.get_for("operation",name)
    }
    //getter for data
    api.get_for_data=function (name){
        return api.get_for("data",name)
    }
    //getter for format
    api.get_for_format=function (name){
        return api.get_for("format",name)
    }
    return api;
}
