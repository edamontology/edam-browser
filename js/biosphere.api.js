if (typeof(String.prototype.localeCompare) === 'undefined') {
    String.prototype.localeCompare = function(str, locale, options) {
        return ((this == str) ? 0 : ((this > str) ? 1 : -1));
    };
}
function biosphere_api(){
    function api(){}

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
    };

    // generic getter
    api.get_for=function (branch, name, uri, node){
        if (uri.indexOf("edam")==-1)
            return get_for_nothing();
        var term_id=uri.substring(uri.lastIndexOf("/")+1);
            branch = term_id.substring(0,term_id.lastIndexOf("_"));
        var number = term_id.substring(term_id.lastIndexOf("_")+1);
        //getter object
        var getter = function(){};
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
                    var appliances_row=data.content.split("href=\"/catalogue/appliance/");
                    var tools_row=data.content.split("href=\"/catalogue/tool/");
                    var appliances=[];
                    var tools=[];
                    var i;
                    for(i=1;i<appliances_row.length;i++){
                        appliances.push(appliances_row[i].match(/[^>]*>([^<]*)[<]/)[1].trim());
                    }
                    for(i=1;i<tools_row.length;i++){
                        tools.push(tools_row[i].match(/[^>]*>([^<]*)[<]/)[1].trim());
                    }
                    callback(
                    [
                        appliances.length,
                        tools.length
                    ],
                    [
                        appliances.sort(function(a,b){
                            return a.localeCompare(b);
                        }),
                        tools.sort(function(a,b){
                            return a.localeCompare(b);
                        })
                    ],
                    statut
                    );
                },
                error:function (textStatus, xhr) {
                    console.error(textStatus);
                    console.error(xhr);
                    callback(-1,[],textStatus);
                },
            });
        };
        //is the count function enabled
        getter.is_enabled=function(){
            return true;
        };
        //get the url returning the tools for human
        getter.get_url=function(){
            return "https://biosphere.france-bioinformatique.fr/edamontology/"+branch+"/"+number+"/";
        };
        //get the url returning the tools for api call
        getter.get_api_url=function(){
            return getter.get_url()+"?media=json&included=True";
        };
        return getter;
    };
    //getter for topics
    api.get_for_topic=function (name){
        return api.get_for("topic",name);
    };
    //getter for operations
    api.get_for_operation=function (name){
        return get_for_nothing();
    };
    //getter for data
    api.get_for_data=function (name){
        return get_for_nothing();
    };
    //getter for format
    api.get_for_format=function (name){
        return get_for_nothing();
    };
    return api;
}
