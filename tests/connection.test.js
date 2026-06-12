// Tests for the connector's Tableau JS scripts. Run with: node tests/connection.test.js
var fs = require('fs');
var path = require('path');
var assert = require('assert');

function loadScript(name) {
    var src = fs.readFileSync(path.join(__dirname, '..', 'clickhouse_jdbc', name), 'utf8');
    // each script is a single parenthesized function expression
    return eval(src);
}

var dsbuilder = loadScript('connectionBuilder.js');
var propertiesbuilder = loadScript('connectionProperties.js');

function buildUrl(attr) {
    return dsbuilder(attr)[0];
}

function urlParams(url) {
    var query = url.split('/?')[1];
    var params = {};
    if (!query || query.length === 0) {
        return params;
    }
    var parts = query.split('&');
    for (var i = 0; i < parts.length; i++) {
        var eq = parts[i].indexOf('=');
        params[parts[i].substring(0, eq)] = decodeURIComponent(parts[i].substring(eq + 1));
    }
    return params;
}

var failures = 0;
function test(name, fn) {
    try {
        fn();
        console.log('ok   ' + name);
    } catch (e) {
        failures++;
        console.error('FAIL ' + name + '\n     ' + e.message);
    }
}

// --- connectionBuilder.js ---

test('default URL has host:port, join_use_nulls and a generated session_id', function () {
    var url = buildUrl({ server: 'localhost', port: '8123', 'v-set-session-id': 'true' });
    assert.strictEqual(url.indexOf('jdbc:clickhouse://localhost:8123/?'), 0);
    var params = urlParams(url);
    assert.strictEqual(params['clickhouse_setting_join_use_nulls'], '1');
    assert.ok(/^tableau-jdbc-connector-\d+-\d+$/.test(params['clickhouse_setting_session_id']));
});

test('session checkbox off produces no session_id', function () {
    var url = buildUrl({ server: 'localhost', port: '8123', 'v-set-session-id': 'false' });
    assert.strictEqual(url.indexOf('session_id'), -1);
});

test('empty port leaves no colon in the URL', function () {
    var url = buildUrl({ server: 'myhost', port: '', 'v-set-session-id': 'false' });
    assert.strictEqual(url.indexOf('jdbc:clickhouse://myhost/?'), 0);
});

test('server settings field maps keys to clickhouse_setting_ prefix', function () {
    var url = buildUrl({
        server: 'h', port: '8123', 'v-set-session-id': 'false',
        'v-custom-http-params': 'max_result_rows=1000,readonly=2'
    });
    var params = urlParams(url);
    assert.strictEqual(params['clickhouse_setting_max_result_rows'], '1000');
    assert.strictEqual(params['clickhouse_setting_readonly'], '2');
});

test('explicit session_id in URL params overrides the checkbox', function () {
    var url = buildUrl({
        server: 'h', port: '8123', 'v-set-session-id': 'true',
        'v-custom-url-params': 'clickhouse_setting_session_id=my-fixed-session'
    });
    var params = urlParams(url);
    assert.strictEqual(params['clickhouse_setting_session_id'], 'my-fixed-session');
    // no duplicate session_id parameter in the URL
    assert.strictEqual(url.split('clickhouse_setting_session_id=').length, 2);
});

test('values containing = are not truncated and are URL-encoded', function () {
    var url = buildUrl({
        server: 'h', port: '8123', 'v-set-session-id': 'false',
        'v-custom-url-params': 'custom_settings=a=1'
    });
    assert.ok(url.indexOf('custom_settings=a%3D1') >= 0);
});

test('malformed pairs (empty key, empty value, bare items) are skipped', function () {
    var url = buildUrl({
        server: 'h', port: '8123', 'v-set-session-id': 'false',
        'v-custom-http-params': 'a=,=b,,junk',
        'v-custom-url-params': ' = , c '
    });
    var params = urlParams(url);
    var keys = [];
    for (var k in params) {
        keys.push(k);
    }
    assert.deepStrictEqual(keys, ['clickhouse_setting_join_use_nulls']);
});

test('keys and values are trimmed', function () {
    var url = buildUrl({
        server: 'h', port: '8123', 'v-set-session-id': 'false',
        'v-custom-http-params': ' max_result_rows = 1000 '
    });
    assert.strictEqual(urlParams(url)['clickhouse_setting_max_result_rows'], '1000');
});

// --- connectionProperties.js ---

test('defaults: ignore_unknown_config_key=true, user fallback, empty password', function () {
    var props = propertiesbuilder({});
    assert.strictEqual(props['ignore_unknown_config_key'], 'true');
    assert.strictEqual(props['user'], 'default');
    assert.strictEqual(props['password'], '');
});

test('username and password pass through', function () {
    var props = propertiesbuilder({ username: 'bob', password: 'secret' });
    assert.strictEqual(props['user'], 'bob');
    assert.strictEqual(props['password'], 'secret');
});

test('sslmode=require sets only ssl=true, never sslmode', function () {
    var props = propertiesbuilder({ sslmode: 'require' });
    assert.strictEqual(props['ssl'], 'true');
    assert.strictEqual(props['sslmode'], undefined);
});

test('sslmode empty sets no ssl property', function () {
    var props = propertiesbuilder({ sslmode: '' });
    assert.strictEqual(props['ssl'], undefined);
});

test('custom connection params are applied and may override defaults', function () {
    var props = propertiesbuilder({
        'v-custom-connection-params': 'socket_timeout=300000,ignore_unknown_config_key=false'
    });
    assert.strictEqual(props['socket_timeout'], '300000');
    assert.strictEqual(props['ignore_unknown_config_key'], 'false');
});

if (failures > 0) {
    console.error('\n' + failures + ' test(s) failed');
    process.exit(1);
}
console.log('\nAll tests passed');
