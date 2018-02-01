var current_branch="";
my_tree = interactive_edam_browser();

window.onload = function() {
    if(typeof getUrlParameter("url") != "undefined"){
        branch="custom";
        setCookie("edam_browser_branch",branch);
        setCookie("edam_browser_"+branch+"_url", getUrlParameter("url"));
        setCookie("edam_browser_"+branch+"_identifier_accessor", getUrlParameter("identifier_accessor"));
        setCookie("edam_browser_"+branch+"_text_accessor", getUrlParameter("text_accessor"));
        if(window.location.hash) {
            setCookie("edam_browser_"+branch,"http://edamontology.org/"+window.location.hash.substring(1));
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
    d3.select("#tree").call(my_tree); // draw chart in div
    loadTree(branch);
}
