var browser = interactive_edam_browser();

window.onload = function() {
    if(typeof getUrlParameter("url") != "undefined"){
        branch="custom_url";
        setCookie("edam_browser_branch",branch);
        setCookie("edam_browser_custom_loaded_url", getUrlParameter("url"));
        setCookie("edam_browser_custom_identifier_accessor", getUrlParameter("identifier_accessor"));
        setCookie("edam_browser_custom_text_accessor", getUrlParameter("text_accessor"));
        if(window.location.hash) {
            var id = window.location.hash.substring(1);
            pos = id.lastIndexOf('&');
            if (pos!=-1){
                id=id.substring(0,pos);
            }
            setCookie("edam_browser_"+branch,"http://edamontology.org/"+id);
        }
    }else
    if(window.location.hash) {
        branch=window.location.hash.substring(1);
        pos = branch.lastIndexOf('&');
        if (pos!=-1){
            id=branch.substring(0,pos);
            branch=branch.substring(pos+1);
        }else{
            id=branch;
            branch=branch.substring(0,branch.lastIndexOf('_'));
        }
        setCookie("edam_browser_branch",branch);
        setCookie("edam_browser_"+branch,"http://edamontology.org/"+id);
    }else{
        branch=getCookie("edam_browser_branch","topic");
    }
    d3.select("#tree").call(browser.interactive_tree()); // draw chart in div
    if(branch=="custom_file"){
        browser.cmd.selectCustom();
    }else{
        browser.current_branch(branch);
    }

    var $inputs = $('#id_file,#id_url');
    $inputs.on('input', function () {
        $inputs.not(this).prop('disabled', $(this).val().length);
    }).on('change', function () {
        $inputs.not(this).prop('disabled', $(this).val().length);
    });
}
