![](https://analytikaplus.ru/other-media/clickhouse-jdbc-header.png)
## **clickhouse-tableau-connector-jdbc** — Tableau connector to ClickHouse using JDBC driver

### Before you install

- Make shure you use Tableau Desktop **2020.4+**

### How to install (macOS)
- Download the latest [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases) (version 0.3.1 and higher required) and place the `clickhouse-jdbc-***-shaded.jar` to ` /Users/%username%/Library/Tableau/Drivers`
- Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc/releases) page and place it to `~/Documents/My Tableau Repository/Connectors` directory
- Open Terminal, run `~/Applications/Tableau\ Desktop\ 202X.X.app/Contents/MacOS/Tableau -DDisableVerifyConnectorPluginSignature=true`
- In Tableau Desktop: **Connect** ➔ **To a Server** ➔ **ClickHouse (JDBC) by Analytika Plus**