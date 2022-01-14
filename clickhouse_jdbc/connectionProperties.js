(function propertiesbuilder(attr) {
    var props = {};

    // setting custom Connection Parameters
    if(attr["v-custom-connection-params"] && attr["v-custom-connection-params"].length > 0){
        var customParams = attr["v-custom-connection-params"].split(',');
        for(var i = 0; i < customParams.length; i++){
            var param = customParams[i].split('=');
            props[param[0]] = param[1];
        }
    }

    props["user"] = attr["username"];
    props["password"] = attr["password"];
   
    if (attr["sslmode"] == "require") {
        props["ssl"] = "true";
        props["sslmode"] = "STRICT";
    }

    return props;
})