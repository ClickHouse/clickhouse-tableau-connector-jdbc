(function dsbuilder(attr) {
    // building full URL string
    var urlBuilder = "jdbc:clickhouse://" + attr['server'] + ":" + attr['port'];
    return [urlBuilder];
})