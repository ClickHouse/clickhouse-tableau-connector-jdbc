(function propertiesbuilder(attr) {
    
    var props = {};

    // setting Session ID (pseudo-random number)
    props["session_id"] = Math.floor(Math.random() * (Math.floor(100) - Math.ceil(1) + 1)) + Math.ceil(1);

    // setting Buffer Size default value (in bytes)
    props["buffer_size"] = 65536;

	// setting Buffer Size value (in bytes) specified by user
	if(attr[connectionHelper.attributeVendor1] && attr[connectionHelper.attributeVendor1].length > 0){ 
	   	props["buffer_size"] = attr[connectionHelper.attributeVendor1];
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
    props["password"] = attr[connectionHelper.attributePassword];
   
    if (attr[connectionHelper.attributeSSLMode] == "require") {
        props["ssl"] = "true";
        props["sslmode"] = "strict";
    }

    return props;
})
