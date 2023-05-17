# ClickHouse Tableau JDBC connector

## Intro

This is an extension for Tableau Desktop / Tableau Server that simplifies the process of connecting Tableau to ClickHouse and extends support for standard Tableau functionality when working with ClickHouse (as compared to Generic ODBC/JDBC)

## Features

- In comparison with **Other Databases (ODBC)**: this connector uses the JDBC driver, which is faster than the ODBC driver in some cases (for example, creating Extracts), and is also much easier to install than ODBC (a cross-platform jar file, which does not require compiling for individual platforms).
- In comparison with **Other Databases (JDBC)**: this connector has fine-tuning SQL queries to implement most of the standard Tableau functionality (including multiple JOINS in the data source, Sets, etc.), and it has a friendly connection dialog ;)

## Before you install

Requirements
- Tableau **2020.4+**
- ClickHouse **20.7+**

## Installation (Tableau Desktop)
1. Download the [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases/tag/v0.3.2-patch8) (version 0.3.2-patch8 required), and place the `clickhouse-jdbc-0.3.2-patch8-shaded.jar` to:
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
    - You need to create the folder if it doesn't already exist
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/releases) page, and place it to:
    - macOS: `~/Documents/My Tableau Repository/Connectors`
    - Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Run Tableau Desktop
4. In Tableau Desktop: **Connect** ➔ **To a Server** ➔ **ClickHouse JDBC by ClickHouse, Inc.**

## Installation (Tableau Prep Builder)
1. Download the [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases/tag/v0.3.2-patch8) (version 0.3.2-patch8 required) and place the `clickhouse-jdbc-0.3.2-patch8-shaded.jar` to:
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
    - You need to create the folder if it doesn't already exist
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/releases) page and place it to:
    - macOS: `~/Documents/My Tableau Prep Repository/Connectors`
    - Windows: `C:\Users\[Windows User]\Documents\My Tableau Prep Repository\Connectors`
3. Run Tableau Prep Builder
4. In Tableau Prep Builder: **Connections** ➔ **+** ➔ **To a Server** ➔ **ClickHouse JDBC by ClickHouse, Inc.**

## Installation (Tableau Server)
1. Download the [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-jdbc/releases/tag/v0.3.2-patch8) (version 0.3.2-patch8 required) and place the `clickhouse-jdbc-0.3.2-patch8-shaded.jar` to:
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
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/releases) page and place it into these folders on each node:
    - Linux: `/opt/tableau/connectors`
    - Windows: `C:\Program Files\Tableau\Connectors`
