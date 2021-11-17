(function propertiesbuilder(attr) {
    
    var props = {};

    // setting Tableau to use ClickHouse server timezone
    props["use_server_time_zone"] = 1;

    // setting Tableau to use ClickHouse server timezone for dates
    props["use_server_time_zone_for_dates"] = 1;

    // setting Data Transfer Timeout default value (in milliseconds)
    props["dataTransferTimeout"] = 10000;

    // setting Connection Timeout default value (in milliseconds)
    props["connection_timeout"] = 10000;

    // setting Connection Timeout value (in milliseconds) specified by user
    if(attr[connectionHelper.attributeVendor1] && attr[connectionHelper.attributeVendor1].length > 0){ 
        props["connection_timeout"] = attr[connectionHelper.attributeVendor1];
    }

    // setting Socket Timeout default value (in milliseconds)
    props["socket_timeout"] = 30000;

    // setting Socket Timeout value (in milliseconds) specified by user
    if(attr[connectionHelper.attributeVendor2] && attr[connectionHelper.attributeVendor2].length > 0){ 
        props["socket_timeout"] = attr[connectionHelper.attributeVendor2];
    }

    //setting default connection parameters
    var parameters = {}
    parameters["set_session_id"] = "true"

    // setting custom attributes
    if(attr[connectionHelper.attributeVendor3] && attr[connectionHelper.attributeVendor3].length > 0){
        var customParams = attr[connectionHelper.attributeVendor3].split(';');
        for(var i = 0; i < customParams.length; i++){
            var param = customParams[i].split('=');
            if(param[0] = "set_session_id"){
                parameters["set_session_id"] = param[1]
            } else {
                props[param[0]] = param[1];
            }
        }
    }

    // setting Session ID (prefix + pseudo-random number) 
    if(parameters["set_session_id"] == "true"){
        props["session_id"] = "tableau-jdbc-connector-" + Math.floor(Math.random() * (Math.floor(10000000) - Math.ceil(1) + 1)) + Math.ceil(1);
    }

    props["user"] = attr[connectionHelper.attributeUsername];
    props["password"] = attr[connectionHelper.attributePassword];
   
    if (attr[connectionHelper.attributeSSLMode] == "require") {
        props["ssl"] = "true";
        props["sslmode"] = "strict";
    }

    return props;
})