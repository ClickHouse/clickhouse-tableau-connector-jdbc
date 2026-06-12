(function dsbuilder(attr) {
    // Splits "k1=v1,k2=v2" on the FIRST '=' of each item, so values may
    // contain '='. Pairs with an empty key or value are skipped: jdbc-v2
    // parseUrl() throws SQLException on empty URL parameter keys/values.
    function parseKeyValueList(str) {
        var pairs = [];
        if (!str || str.length === 0) {
            return pairs;
        }
        var items = str.split(',');
        for (var i = 0; i < items.length; i++) {
            var eq = items[i].indexOf('=');
            if (eq < 0) {
                continue;
            }
            var key = items[i].substring(0, eq).replace(/^\s+|\s+$/g, '');
            var value = items[i].substring(eq + 1).replace(/^\s+|\s+$/g, '');
            if (key.length === 0 || value.length === 0) {
                continue;
            }
            pairs.push([key, value]);
        }
        return pairs;
    }

    // Single params object: later assignments override earlier ones
    var params = {};

    // fix IN/OUT Top-N Sets
    params['clickhouse_setting_join_use_nulls'] = '1';

    // session_id is sent with every HTTP request by the driver, which gives
    // a real server session, so Initial SQL "SET x=y" affects the connection
    if (attr['v-set-session-id'] == 'true') {
        params['clickhouse_setting_session_id'] = 'tableau-jdbc-connector-' + Date.now() + '-'
            + (Math.floor(Math.random() * (Math.floor(10000000) - Math.ceil(1) + 1)) + Math.ceil(1));
    }

    // ClickHouse server settings: each key becomes clickhouse_setting_<key>,
    // keeping the semantics of the old V1 custom_http_params field
    var serverSettings = parseKeyValueList(attr['v-custom-http-params']);
    for (var i = 0; i < serverSettings.length; i++) {
        params['clickhouse_setting_' + serverSettings[i][0]] = serverSettings[i][1];
    }

    // raw JDBC URL parameters go last, so an explicit
    // clickhouse_setting_session_id here overrides the checkbox above
    var urlParams = parseKeyValueList(attr['v-custom-url-params']);
    for (var j = 0; j < urlParams.length; j++) {
        params[urlParams[j][0]] = urlParams[j][1];
    }

    var paramsArr = [];
    for (var key in params) {
        paramsArr.push(key + '=' + encodeURIComponent(params[key]));
    }

    var hostPort = attr['server'];
    if (attr['port'] && attr['port'].length > 0) {
        hostPort += ':' + attr['port'];
    }

    return ['jdbc:clickhouse://' + hostPort + '/?' + paramsArr.join('&')];
})
