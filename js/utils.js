import 'jquery-ui-bundle'; 
if (!Array.prototype.remove) {
    Array.prototype.remove = function(val) {
        var i = this.indexOf(val);
        return i>-1 ? this.splice(i, 1) : [];
    };
}

function getUrlParameter(sParam, default_value) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
    return default_value;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname, default_value) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    if (typeof default_value == "undefined")
        return "";
    return default_value;
}

function getHeight(){
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0)*0.75;
}

jQuery.ui.autocomplete.prototype._resizeMenu = function () {
  var ul = this.menu.element;
  ul.outerWidth(this.element.outerWidth());
};

function setUrlParameters(serializedParameters){
    if(typeof serializedParameters=="undefined")
        serializedParameters="";
    var new_url = window.location.protocol +
                  "//" +
                  window.location.host +
                  window.location.pathname +
                  (serializedParameters===""?"":"?"+serializedParameters) +
                  window.location.hash;
    window.history.pushState({path:new_url},'',new_url);
}

function getDarkMode() {
    const btn = document.querySelector(".btn-toggle");
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme == "dark") {
        document.body.classList.add("dark-mode");
    }
    if (null == btn || undefined == btn)
        return;
    btn.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        let theme = "light";
        if (document.body.classList.contains("dark-mode")) {
            theme = "dark";
        }
        localStorage.setItem("theme", theme);
    });
}

export {getUrlParameter,setCookie,getCookie,getHeight,setUrlParameters,getDarkMode}