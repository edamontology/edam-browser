import {getCookie} from "./utils.js"
import {triggerVersion} from "./index.js"


//map of al available versions in the drodown menu,to add a version:
// 1. add all the needed info to this map where with the version as key:
    //label: displayed label in the drpdown menu.
    //url: url where the raw owl file is located, if missing, it will loaded from the baseUrl.
// 2. add the version to the versionsDropdown in the preferred order to display.
// Changing existing names of keys WILL break things. Like the name "stable". Please change values(label, url) only or add new values/keys.
const versionsMap = {
    "stable":{label:"1.25 (stable)",url:"https://raw.githubusercontent.com/edamontology/edamontology/main/releases/EDAM_1.25.owl"},
    "1.24":{label:"1.24"},
    "1.23":{label:"1.23"},
    "latest":{label:"latest (unstable)",url:"https://raw.githubusercontent.com/edamontology/edamontology/main/EDAM_dev.owl"},
    "custom":{label:"Custom Version"}
};

//order of displayed versions in the dropdown menu
const versionsDropdown = ["stable","1.24","1.23","latest","custom"]

const baseURL="https://raw.githubusercontent.com/edamontology/edamontology/main/releases/";


/**
 * 
 * @param {string} version name of the version as key in the versionsMap.
 * @returns url as retrieved from the map, fallback to the baseURL or custome url.
 */
function getTreeURL(version){
    switch(version){
        case 'custom':
            return getCookie("custom_url","");
        default: 
            if ("url" in versionsMap[version])
                return versionsMap[version]["url"];
            return baseURL+"EDAM_"+version+".owl";
    }
}

/**
 * populate the versionsMap data dynamically in the dropdown menu.
 */
function popoulateVersions(){
    var versionMenu = document.getElementById("version-menu");
    versionsDropdown.map((val)=>{         
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.classList.add("branch")
        a.innerText=versionsMap[val]["label"];
        li.appendChild(a);
        if(val =="custom")
        a.addEventListener('click', function(){
            triggerVersion();
        });
        
        else 
        a.addEventListener('click', function(){
            browser.current_branch('edam',val);
        });
        versionMenu.appendChild(li);
    });
}


export {getTreeURL,versionsDropdown,popoulateVersions}