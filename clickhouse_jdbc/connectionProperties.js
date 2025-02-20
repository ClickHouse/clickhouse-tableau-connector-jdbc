(function propertiesbuilder(attr) {
    var props = {};

    // setting custom HTTP parameters
    var customHttpParams = {};

    // fix IN/OUT Top-N Sets
    customHttpParams['join_use_nulls'] = 1;

    // parsing custom_http_params
    if (attr['v-custom-http-params'] && attr['v-custom-http-params'].length > 0) {
        var tempCustomHttpParams = attr['v-custom-http-params'].split(',');
        for (var i = 0; i < tempCustomHttpParams.length; i++) {
            var param = tempCustomHttpParams[i].split('=');
            customHttpParams[param[0]] = param[1];
        }
    }

    // setting session_id
    if (attr['v-set-session-id'] === "true") {
        customHttpParams['session_id'] = "tableau-jdbc-connector-" + Date.now() + "-" + Math.floor(Math.random() * (Math.floor(10000000) - Math.ceil(1) + 1)) + Math.ceil(1);
    }

    var customHttpParamsArr = [];
    for (var key in customHttpParams) {
        customHttpParamsArr.push(key + "=" + customHttpParams[key]);
    }

    // default type mappings
    typeMappings = {
        'UInt64': 'java.lang.String',
        'UInt128': 'java.lang.String',
        'Int128': 'java.lang.String',
        'UInt256': 'java.lang.String',
        'Int256': 'java.lang.String'
    };

    // setting custom type mappings
    if (attr['v-custom-type-mappings'] && attr['v-custom-type-mappings'].length > 0) {
        var customTypeMappings = attr['v-custom-type-mappings'].split(',');
        for (var i in customTypeMappings) {
            var customTypeMapping = customTypeMappings[i].split('=');
            typeMappings[customTypeMapping[0]] = customTypeMapping[1];
        }
    }

    var typeMappingsArr = [];
    for (var key in typeMappings) {
        typeMappingsArr.push(key + "=" + typeMappings[key]);
    }

    // updating some params
    props['custom_http_params'] = customHttpParamsArr.join(',');
    props['typeMappings'] = typeMappingsArr.join(',');
    props['socket_timeout'] = 300000;
    props['databaseTerm'] = "schema";

    // ------------------------------------------------------------------------------------------------------------------------------------------


    props["user"] = attr["username"];
    props["password"] = attr["password"];

    if (attr["sslmode"] === "require") {
        props["ssl"] = "true";
        props["sslmode"] = "STRICT";
    }

    return props;
})
