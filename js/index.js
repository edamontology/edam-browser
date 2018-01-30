var current_branch="";
my_tree = interactive_edam_browser();

window.onload = function() {
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
    }
    d3.select("#tree").call(my_tree); // draw chart in div
    loadTree();
}
