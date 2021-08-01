(function propertiesbuilder(attr) {
    
    var props = {};

    // setting Session ID (pseudo-random number)
    props["session_id"] = Math.floor(Math.random() * (Math.floor(100) - Math.ceil(1) + 1)) + Math.ceil(1);

    // setting Connection Timeout default value (in milliseconds)
    props["connection_timeout"] = 10000;

	// setting Connection Timeout value (in milliseconds) specified by user
	if(attr[connectionHelper.attributeVendor1] && attr[connectionHelper.attributeVendor1].length > 0){ 
	   	props["connection_timeout"] = attr[connectionHelper.attributeVendor1];
	}

	// setting custom attributes
	if(attr[connectionHelper.attributeVendor2] && attr[connectionHelper.attributeVendor2].length > 0){
		var customParams = attr[connectionHelper.attributeVendor2].split(';');
	    for(var i = 0; i < customParams.length; i++){
	      var param = customParams[i].split('=');
		  props[param[0]] = param[1];
	    }
	}

    props["user"] = attr[connectionHelper.attributeUsername];
    props["password"] = attr[connectionHelper.attributePassword].trim();
   
    if (attr[connectionHelper.attributeSSLMode] == "require") {
        props["ssl"] = "true";
        props["sslmode"] = "strict";
    }

    return props;
})
