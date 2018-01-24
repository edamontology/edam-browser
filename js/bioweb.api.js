if (typeof(String.prototype.localeCompare) === 'undefined') {
    String.prototype.localeCompare = function(str, locale, options) {
        return ((this == str) ? 0 : ((this > str) ? 1 : -1));
    };
}
function bioweb_api(){
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
    api.get_for=function (branch, name, uri){
        var term_id=uri.substring(uri.lastIndexOf("/")+1);
        if (branch=="deprecated")
            branch = term_id.substring(0,uri.lastIndexOf("_"));
        if (branch!="topic")
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
                headers: {
                    'X-Requested-With':'https://github.com/IFB-ElixirFr/edam-browser',
                },
                success: function(data, statut){
                    callback(
                    data.length,
                    data.sort(function(a,b){
                        return a.name.localeCompare(b.name);
                    }),
                    statut
                    );
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
            return true;
        }
        //get the url returning the tools for human
        getter.get_url=function(){
            return "https://bioweb.pasteur.fr/packages/topics/"+term_id;
        }
        //get the url returning the tools for api call
        getter.get_api_url=function(){
            return "https://cors-anywhere.herokuapp.com/https://bioweb.pasteur.fr/api/packages?search=&topicId="+term_id;
        }
        return getter;
    }
    //getter for topics
    api.get_for_topic=function (name){
        return api.get_for("topic",name)
    }
    //getter for operations
    api.get_for_operation=function (name){
        return get_for_nothing()
    }
    //getter for data
    api.get_for_data=function (name){
        return get_for_nothing()
    }
    //getter for format
    api.get_for_format=function (name){
        return get_for_nothing()
    }
    return api;
}
