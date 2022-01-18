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

- Make sure you...
  - use Tableau **2020.3+**
  - use ClickHouse **20.7+** (otherwise use [0.1.4 connector release](https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc/releases/tag/v0.1.4))

## How to install (Tableau Desktop)
1. Download the [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases) (version 0.3.2-patch2 required) and place the `clickhouse-jdbc-0.3.2-patch2-shaded.jar` to:
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
    - You need to create the folder if it doesn't already exist
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc/releases) page and place it to:
    - macOS: `~/Documents/My Tableau Repository/Connectors`
    - Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Run Tableau Desktop
4. In Tableau Desktop: **Connect** ➔ **To a Server** ➔ **ClickHouse JDBC by ANALYTIKA PLUS**

## How to install (Tableau Prep Builder)
1. Download the [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases) (version 0.3.2-patch2 required) and place the `clickhouse-jdbc-0.3.2-patch2-shaded.jar` to:
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
    - You need to create the folder if it doesn't already exist
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc/releases) page and place it to:
    - macOS: `~/Documents/My Tableau Prep Repository/Connectors`
    - Windows: `C:\Users\[Windows User]\Documents\My Tableau Prep Repository\Connectors`
3. Run Tableau Prep Builder
4. In Tableau Prep Builder: **Connections** ➔ **+** ➔ **To a Server** ➔ **ClickHouse JDBC by ANALYTIKA PLUS**

## How to install (Tableau Server)
1. Download the [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases) (version 0.3.2-patch2 required) and place the `clickhouse-jdbc-0.3.2-patch2-shaded.jar` to:
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
If the *Set Session ID* checkbox is activated on the Advanced tab (by default), feel free to set session level [settings](https://clickhouse.com/docs/en/operations/settings/settings/) using
```
SET my_setting=value;
``` 
### Advanced tab
In 99% of cases you don't need the Advanced tab, for the remaining 1% you can use the following settings:
- **Custom Connection Parameters**. By default, `socket_timeout` is already specified, this parameter may need to be changed if some extracts are updated for a very long time. The value of this parameter is specified in milliseconds. The rest of the parameters can be found [here](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java), add them in this field separated by commas
- **JDBC Driver custom_http_params**. This field allows you to drop some parameters into the ClickHouse connection string by passing values to the [`custom_http_params` parameter of the driver](https://github.com/ClickHouse/clickhouse-jdbc#configuration). For example, this is how `session_id` is specified when the *Set Session ID* checkbox is activated
- **JDBC Driver typeMappings**. This field allows you to [pass a list of ClickHouse data type mappings to Java data types used by the JDBC driver](https://github.com/ClickHouse/clickhouse-jdbc#configuration). The connector automatically displays large Integers as strings thanks to this parameter, you can change this by passing your mapping set *(I do not know why)* using
    ```
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
    Read more about mapping in the corresponding section

- **JDBC Driver URL Parameters**. You can pass the remaining [driver parameters](https://github.com/ClickHouse/clickhouse-jdbc#configuration), for example `jdbcCompliance`, in this field. Be careful, the parameter values must be passed in the URL Encoded format, and in the case of passing `custom_http_params` or `typeMappings` in this field and in the previous fields of the Advanced tab, the values of the preceding two fields on the Advanced tab have a higher priority
- **Set Session ID** checkbox. It is needed to set session level settings in *Initial SQL tab*, generates a `session_id` with a timestamp and a pseudo-random number in the format "tableau-jdbc-connector-*{timestamp}*-*{number}*"
### Limited support for UInt64, Int128, (U)Int256 data types
By default, the driver displays fields of types *UInt64, Int128, (U)Int256* as strings, **but it displays, not converts**. This means that when you try to write the next calculated field, you will get an error
```
LEFT([myUInt256], 2) // Error!
```
In order to work with large Integer fields as with strings, it is necessary to explicitly wrap the field in the STR() function
```
LEFT(STR([myUInt256]), 2) // Works well!
```
However, such fields are most often used to find the number of unique values *(IDs as Watch ID, Visit ID in Yandex.Metrika)* or as a *Dimension* to specify the detail of the visualization, it works well.
```
COUNTD([myUInt256]) // Works well too!
```
When using the data preview (View data) of a table with UInt64 fields, an error does not appear now.