3. Restart the server.
    ```
    tsm restart
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
- **Set Session ID** checkbox. It is needed to set session level settings in Initial SQL tab, generates a `session_id` with a timestamp and a pseudo-random number in the format "tableau-jdbc-connector-*{timestamp}*-*{number}*"
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
## Analysis tips
### MEDIAN() and PERCENTILE() functions
- In Live mode the MEDIAN() and PERCENTILE() functions (since connector v0.1.3 release) use the [ClickHouse quantile()() function](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/quantile/), which significantly speeds up the calculation, but uses sampling. If you want to get accurate calculation results, then use functions `MEDIAN_EXACT()` and `PERCENTILE_EXACT()` (based on [quantileExact()()](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/quantileexact/)).
- In Extract mode you can't use MEDIAN_EXACT() and PERCENTILE_EXACT() because MEDIAN() and PERCENTILE() are always accurate (and slow).
### Additional functions for Calculated Fields in Live mode
ClickHouse has a huge number of functions that can be used for data analysis — much more than Tableau supports. For the convenience of users, we have added new functions that are available for use in Live mode when creating Calculated Fields. Unfortunately, it is not possible to add descriptions to these functions in the Tableau interface, so we will add a description for them right here.
- **[`-If` Aggregation Combinator](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/combinators/#-if)** *(added in v0.2.3)* - allows to have Row-Level Filters right in the Aggregate Calculation. `SUM_IF(), AVG_IF(), COUNT_IF(), MIN_IF() & MAX_IF()` functions have been added.
- **`BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int])`** *(added in v0.2.1)* — Forget about boring bar charts! Use `BAR()` function instead (equivalent of [`bar()`](https://clickhouse.com/docs/en/sql-reference/functions/other-functions/#function-bar) in ClickHouse). For example, this calculated field returns nice bars as String:
    ```
    BAR([my_int], [min_val_int], [max_val_int], [bar_string_length_int]) + "  " + FORMAT_READABLE_QUANTITY([my_int])
    ```
    ```
    == BAR() ==
    ██████████████████▊  327.06 million
    █████  88.02 million
    ███████████████  259.37 million
    ```
- **`COUNTD_UNIQ([my_field])`** *(added in v0.2.0)* — Calculates the approximate number of different values of the argument. Equivalent of [uniq()](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/uniq/). Much faster than COUNTD().
- **`DATE_BIN('day', 10, [my_datetime_or_date])`** *(added in v0.2.1)* — equivalent of [`toStartOfInterval()`](https://clickhouse.com/docs/en/sql-reference/functions/date-time-functions/#tostartofintervaltime-or-data-interval-x-unit-time-zone) in ClickHouse. Rounds down a Date or Date & Time to the given interval, for example:
    ```
     == my_datetime_or_date == | == DATE_BIN('day', 10, [my_datetime_or_date]) ==
        28.07.2004 06:54:50    |              21.07.2004 00:00:00
        17.07.2004 14:01:56    |              11.07.2004 00:00:00
        14.07.2004 07:43:00    |              11.07.2004 00:00:00
    ```
- **`FORMAT_READABLE_QUANTITY([my_integer])`** *(added in v0.2.1)* — Returns a rounded number with a suffix (thousand, million, billion, etc.) as a string. It is useful for reading big numbers by human. Equivalent of [`formatReadableQuantity()`](https://clickhouse.com/docs/en/sql-reference/functions/other-functions/#formatreadablequantityx).
- **`FORMAT_READABLE_TIMEDELTA([my_integer_timedelta_sec], [optional_max_unit])`** *(added in v0.2.1)* — Accepts the time delta in seconds. Returns a time delta with (year, month, day, hour, minute, second) as a string. `optional_max_unit` is maximum unit to show. Acceptable values: `seconds`, `minutes`, `hours`, `days`, `months`, `years`. Equivalent of [`formatReadableTimeDelta()`](https://clickhouse.com/docs/en/sql-reference/functions/other-functions/#formatreadabletimedelta).
- **`GET_SETTING([my_setting_name])`** *(added in v0.2.1)* — Returns the current value of a custom setting. Equivalent of [`getSetting()`](https://clickhouse.com/docs/en/sql-reference/functions/other-functions/#getSetting).
- **`HEX([my_string])`** *(added in v0.2.1)* — Returns a string containing the argument’s hexadecimal representation. Equivalent of [`hex()`](https://clickhouse.com/docs/en/sql-reference/functions/encoding-functions/#hex).
- **`KURTOSIS([my_number])`** — Computes the sample kurtosis of a sequence. Equivalent of [`kurtSamp()`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/kurtsamp/#kurtsamp).
- **`KURTOSISP([my_number])`** — Computes the kurtosis of a sequence. Equivalent of [`kurtPop()`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/kurtpop/#kurtpop).
- **`MEDIAN_EXACT([my_number])`** *(added in v0.1.3)* — Exactly computes the median of a numeric data sequence. Equivalent of [`quantileExact(0.5)(...)`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
- **`MOD([my_number_1], [my_number_2])`** — Calculates the remainder after division. If arguments are floating-point numbers, they are pre-converted to integers by dropping the decimal portion. Equivalent of [`modulo()`](https://clickhouse.com/docs/en/sql-reference/functions/arithmetic-functions/#modulo).
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(added in v0.1.3)* — Exactly computes the percentile of a numeric data sequence. Recommended level range is [0.01, 0.99]. Equivalent of [`quantileExact()()`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
- **`PROPER([my_string])`** *(added in v0.2.5)* - Converts a text string so the first letter of each word is capitalized and the remaining letters are in lowercase. Spaces and non-alphanumeric characters such as punctuation also act as separators. For example:
    ```
    PROPER("PRODUCT name") => "Product Name"
    ```
    ```
    PROPER("darcy-mae") => "Darcy-Mae"
    ```
- **`RAND()`** *(added in v0.2.1)* — returns integer (UInt32) number, for example `3446222955`. Equivalent of [`rand()`](https://clickhouse.com/docs/en/sql-reference/functions/random-functions/#rand).
- **`RANDOM()`** *(added in v0.2.1)* — unofficial [`RANDOM()`](https://kb.tableau.com/articles/issue/random-function-produces-inconsistent-results) Tableau function, which returns float between 0 and 1.
- **`RAND_CONSTANT([optional_field])`** *(added in v0.2.1)* — Produces a constant column with a random value. Something like `{RAND()}` Fixed LOD, but faster. Equivalent of [`randConstant()`](https://clickhouse.com/docs/en/sql-reference/functions/random-functions/#randconstant).
- **`REAL([my_number])`** — Casts field to float (Float64). Details [`here`](https://clickhouse.com/docs/en/sql-reference/data-types/decimal/#operations-and-result-type).
- **`SHA256([my_string])`** *(added in v0.2.1)* — Calculates SHA-256 hash from a string and returns the resulting set of bytes as string (FixedString). Convenient to use with the `HEX()` function, for example, `HEX(SHA256([my_string]))`. Equivalent of [`SHA256()`](https://clickhouse.com/docs/en/sql-reference/functions/hash-functions/#sha).
- **`SKEWNESS([my_number])`** — Computes the sample skewness of a sequence. Equivalent of [`skewSamp()`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/skewsamp/#skewsamp).
- **`SKEWNESSP([my_number])`** — Computes the skewness of a sequence. Equivalent of [`skewPop()`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/skewpop/#skewpop).
- **`TO_TYPE_NAME([field])`** *(added in v0.2.1)* — Returns a string containing the ClickHouse type name of the passed argument. Equivalent of [`toTypeName()`](https://clickhouse.com/docs/en/sql-reference/functions/other-functions/#totypenamex).
- **`TRUNC([my_float])`** — It is the same as the `FLOOR([my_float])` function. Equivalent of [`trunc()`](https://clickhouse.com/docs/en/sql-reference/functions/rounding-functions/#truncx-n-truncatex-n).
- **`UNHEX([my_string])`** *(added in v0.2.1)* — Performs the opposite operation of `HEX()`. Equivalent of [`unhex()`](https://clickhouse.com/docs/en/sql-reference/functions/encoding-functions/#unhexstr).

## Future plans
- Publishing the connector at [exchange.tableau.com](https://exchange.tableau.com/connectors)

## Acknowledgement

Originally developed by [ANALYTIKA PLUS](https://analytikaplus.ru?utm_source=github&utm_medium=repo&utm_campaign=tableau_clickhouse_connector)