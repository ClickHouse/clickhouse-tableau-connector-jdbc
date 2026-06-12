# ClickHouse Tableau JDBC connector

## Intro

This is an extension for Tableau Desktop / Tableau Server that simplifies the process of connecting Tableau to ClickHouse and extends support for standard Tableau functionality when working with ClickHouse (as compared to Generic ODBC/JDBC)

## Features

- In comparison with **Other Databases (ODBC)**: this connector uses the JDBC driver, which is faster than the ODBC driver in some cases (for example, creating Extracts), and is also much easier to install than ODBC (a cross-platform jar file, which does not require compiling for individual platforms).
- In comparison with **Other Databases (JDBC)**: this connector has fine-tuning SQL queries to implement most of the standard Tableau functionality (including multiple JOINS in the data source, Sets, etc.), and it has a friendly connection dialog ;)

## Before you install

Requirements
- Tableau **2024.2+** — the JDBC driver requires Java 17+, which is bundled with Tableau starting from 2024.2
- ClickHouse **24.x+** (**25.6+ recommended** — the connector uses `toTimeWithFixedDate()` for the MAKETIME function, available unconditionally since 25.6)
- ClickHouse JDBC driver **0.9.8+** (JDBC V2). The connector builds connection parameters for the V2 driver only; V1-era options (`custom_http_params`, `typeMappings`, `sslmode`) are no longer used

> [!IMPORTANT]
> The account used for the connection must **not** have `readonly=1`. The V2 driver sends server settings (e.g. `async_insert=0`, `wait_end_of_query=0`) with every request, which a `readonly=1` profile rejects. Use `readonly=2` (settings changes allowed, writes denied) or `readonly=0`. Check with `SELECT getSetting('readonly')`.

## Installation (Tableau Desktop)
1. Download the [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-java/releases) (version 0.9.8 or newer), and place the `clickhouse-jdbc-0.9.8-all-dependencies.jar` to:
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
    - You need to create the folder if it doesn't already exist
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/releases) page, and place it to:
    - macOS: `~/Documents/My Tableau Repository/Connectors`
    - Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Run Tableau Desktop
4. In Tableau Desktop: **Connect** ➔ **To a Server** ➔ **ClickHouse JDBC by ClickHouse, Inc.**

## Installation (Tableau Prep Builder)
1. Download the [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-java/releases) (version 0.9.8 or newer), and place the `clickhouse-jdbc-0.9.8-all-dependencies.jar` to:
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
    - You need to create the folder if it doesn't already exist
2. Download the latest `clickhouse-jdbc.taco` from the [Releases](https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/releases) page and place it to:
    - macOS: `~/Documents/My Tableau Prep Repository/Connectors`
    - Windows: `C:\Users\[Windows User]\Documents\My Tableau Prep Repository\Connectors`
3. Run Tableau Prep Builder
4. In Tableau Prep Builder: **Connections** ➔ **+** ➔ **To a Server** ➔ **ClickHouse JDBC by ClickHouse, Inc.**

