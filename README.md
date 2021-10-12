![](https://analytikaplus.ru/other-media/clickhouse-jdbc-header.png)
## **clickhouse-tableau-connector-jdbc** — Tableau connector to ClickHouse using JDBC driver

### What's it?

An extension for Tableau Desktop / Tableau Server that simplifies the process of connecting Tableau to ClickHouse and extends support for standard Tableau functionality when working with ClickHouse (as compared to Generic  ODBC/JDBC)

### What is the profit?

- In comparison with **Other Databases (ODBC)**: This connector uses a JDBC driver, which is faster than the ODBC driver in some cases (for example, creating Extracts), and is also much easier to install than ODBC (a cross-platform jar file, does not require compilation for individual platforms).
- In comparison with **Other Databases (JDBC)**: This connector has fine-tuning SQL queries to implement most of the standard Tableau functionality (including multiple JOINS in the data source, Sets, etc.) and has a friendly connection setup window ;)

### Future plans
- Signing of the connector (.taco) with a Code Signing certificate to simplify the installation and use process
- Publishing the connector in extensiongallery.tableau.com

### Before you install

- Make shure you use Tableau **2020.4+**

### How to install (Tableau Desktop)
1. Download the latest [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases) (version 0.3.1 and higher required) and place the `clickhouse-jdbc-***-shaded.jar` to:
- macOS: `~/Library/Tableau/Drivers`
- Windows: `C:\Program Files\Tableau\Drivers`
- You need to create the folder if it doesn't already exist
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc/releases) page and place it to:
- macOS: `~/Documents/My Tableau Repository/Connectors`
- Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Open Terminal/cmd.exe, run:
- macOS:
```
~/Applications/Tableau\ Desktop\ 202X.X.app/Contents/MacOS/Tableau -DDisableVerifyConnectorPluginSignature=true
```
- Windows:
```
C:\Program Files\Tableau\Tableau 202X.X\bin\tableau.exe" -DDisableVerifyConnectorPluginSignature=true
```
4. In Tableau Desktop: **Connect** ➔ **To a Server** ➔ **ClickHouse (JDBC) by Analytika Plus**

### How to install (Tableau Server)
1. Create a directory for Tableau connectors. This needs to be the same path on each machine, and on the same drive as the server is installed on. For example:
- Windows: `C:\tableau_connectors`
- Linux: `/opt/tableau_connectors` 
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc/releases) page and place it into the folder your created on each node.
3. Set the `native_api.connect_plugins_path` option [in TSM](https://onlinehelp.tableau.com/current/server-linux/en-us/cli_configuration-set_tsm.htm). For example:
- Windows:
```
tsm configuration set -k native_api.connect_plugins_path -v C:/tableau_connectors
```
- Linux:
```
tsm configuration set -k native_api.connect_plugins_path -v /opt/tableau_connectors
```
- If you get a configuration error during this step, try adding the `--force-keys` option to the end of the previous command.
4. Set the `native_api.disable_verify_connector_plugin_signature`  option. 
```
tsm configuration set -k native_api.disable_verify_connector_plugin_signature  -v true
```
5. Apply the pending configuration changes. This restarts the server.
```
tsm pending-changes apply
```
- Note that whenever you add, remove, or update a connector, you need to restart the server to see the changes.