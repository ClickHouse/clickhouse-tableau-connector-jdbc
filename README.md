![](https://analytikaplus.ru/other-media/clickhouse-jdbc-header.png)
# Tableau connector to ClickHouse using JDBC driver by [ANALYTIKA PLUS](https://analytikaplus.ru?utm_source=github&utm_medium=repo&utm_campaign=tableau_clickhouse_connector)


## What's it?

An extension for Tableau Desktop / Tableau Server that simplifies the process of connecting Tableau to ClickHouse and extends support for standard Tableau functionality when working with ClickHouse (as compared to Generic ODBC/JDBC)

## What's the profit?

- In comparison with **Other Databases (ODBC)**: This connector uses a JDBC driver, which is faster than the ODBC driver in some cases (for example, creating Extracts), and is also much easier to install than ODBC (a cross-platform jar file, does not require compilation for individual platforms).
- In comparison with **Other Databases (JDBC)**: This connector has fine-tuning SQL queries to implement most of the standard Tableau functionality (including multiple JOINS in the data source, Sets, etc.) and has a friendly connection dialog ;)

## Future plans
- Publishing the connector in [extensiongallery.tableau.com](https://extensiongallery.tableau.com/connectors)

## Before you install

- Make sure you use Tableau **2020.3+**

## How to install (Tableau Desktop)
1. Download the latest [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases) (version 0.3.1 and higher required) and place the `clickhouse-jdbc-***-shaded.jar` to:
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
    - You need to create the folder if it doesn't already exist
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc/releases) page and place it to:
    - macOS: `~/Documents/My Tableau Repository/Connectors`
    - Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Run Tableau Desktop
4. In Tableau Desktop: **Connect** ➔ **To a Server** ➔ **ClickHouse (JDBC) by ANALYTIKA PLUS**

## How to install (Tableau Prep Builder)
1. Download the latest [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases) (version 0.3.1 and higher required) and place the `clickhouse-jdbc-***-shaded.jar` to:
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
    - You need to create the folder if it doesn't already exist
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc/releases) page and place it to:
    - macOS: `~/Documents/My Tableau Prep Repository/Connectors`
    - Windows: `C:\Users\[Windows User]\Documents\My Tableau Prep Repository\Connectors`
3. Run Tableau Prep Builder
4. In Tableau Prep Builder: **Connections** ➔ **+** ➔ **To a Server** ➔ **ClickHouse (JDBC) by ANALYTIKA PLUS**

## How to install (Tableau Server)
1. Download the latest [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases) (version 0.3.1 and higher required) and place the `clickhouse-jdbc-***-shaded.jar` to:
    - Linux: `/opt/tableau/tableau_driver/jdbc`
    - Windows: `C:\Program Files\Tableau\Drivers`
    - You need to create the directory if it doesn't already exist
    - *For Linux:* make sure directory is readable by the "tableau" user. To do this:
        - Create the directory:
            ```
            sudo mkdir -p /opt/tableau/tableau_driver/jdbc
            ```
        - Copy the downloaded driver file to the location, replacing `[/path/to/file]` with the path and `[driver file name]` with the name of the driver you downloaded:
            ```
            sudo cp [/path/to/file/][driver file name].jar /opt/tableau/tableau_driver/jdbc
            ```
        - Set permissions so the file is readable by the "tableau" user, replacing `[driver file name]` with the name of the driver you downloaded:
            ```
            sudo chmod 755 /opt/tableau/tableau_driver/jdbc/[driver file name].jar
            ```
2. Create a directory for Tableau connectors. This needs to be the same path on each machine, and on the same drive as the server is installed on. For example:
    - Windows: `C:\tableau_connectors`
    - Linux: `/opt/tableau_connectors` 
3. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc/releases) page and place it into the folder your created on each node.
4. Set the `native_api.connect_plugins_path` option [in TSM](https://onlinehelp.tableau.com/current/server-linux/en-us/cli_configuration-set_tsm.htm). For example:
    - Windows:
        ```
        tsm configuration set -k native_api.connect_plugins_path -v C:/tableau_connectors
        ```
    - Linux:
        ```
        tsm configuration set -k native_api.connect_plugins_path -v /opt/tableau_connectors
        ```
    - If you get a configuration error during this step, try adding the `--force-keys` option to the end of the previous command.
5. Apply the pending configuration changes. This restarts the server.
    ```
    tsm pending-changes apply
    ```
    - Note that whenever you add, remove, or update a connector, you need to restart the server to see the changes.
## Connection tips
### Initial SQL tab
**IMPORTANT**: to get the In/Out Sets working properly (as both a Dimension and a Filter) one have to add the following clause into the Initial SQL Section: 

```
SET join_use_nulls=1;
```

The above setting could be set either at the level of CH instance (in the `config.xml`) or as a session parameter, the Initial SQL is the place to put it for the latter.

**CAVEAT**: if the session ends, the In/Out Set would get the wrong result (all the Marks on a view would belong to the IN part). If this happened, simply Refreshing the view could do it right again.
### Advanced tab
You can configure connection parameters in the *Custom Parameters* field, the list of available parameters can be found in the file [ClickHouseConnectionSettings.java](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-jdbc/src/main/java/ru/yandex/clickhouse/settings/ClickHouseConnectionSettings.java)
- Additional custom parameters:
    - database=[your_db_name] *(default: "default")*
    - set_session_id=false *(default: "true")*
