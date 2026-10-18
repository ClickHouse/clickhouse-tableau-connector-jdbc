### Release [0.4.1], 2026-10-18 (To be distributed on Tableau Exchange)
### Bug fixes
- Fix `COUNTD` returning the row count instead of the distinct count on columns that are part of the table's `ORDER BY` key. The JDBC driver reports the sort key as a primary key, so Tableau assumed it was unique; primary key metadata is now disabled (`CAP_JDBC_METADATA_READ_PRIMARYKEYS=no`)
- Fix connection failure with JDBC driver 0.9+ by ignoring driver-unknown properties (`ignore_unknown_config_key=true`)
### Improvements
- Identify the Tableau product and version in the HTTP user agent sent to ClickHouse (e.g. `client_name=TableauDesktop/2024.2`, visible in `system.query_log.http_user_agent`)

### Release [0.4.0], 2025-06-15 (To be distributed on Tableau Exchange)
### Improvements
- Allow a close-set of characters to be used as column names by the connector
- Fix null values when using greatest and least functions ([#89](https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/pull/89))
