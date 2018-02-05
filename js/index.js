var browser = interactive_edam_browser();

window.onload = function() {
    var $inputs = $('#id_file,#id_url');
    $inputs.on('input', function () {
        $inputs.not(this).prop('disabled', $(this).val().length);
    }).on('change', function () {
        $inputs.not(this).prop('disabled', $(this).val().length);
    });

    if(typeof getUrlParameter("url") != "undefined"){
        branch="custom_url";
        setCookie("edam_browser_branch",branch);
        setCookie("edam_browser_custom_loaded_url", getUrlParameter("url"));
        setCookie("edam_browser_custom_identifier_accessor", getUrlParameter("identifier_accessor"));
        setCookie("edam_browser_custom_text_accessor", getUrlParameter("text_accessor"));
        $("[name=identifier_accessor][value='"+getCookie("edam_browser_custom_identifier_accessor","")+"']").prop("checked",true);
        $("#id_url").val(getUrlParameter("url"));
        $("#id_url").change();
        $("[name=text_accessor][value='"+getCookie("edam_browser_custom_text_accessor","")+"']").prop("checked",true);
        if(window.location.hash) {
            var id = window.location.hash.substring(1);
            pos = id.lastIndexOf('&');
            if (pos!=-1){
                id=id.substring(0,pos);
            }
            setCookie("edam_browser_"+branch,id);
        }
    }else
    if(window.location.hash) {
        branch=window.location.hash.substring(1);
        pos = branch.lastIndexOf('&');
        if (pos!=-1){
            id=branch.substring(0,pos);
            branch=branch.substring(pos+1);
        }else{
            //only home-EDAM arrives here, so ok to work with edam
            id=branch;
            branch=branch.substring(branch.lastIndexOf('/')+1,branch.lastIndexOf('_'));
            id=("http://edamontology.org/"+id).replace("http://edamontology.org/http://edamontology.org/","http://edamontology.org/");
        }
        setCookie("edam_browser_branch",branch);
        setCookie("edam_browser_"+branch,id);
    }else{
        branch=getCookie("edam_browser_branch","topic");
    }
    d3.select("#tree").call(browser.interactive_tree()); // draw chart in div
    if(branch=="custom_file"){
        browser.cmd.selectCustom();
    }else if(branch=="custom_url"){
        browser.cmd.loadCustom();
    }else{
        browser.current_branch(branch);
    }
}
