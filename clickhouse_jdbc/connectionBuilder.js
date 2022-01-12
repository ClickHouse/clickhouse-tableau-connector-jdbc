(function dsbuilder(attr) {
    var propsConnBuilder = {};

    //setting default connection parametersConnBuilder
    var parametersConnBuilder = {}
    parametersConnBuilder["set_session_id"] = "1"
    
    // setting custom attributes
    if(attr['v-custom-parameters'] && attr['v-custom-parameters'].length > 0){
        var customParams = attr['v-custom-parameters'].split(';');
        for(var i = 0; i < customParams.length; i++){
            var param = customParams[i].split('=');
            if(param[0] == "set_session_id"){
                parametersConnBuilder["set_session_id"] = param[1]
            } else {
                propsConnBuilder[param[0]] = param[1];
            }
        }
    }
    
    // setting Session ID (prefix + pseudo-random number) 
    if(parametersConnBuilder["set_session_id"] == "1"){
        propsConnBuilder["session_id"] = "tableau-jdbc-connector-" + Date.now() + "-"+ Math.floor(Math.random() * (Math.floor(10000000) - Math.ceil(1) + 1)) + Math.ceil(1);
    }

    // building custom_http_params string
    var propsConnBuilderArr = [];
    for (var key in propsConnBuilder){
        propsConnBuilderArr.push(key + "=" + propsConnBuilder[key]);
    }
    var propsConnBuilderString = propsConnBuilderArr.join(',');

    // add typeMappings to show big integers as strings + custom_http_params 
    var urlBuilder = "jdbc:clickhouse://" + attr['server'] + ":" + attr['port']
        + '/?typeMappings=UInt64%3Djava.lang.String%2CUInt128%3Djava.lang.String%2CInt128%3Djava.lang.String%2CUInt256%3Djava.lang.String%2CInt256%3Djava.lang.String&custom_http_params=join_use_nulls%3D1%2C'
        + encodeURIComponent(propsConnBuilderString);
    return [urlBuilder];
})

