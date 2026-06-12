(function propertiesbuilder(attr) {
    // Same parsing rules as connectionBuilder.js: split on the first '=',
    // skip pairs with an empty key or value
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

    var props = {};

    // jdbc-v2 (0.9.7+) rejects unknown config keys with
    // ClientMisconfigurationException; with this flag the driver only logs
    // a WARN. Users can override it back to 'false' in the field below.
    props['ignore_unknown_config_key'] = 'true';

    var customProps = parseKeyValueList(attr['v-custom-connection-params']);
    for (var i = 0; i < customProps.length; i++) {
        props[customProps[i][0]] = customProps[i][1];
    }

    props['user'] = attr['username'] ? attr['username'] : 'default';
    props['password'] = attr['password'] ? attr['password'] : '';

    if (attr['sslmode'] == 'require') {
        props['ssl'] = 'true';
    }

    return props;
})
