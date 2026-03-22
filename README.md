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

## Tools

| Tool | Description |
|------|-------------|
| `get_user` | Get account information |
| `list_proxies` | List available proxies |
| `list_profiles` | List all DNS filtering profiles |
| `create_profile` | Create a new profile (optionally clone an existing one) |
| `update_profile` | Update a profile |
| `delete_profile` | Delete a profile |
| `list_profile_options` | List all available profile options |
| `update_profile_option` | Enable/disable a profile option (e.g. `ml_filter`, `block_rfc1918`) |
| `list_filters` | List native filters for a profile |
| `list_external_filters` | List third-party filters for a profile |
| `update_filter` | Enable/disable a single filter |
| `batch_update_filters` | Enable/disable multiple filters at once |
| `list_services` | List service rules for a profile |
| `update_service` | Block, bypass, spoof, or redirect a service |
| `list_service_categories` | List all service categories |
| `create_rule` | Create a custom DNS rule |
| `update_rule` | Update a custom DNS rule |
| `delete_rule` | Delete a custom DNS rule |
| `list_groups` | List rule folders for a profile |
| `create_group` | Create a rule folder |
| `update_group` | Update a rule folder |
| `delete_group` | Delete a rule folder |
| `list_devices` | List all devices/DNS endpoints |
| `create_device` | Create a new device |
| `update_device` | Update a device |
| `delete_device` | Delete a device |
| `list_rules` | List custom DNS rules for a profile (optionally by folder) |
| `get_default_rule` | Get the default rule for a profile |
| `update_default_rule` | Update the default rule for a profile |
| `list_all_services` | List the full Control D service catalog |
| `list_device_types` | List available device types |
| `list_analytics_levels` | List analytics log levels |
| `get_organization` | Get organization information |
| `list_organization_members` | List organization members |
| `list_sub_organizations` | List sub-organizations |
| `create_sub_organization` | Create a sub-organization |
| `update_organization` | Update organization settings |
| `get_payments` | Get payment history |
| `get_subscriptions` | Get active subscriptions |
| `get_products` | Get active products |
| `get_caller_ip` | Get your current IP as seen by Control D |
| `get_network` | Get network stats on Control D services |
| `list_access` | List authorized IPs for a device |
| `add_access` | Whitelist IP addresses for a device |
| `remove_access` | Remove IP addresses from a device |