## Installation (Tableau Server)
1. Download the [Clickhouse JDBC Driver](https://github.com/ClickHouse/clickhouse-java/releases) (version 0.9.8 or newer), and place the `clickhouse-jdbc-0.9.8-all-dependencies.jar` to:
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

## Installing an unsigned .taco (internal builds)
Internally distributed builds of this connector are not signed with a DigiCert certificate, so Tableau's signature verification must be disabled. This also works around the OCSP verification bug in Tableau 2025.1+ that rejects previously valid signatures ([issue #96](https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues/96)).
- **Tableau Desktop** — start with the flag:
    ```
    tableau.exe -DDisableVerifyConnectorPluginSignature=true
    ```
    (macOS: pass the same `-D` flag to the Tableau binary inside the app bundle)
- **Tableau Server**:
    ```
    tsm configuration set -k native_api.disable_verify_connector_plugin_signature -v true
    tsm pending-changes apply
    ```
## Connection tips
### Initial SQL tab
If the *Set Session ID* checkbox is activated on the Advanced tab (by default), feel free to set session level [settings](https://clickhouse.com/docs/en/operations/settings/settings/) using
```
SET my_setting=value;
``` 
### Advanced tab


In 99% of cases you don't need the Advanced tab, for the remaining 1% you can use the following settings:
- **JDBC driver properties**. Driver-level connection properties passed as `key=value` pairs separated by commas, see the [driver configuration reference](https://clickhouse.com/docs/integrations/language-clients/java/jdbc). By default, `socket_timeout=300000` (milliseconds) is specified; increase it if some extracts take a very long time to refresh. The connector also sets `ignore_unknown_config_key=true` by default, so unknown property names produce a WARN in the driver log instead of a connection failure; pass `ignore_unknown_config_key=false` in this field to make typos fail fast.
- **ClickHouse server settings**. `key=value` pairs separated by commas, sent as [ClickHouse server settings](https://clickhouse.com/docs/operations/settings/settings) with every request of the connection (each key is passed to the driver as `clickhouse_setting_<key>`). For example, `max_result_rows=1000000`. This field replaces the old *JDBC Driver custom_http_params* field with the same `key=value` semantics — saved data sources keep working.
- **JDBC Driver URL Parameters**. Raw driver URL parameters, applied **last** — they override everything set by the connector or the fields above. For example, passing `clickhouse_setting_session_id=my-session` here overrides the session id generated by the *Set Session ID* checkbox.
- **Set Session ID** checkbox. It is needed to set session-level settings in Initial SQL tab, generates a `session_id` with a timestamp and a pseudo-random number in the format "tableau-jdbc-connector-*{timestamp}*-*{number}*"

Priority order (lowest to highest): connector defaults (`join_use_nulls=1`) ➔ *Set Session ID* checkbox ➔ *ClickHouse server settings* ➔ *JDBC Driver URL Parameters*.
### UInt64, Int128, (U)Int256 data types (migration note)
Since JDBC driver 0.9.x (V2), large integer fields are reported as **NUMERIC** and read by Tableau as decimal numbers, not strings as in older connector versions. Note:
- Values above 2^53 lose precision when used in float-based calculations in Tableau.
- `COUNTD([myUInt64])` and using such fields as a *Dimension* keep working fine.
- If you need exact string representation (e.g. IDs like Watch ID / Visit ID), cast on the ClickHouse side: `toString(myUInt64)` in a custom SQL query or a view.
- Workbooks created with connector v0.x that relied on the old `typeMappings` behavior will see these fields change type from String to Number. The driver's `typeMappings` option was removed in JDBC V2; a replacement (`jdbc_type_map`) is expected in driver 0.10.0.
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
- **`KURTOSISP([my_number])`** — Computes the kurtosis of a sequence. The equivalent of [`kurtPop()`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/kurtpop/#kurtpop).
- **`MEDIAN_EXACT([my_number])`** *(added in v0.1.3)* — Exactly computes the median of a numeric data sequence. Equivalent of [`quantileExact(0.5)(...)`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
- **`MOD([my_number_1], [my_number_2])`** — Calculates the remainder after division. If arguments are floating-point numbers, they are pre-converted to integers by dropping the decimal portion. Equivalent of [`modulo()`](https://clickhouse.com/docs/en/sql-reference/functions/arithmetic-functions/#modulo).
- **`PERCENTILE_EXACT([my_number], [level_float])`** *(added in v0.1.3)* — Exactly computes the percentile of a numeric data sequence. The recommended level range is [0.01, 0.99]. Equivalent of [`quantileExact()()`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/quantileexact/#quantileexact).
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
- **`SHA256([my_string])`** *(added in v0.2.1)* — Calculates SHA-256 hash from a string and returns the resulting set of bytes as a string (FixedString). Convenient to use with the `HEX()` function, for example, `HEX(SHA256([my_string]))`. Equivalent of [`SHA256()`](https://clickhouse.com/docs/en/sql-reference/functions/hash-functions/#sha).
- **`SKEWNESS([my_number])`** — Computes the sample skewness of a sequence. Equivalent of [`skewSamp()`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/skewsamp/#skewsamp).
- **`SKEWNESSP([my_number])`** — Computes the skewness of a sequence. Equivalent of [`skewPop()`](https://clickhouse.com/docs/en/sql-reference/aggregate-functions/reference/skewpop/#skewpop).
- **`TO_TYPE_NAME([field])`** *(added in v0.2.1)* — Returns a string containing the ClickHouse type name of the passed argument. Equivalent of [`toTypeName()`](https://clickhouse.com/docs/en/sql-reference/functions/other-functions/#totypenamex).
- **`TRUNC([my_float])`** — It is the same as the `FLOOR([my_float])` function. Equivalent of [`trunc()`](https://clickhouse.com/docs/en/sql-reference/functions/rounding-functions/#truncx-n-truncatex-n).
- **`UNHEX([my_string])`** *(added in v0.2.1)* — Performs the opposite operation of `HEX()`. Equivalent of [`unhex()`](https://clickhouse.com/docs/en/sql-reference/functions/encoding-functions/#unhexstr).

## Troubleshooting
- **A typo in *JDBC driver properties* silently does nothing.** With the default `ignore_unknown_config_key=true`, the driver logs `Unknown and unmapped config properties` as WARN in `jprotocolserver.log` (in *My Tableau Repository/Logs*) instead of failing. Pass `ignore_unknown_config_key=false` in the *JDBC driver properties* field to surface such errors at connection time.
- **`SESSION_IS_LOCKED` errors.** A ClickHouse session allows only one running query at a time. The connector intentionally does not advertise query cancellation support (`KILL QUERY` from the same session would lock itself out), but if you see this error with parallel queries, untick the *Set Session ID* checkbox (this disables `SET` statements in Initial SQL).
- **Connection fails for a `readonly=1` account.** Not fixable on the connector side — the JDBC V2 driver sends server settings with every request. Ask your DBA for a `readonly=2` profile.

## Tests
The connector is being tested with the [TDVT framework](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) and currently maintains a 97% coverage ratio.

## Acknowledgement

Originally developed by [ANALYTIKA PLUS](https://analytikaplus.ru?utm_source=github&utm_medium=repo&utm_campaign=tableau_clickhouse_connector)
