(function dsbuilder(attr) {
     var urlBuilder = "jdbc:clickhouse://" + attr[connectionHelper.attributeServer] + ":" + attr[connectionHelper.attributePort] + "/default?";

    return [urlBuilder];
})

