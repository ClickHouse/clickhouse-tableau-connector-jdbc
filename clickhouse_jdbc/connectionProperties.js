(function propertiesbuilder(attr) {
    function isEmpty(str) {
        return (!str || 0 === str.length); 
    }
	
    var props = [];

    // setting custom Connection Parameters
    if(attr["v-custom-connection-params"] && attr["v-custom-connection-params"].length > 0){
        var customParams = attr["v-custom-connection-params"].split(',');
        for(var i = 0; i < customParams.length; i++){
            var param = customParams[i].split('=');
            props[param[0]] = param[1];
        }
    }

    if (attr[connectionHelper.attributeAuthentication] == "auth-integrated") {
        // Adding properties for Kerberos authentication
        var tableauServerUser = attr[connectionHelper.attributeTableauServerUser];
        props["gss_enabled"] = "true";
        props["kerberos_server_name"] = attr["v-kerb-server-name"]
        // tableauServerUser is not empty means this is a Tableau Server Environment	    
        if (!isEmpty(tableauServerUser)) {
            props["user"] = tableauServerUser; 
        } else {
            // properties for Kerberos SSO on Tableau Desktop    
            props["jaasApplicationName"] = "com.sun.security.jgss.krb5.initiate";
        }                 
    } else if (attr[connectionHelper.attributeAuthentication] == "auth-user-pass"){
        props["gss_enabled"] = "false";
        // username-password auth
        props["user"] = attr[connectionHelper.attributeUsername];
        props["password"] = attr[connectionHelper.attributePassword];
    }   

    if (attr["sslmode"] == "require") {
        props["ssl"] = "true";
        props["sslmode"] = "STRICT";
    }

    var formattedProps = [];
    
    for (var key in props) {
        formattedProps.push(connectionHelper.formatKeyValuePair(key, props[key]));
    }
    
    return formattedProps;
})