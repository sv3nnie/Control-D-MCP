# Unofficial Control D MCP server

An MCP (Model Context Protocol) server for the [Control D](https://controld.com) DNS service API. Lets you manage profiles, devices, rules, filters, and more through any MCP-compatible client (e.g. Claude Desktop).

## Usage

Add this to your MCP client config:

```json
{
  "control-d": {
    "command": "npx",
    "args": ["-y", "@sv3nnie/control-d-mcp"],
    "env": {
      "API_TOKEN": "your-api-token"
    }
  }
}
```

Get your API token from the [Control D dashboard](https://controld.com/dashboard/api).

For organization accounts, profile, endpoint, rule, and access-control tools accept
an optional `organization_id`. This sends Control D's `X-Force-Org-Id` header so a
parent organization token can manage a child sub-organization.

## Tools

### Account

| Tool            | Description                              |
| --------------- | ---------------------------------------- |
| `get_user`      | Get account information                  |
| `get_caller_ip` | Get your current IP as seen by Control D |
| `get_network`   | Get network stats on Control D services  |
| `list_proxies`  | List available proxies                   |

### Profiles

| Tool                    | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `list_profiles`         | List all DNS filtering profiles                                     |
| `create_profile`        | Create a new profile (optionally clone an existing one)             |
| `update_profile`        | Update a profile                                                    |
| `delete_profile`        | Delete a profile                                                    |
| `list_profile_options`  | List all available profile options                                  |
| `update_profile_option` | Enable/disable a profile option (e.g. `ml_filter`, `block_rfc1918`) |

### Filters

| Tool                    | Description                             |
| ----------------------- | --------------------------------------- |
| `list_filters`          | List native filters for a profile       |
| `list_external_filters` | List third-party filters for a profile  |
| `update_filter`         | Enable/disable a single filter          |
| `batch_update_filters`  | Enable/disable multiple filters at once |

### Services

| Tool                      | Description                                 |
| ------------------------- | ------------------------------------------- |
| `list_services`           | List service rules for a profile            |
| `update_service`          | Block, bypass, spoof, or redirect a service |
| `list_service_categories` | List all service categories                 |
| `list_category_services`  | List all services in a catalog category     |

### Rules

| Tool                  | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `list_rules`          | List custom DNS rules for a profile (optionally by folder) |
| `create_rule`         | Create a custom DNS rule, optionally with a comment        |
| `update_rule`         | Update custom DNS rule(s) by hostname, including comments  |
| `delete_rule`         | Delete a custom DNS rule                                   |
| `get_default_rule`    | Get the default rule for a profile                         |
| `update_default_rule` | Update the default rule for a profile                      |
| `list_groups`         | List rule folders for a profile                            |
| `create_group`        | Create a rule folder                                       |
| `update_group`        | Update a rule folder                                       |
| `delete_group`        | Delete a rule folder                                       |

### Devices

| Tool                             | Description                         |
| -------------------------------- | ----------------------------------- |
| `list_devices`                   | List all devices/DNS endpoints      |
| `create_device`                  | Create a new device                 |
| `update_device`                  | Update a device                     |
| `delete_device`                  | Delete a device                     |
| `list_device_types`              | List available device types         |
| `list_analytics_levels`          | List analytics log levels           |
| `list_analytics_storage_regions` | List analytics storage regions      |
| `list_access`                    | List authorized IPs for a device    |
| `add_access`                     | Whitelist IP addresses for a device |
| `remove_access`                  | Remove IP addresses from a device   |

### Organization

| Tool                        | Description                  |
| --------------------------- | ---------------------------- |
| `get_organization`          | Get organization information |
| `update_organization`       | Update organization settings |
| `list_organization_members` | List organization members    |
| `list_sub_organizations`    | List sub-organizations       |
| `create_sub_organization`   | Create a sub-organization    |

### Billing

| Tool                | Description              |
| ------------------- | ------------------------ |
| `get_payments`      | Get payment history      |
| `get_subscriptions` | Get active subscriptions |
| `get_products`      | Get active products      |

### Analytics

| Tool                               | Description                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `get_analytics_auth_token`         | Obtain a short-lived single-use realtime token                                          |
| `get_activity_log`                 | Read paginated historical DNS queries as JSON                                           |
| `delete_activity_log`              | Queue deletion of query data; without filters, deletes all data in the account's region |
| `export_activity_log_csv`          | Export historical DNS queries as CSV                                                    |
| `stream_activity_log`              | Collect a bounded batch of realtime DNS query events                                    |
| `get_analytics_data_availability`  | Read analytics data cutoff and availability information                                 |
| `get_statistics_timeseries`        | Read an aggregate query time series                                                     |
| `get_statistics_timeseries_group`  | Read time series grouped by a column                                                    |
| `get_statistics_count`             | Count matching DNS queries                                                              |
| `get_statistics_count_group`       | Count matching DNS queries grouped by a column                                          |
| `get_statistics_trend_group`       | Compare a grouped count with a baseline interval                                        |
| `get_admin_actions`                | Read organization admin action logs                                                     |
| `get_analytics_clients`            | Read endpoint and client metadata                                                       |
| `delete_analytics_client_metadata` | Delete client metadata while retaining query history                                    |
| `delete_analytics_client_alias`    | Remove a client alias                                                                   |
| `set_analytics_client_alias`       | Create or update a client alias                                                         |
