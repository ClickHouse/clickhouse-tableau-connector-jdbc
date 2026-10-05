### Release [0.4.0], 2025-06-15 (To be distributed on Tableau Exchange)
### Improvements
- Allow a close-set of characters to be used as column names by the connector
- Fix null values when using greatest and least functions ([#89](https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/pull/89))
- Identify the Tableau product and version in the HTTP user agent sent to ClickHouse (e.g. `client_name=TableauDesktop/2024.2`, visible in `system.query_log.http_user_agent`)
- Fix connection failure with JDBC driver 0.9+ by ignoring driver-unknown properties (`ignore_unknown_config_key=true`)