(function propertiesbuilder(attr) {
    
    var props = {};

    // setting Tableau to use ClickHouse server timezone
    props["use_server_time_zone"] = 1;

    // setting Tableau to use ClickHouse server timezone for dates
    props["use_server_time_zone_for_dates"] = 1;

    // setting Socket Timeout default value (in milliseconds)
    props["socket_timeout"] = 300000;

    // setting Socket Timeout value (in milliseconds) specified by user
    if(attr["v-socket-timeout"] && attr["v-socket-timeout"].length > 0){ 
        props["socket_timeout"] = attr["v-socket-timeout"];
    }

    // setting custom attributes
    if(attr["v-custom-parameters"] && attr["v-custom-parameters"].length > 0){
        var customParams = attr["v-custom-parameters"].split(';');
        for(var i = 0; i < customParams.length; i++){
            var param = customParams[i].split('=');
            if(param[0] != "set_session_id"){
                props[param[0]] = param[1];
            }
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