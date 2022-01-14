(function dsbuilder(attr) {
    // setting custom HTTP parameterss
    var customHttpParams = {};

    // fix IN/OUT Top-N Sets
    customHttpParams['join_use_nulls'] = 1;

    // parsing custom_http_params
    if(attr['v-custom-http-params'] && attr['v-custom-http-params'].length > 0){
        var customParams = attr['v-custom-http-params'].split(',');
        for(var i = 0; i < customParams.length; i++){
            var param = customParams[i].split('=');
            customHttpParams[param[0]] = param[1];
        }
    }
    
    // setting session_id
    if(attr['v-set-session-id'] == "true"){
        customHttpParams['session_id'] = "tableau-jdbc-connector-" + Date.now() + "-" + Math.floor(Math.random() * (Math.floor(10000000) - Math.ceil(1) + 1)) + Math.ceil(1);
    }

    var customHttpParamsArr = [];
    for (var key in customHttpParams){
        customHttpParamsArr.push(key + "=" + customHttpParams[key]);
    }

    // preparing customUrlParams
    var customUrlParams = {};

    if(attr['v-custom-url-params'] && attr['v-custom-url-params'].length > 0){
        var customParams = attr['v-custom-url-params'].split(',');
        for(var i = 0; i < customParams.length; i++){
            var param = customParams[i].split('=');
            customUrlParams[param[0]] = param[1];
        }
    }

    // default type mappings
    typeMappings = {'UInt64': 'java.lang.String',
                    'UInt128': 'java.lang.String',
                    'Int128': 'java.lang.String',
                    'UInt256': 'java.lang.String',
                    'Int256': 'java.lang.String'};

    // setting custom type mappings
    if(attr['v-custom-type-mappings'] && attr['v-custom-type-mappings'].length > 0){
        var customTypeMappings = attr['v-custom-type-mappings'].split(',');
        for(var i in customTypeMappings){
            var customTypeMapping = customTypeMappings[i].split('=');
            typeMappings[customTypeMapping[0]] = customTypeMapping[1];
        }
    }

    var typeMappingsArr = [];
    for (var key in typeMappings){
        typeMappingsArr.push(key + "=" + typeMappings[key]);
    }

    // updating some URL params
    customUrlParams['custom_http_params'] = customHttpParamsArr.join(',');
    customUrlParams['typeMappings'] = typeMappingsArr.join(',');

    // building encoded URL params string
    var customUrlParamsArr = [];
    for (var key in customUrlParams){
        customUrlParamsArr.push(key + "=" + encodeURIComponent(customUrlParams[key]));
    }

    var customUrlParamsString = customUrlParamsArr.join('&');

    // building full URL string
    var urlBuilder = "jdbc:clickhouse://" + attr['server'] + ":" + attr['port']
        + '/?' + customUrlParamsString;
    return [urlBuilder];
})