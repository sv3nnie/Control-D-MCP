#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ControlDClient } from "./api.js";

const apiKey = process.env.API_TOKEN;
if (!apiKey) {
  console.error("API_TOKEN environment variable is required");
  process.exit(1);
}

const client = new ControlDClient(apiKey);

const server = new Server(
  { name: "control-d-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  // Account
  {
    name: "get_user",
    description: "Get Control D account information (email, status, 2FA, proxy access)",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  // Proxies
  {
    name: "list_proxies",
    description: "List all available proxies for service/rule redirection",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  // Profiles
  {
    name: "list_profiles",
    description: "List all DNS filtering profiles on the account",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "create_profile",
    description: "Create a new DNS filtering profile, optionally cloning an existing one",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Profile name" },
        clone_profile_id: { type: "string", description: "ID of a profile to clone (optional)" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_profile",
    description: "Update an existing DNS filtering profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        name: { type: "string", description: "New profile name" },
        disable_ttl: { type: "number", description: "TTL disable flag (0 or 1)" },
        lock_status: { type: "number", description: "Lock status (0 or 1)" },
        lock_message: { type: "string", description: "Message shown when locked" },
        password: { type: "string", description: "Profile password" },
      },
      required: ["profile_id"],
    },
  },
  {
    name: "delete_profile",
    description: "Delete a DNS filtering profile (must be orphaned - not used by any device)",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
      },
      required: ["profile_id"],
    },
  },
  // Profile Options
  {
    name: "list_profile_options",
    description: "List all available profile options (block_rfc1918, ml_filter, etc.)",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "update_profile_option",
    description: "Enable or disable a profile option (e.g. ml_filter, block_rfc1918, no_dnssec)",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        name: {
          type: "string",
          description: "Option name (block_rfc1918, spoof_ipv6, no_dnssec, ml_filter, ttl_blck, ttl_spff)",
        },
        status: { type: "number", enum: [0, 1], description: "0 = disabled, 1 = enabled" },
        value: { type: "string", description: "Optional value for the option" },
      },
      required: ["profile_id", "name", "status"],
    },
  },
  // Filters
  {
    name: "list_filters",
    description: "List all native DNS filters for a profile (ads, malware, porn, gambling, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
      },
      required: ["profile_id"],
    },
  },
  {
    name: "list_external_filters",
    description: "List all third-party (external) filters for a profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
      },
      required: ["profile_id"],
    },
  },
  {
    name: "update_filter",
    description: "Enable or disable a single DNS filter on a profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        filter: { type: "string", description: "Filter identifier (e.g. ads, malware, porn_strict)" },
        status: { type: "number", enum: [0, 1], description: "0 = disabled, 1 = enabled" },
      },
      required: ["profile_id", "filter", "status"],
    },
  },
  {
    name: "batch_update_filters",
    description: "Enable or disable multiple DNS filters on a profile at once",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        filters: {
          type: "array",
          description: "Array of filter objects",
          items: {
            type: "object",
            properties: {
              filter: { type: "string", description: "Filter identifier" },
              status: { type: "number", enum: [0, 1] },
            },
            required: ["filter", "status"],
          },
        },
      },
      required: ["profile_id", "filters"],
    },
  },
  // Services
  {
    name: "list_services",
    description: "List all service rules for a profile (e.g. YouTube, Netflix blocked/bypassed/redirected)",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
      },
      required: ["profile_id"],
    },
  },
  {
    name: "update_service",
    description: "Create or update a service rule on a profile (block/bypass/spoof/redirect)",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        service: { type: "string", description: "Service identifier (e.g. youtube, netflix)" },
        do: {
          type: "number",
          enum: [0, 1, 2, 3],
          description: "Action: 0=block, 1=bypass, 2=spoof (requires via IP), 3=redirect (requires via proxy ID)",
        },
        status: { type: "number", enum: [0, 1], description: "0 = disabled, 1 = enabled" },
        via: { type: "string", description: "IPv4/hostname for spoof or proxy ID for redirect" },
        via_v6: { type: "string", description: "IPv6 address for spoof" },
      },
      required: ["profile_id", "service"],
    },
  },
  {
    name: "list_service_categories",
    description: "List all service categories available in ControlD",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  // Custom Rules
  {
    name: "create_rule",
    description: "Create a custom DNS rule for one or more hostnames on a profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        do: {
          type: "number",
          enum: [0, 1, 2, 3],
          description: "Action: 0=block, 1=bypass, 2=spoof, 3=redirect",
        },
        status: { type: "number", enum: [0, 1], description: "0 = disabled, 1 = enabled" },
        hostnames: {
          type: "array",
          items: { type: "string" },
          description: "List of hostnames/domains to apply the rule to",
        },
        via: { type: "string", description: "IPv4/hostname for spoof or proxy ID for redirect" },
        via_v6: { type: "string", description: "IPv6 address for spoof" },
        group: { type: "string", description: "Rule folder/group ID to place this rule in" },
      },
      required: ["profile_id", "do", "status", "hostnames"],
    },
  },
  {
    name: "update_rule",
    description: "Update an existing custom DNS rule on a profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        rule_id: { type: "string", description: "Rule ID (PK)" },
        do: { type: "number", enum: [0, 1, 2, 3] },
        status: { type: "number", enum: [0, 1] },
        hostnames: { type: "array", items: { type: "string" } },
        via: { type: "string" },
        via_v6: { type: "string" },
        group: { type: "string" },
      },
      required: ["profile_id", "rule_id"],
    },
  },
  {
    name: "delete_rule",
    description: "Delete a custom DNS rule from a profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        rule_id: { type: "string", description: "Rule ID (PK)" },
      },
      required: ["profile_id", "rule_id"],
    },
  },
  // Rule Groups
  {
    name: "list_groups",
    description: "List all rule folders/groups for a profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
      },
      required: ["profile_id"],
    },
  },
  {
    name: "create_group",
    description: "Create a new rule folder/group on a profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        name: { type: "string", description: "Folder name" },
        do: { type: "number", enum: [0, 1, 2, 3], description: "Default action for rules in this folder" },
        via: { type: "string" },
        status: { type: "number", enum: [0, 1] },
      },
      required: ["profile_id", "name"],
    },
  },
  {
    name: "update_group",
    description: "Update a rule folder/group on a profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        group_id: { type: "string", description: "Group ID (PK)" },
        name: { type: "string" },
        do: { type: "number", enum: [0, 1, 2, 3] },
        via: { type: "string" },
        status: { type: "number", enum: [0, 1] },
      },
      required: ["profile_id", "group_id"],
    },
  },
  {
    name: "delete_group",
    description: "Delete a rule folder/group from a profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        group_id: { type: "string", description: "Group ID (PK)" },
      },
      required: ["profile_id", "group_id"],
    },
  },
  // Devices
  {
    name: "list_devices",
    description: "List all devices/DNS endpoints on the account",
    inputSchema: {
      type: "object",
      properties: {
        last_activity: {
          type: "boolean",
          description: "Include last activity timestamp",
        },
        type: {
          type: "string",
          enum: ["users", "routers"],
          description: "Filter by device type",
        },
      },
      required: [],
    },
  },
  {
    name: "create_device",
    description: "Create a new device/DNS endpoint with unique resolvers",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Device name" },
        client_count: { type: "number", description: "Number of clients" },
        profile_id: { type: "string", description: "Profile ID to assign" },
        icon: { type: "string", description: "Device icon identifier" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_device",
    description: "Update a device/DNS endpoint settings",
    inputSchema: {
      type: "object",
      properties: {
        device_id: { type: "string", description: "Device ID" },
        name: { type: "string" },
        profile_id: { type: "string", description: "Primary profile ID" },
        profile_id2: { type: "string", description: "Secondary profile ID" },
        stats: { type: "number", enum: [0, 1] },
        learn_ip: { type: "number", enum: [0, 1] },
        restricted: { type: "number" },
        status: { type: "number", enum: [0, 1, 2, 3], description: "0=pending, 1=active, 2=soft disabled, 3=hard disabled" },
      },
      required: ["device_id"],
    },
  },
  {
    name: "delete_device",
    description: "Delete a device (warning: breaks DNS on physical devices using this endpoint)",
    inputSchema: {
      type: "object",
      properties: {
        device_id: { type: "string", description: "Device ID" },
      },
      required: ["device_id"],
    },
  },
  // Rules list
  {
    name: "list_rules",
    description: "List custom DNS rules for a profile, optionally filtered by folder/group",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        folder_id: { type: "string", description: "Rule folder/group ID to filter by (optional)" },
      },
      required: ["profile_id"],
    },
  },
  // Default rule
  {
    name: "get_default_rule",
    description: "Get the default DNS rule for a profile (what happens when no other rule matches)",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
      },
      required: ["profile_id"],
    },
  },
  {
    name: "update_default_rule",
    description: "Update the default DNS rule for a profile",
    inputSchema: {
      type: "object",
      properties: {
        profile_id: { type: "string", description: "Profile ID (PK)" },
        do: {
          type: "number",
          enum: [0, 1, 2, 3],
          description: "Action: 0=block, 1=bypass, 2=spoof, 3=redirect",
        },
        status: { type: "number", enum: [0, 1] },
        via: { type: "string" },
        via_v6: { type: "string" },
      },
      required: ["profile_id", "do"],
    },
  },
  // Services catalog
  {
    name: "list_all_services",
    description: "List all services available in Control D (full catalog, not profile-specific)",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  // Device types
  {
    name: "list_device_types",
    description: "List all available device types in Control D",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  // Analytics
  {
    name: "list_analytics_levels",
    description: "List available analytics log levels",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  // Organization
  {
    name: "get_organization",
    description: "Get organization information",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "list_organization_members",
    description: "List all members of the organization",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "list_sub_organizations",
    description: "List all sub-organizations",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "create_sub_organization",
    description: "Create a new sub-organization",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Sub-organization name" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_organization",
    description: "Update organization settings",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Organization name" },
      },
      required: [],
    },
  },
  // Billing
  {
    name: "get_payments",
    description: "Get payment history for the account",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_subscriptions",
    description: "Get active subscriptions for the account",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_products",
    description: "Get active products on the account",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  // Utilities
  {
    name: "get_caller_ip",
    description: "Get the caller's current IP address and metadata as seen by Control D",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_network",
    description: "Get network stats on available Control D services",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  // Access Control
  {
    name: "list_access",
    description: "List the last 50 IPs querying a device (for IP whitelisting/access control)",
    inputSchema: {
      type: "object",
      properties: {
        device_id: { type: "string", description: "Device ID" },
      },
      required: ["device_id"],
    },
  },
  {
    name: "add_access",
    description: "Authorize/whitelist IP addresses for a device",
    inputSchema: {
      type: "object",
      properties: {
        device_id: { type: "string", description: "Device ID" },
        ips: {
          type: "array",
          items: { type: "string" },
          description: "IP addresses to authorize",
        },
      },
      required: ["device_id", "ips"],
    },
  },
  {
    name: "remove_access",
    description: "Remove/deauthorize IP addresses from a device",
    inputSchema: {
      type: "object",
      properties: {
        device_id: { type: "string", description: "Device ID" },
        ips: {
          type: "array",
          items: { type: "string" },
          description: "IP addresses to remove",
        },
      },
      required: ["device_id", "ips"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    let result: unknown;

    switch (name) {
      // Account
      case "get_user":
        result = await client.getUser();
        break;

      // Proxies
      case "list_proxies":
        result = await client.listProxies();
        break;

      // Profiles
      case "list_profiles":
        result = await client.listProfiles();
        break;
      case "create_profile":
        result = await client.createProfile(
          args.name as string,
          args.clone_profile_id as string | undefined
        );
        break;
      case "update_profile": {
        const { profile_id, ...rest } = args as { profile_id: string; [k: string]: unknown };
        result = await client.updateProfile(profile_id, rest as Parameters<typeof client.updateProfile>[1]);
        break;
      }
      case "delete_profile":
        result = await client.deleteProfile(args.profile_id as string);
        break;

      // Profile Options
      case "list_profile_options":
        result = await client.listProfileOptions();
        break;
      case "update_profile_option":
        result = await client.updateProfileOption(
          args.profile_id as string,
          args.name as string,
          args.status as 0 | 1,
          args.value as string | undefined
        );
        break;

      // Filters
      case "list_filters":
        result = await client.listFilters(args.profile_id as string);
        break;
      case "list_external_filters":
        result = await client.listExternalFilters(args.profile_id as string);
        break;
      case "update_filter":
        result = await client.updateFilter(
          args.profile_id as string,
          args.filter as string,
          args.status as 0 | 1
        );
        break;
      case "batch_update_filters":
        result = await client.batchUpdateFilters(
          args.profile_id as string,
          args.filters as Array<{ filter: string; status: 0 | 1 }>
        );
        break;

      // Services
      case "list_services":
        result = await client.listServices(args.profile_id as string);
        break;
      case "update_service": {
        const { profile_id, service, ...rest } = args as {
          profile_id: string;
          service: string;
          [k: string]: unknown;
        };
        result = await client.updateService(profile_id, service, rest as Parameters<typeof client.updateService>[2]);
        break;
      }
      case "list_service_categories":
        result = await client.listServiceCategories();
        break;

      // Custom Rules
      case "create_rule": {
        const { profile_id, ...rest } = args as { profile_id: string; [k: string]: unknown };
        result = await client.createRule(profile_id, rest as Parameters<typeof client.createRule>[1]);
        break;
      }
      case "update_rule": {
        const { profile_id, rule_id, ...rest } = args as {
          profile_id: string;
          rule_id: string;
          [k: string]: unknown;
        };
        result = await client.updateRule(profile_id, rule_id, rest as Parameters<typeof client.updateRule>[2]);
        break;
      }
      case "delete_rule":
        result = await client.deleteRule(
          args.profile_id as string,
          args.rule_id as string
        );
        break;

      // Groups
      case "list_groups":
        result = await client.listGroups(args.profile_id as string);
        break;
      case "create_group": {
        const { profile_id, ...rest } = args as { profile_id: string; [k: string]: unknown };
        result = await client.createGroup(profile_id, rest as Parameters<typeof client.createGroup>[1]);
        break;
      }
      case "update_group": {
        const { profile_id, group_id, ...rest } = args as {
          profile_id: string;
          group_id: string;
          [k: string]: unknown;
        };
        result = await client.updateGroup(profile_id, group_id, rest as Parameters<typeof client.updateGroup>[2]);
        break;
      }
      case "delete_group":
        result = await client.deleteGroup(
          args.profile_id as string,
          args.group_id as string
        );
        break;

      // Devices
      case "list_devices":
        result = await client.listDevices({
          last_activity: args.last_activity ? 1 : undefined,
          type: args.type as "users" | "routers" | undefined,
        });
        break;
      case "create_device":
        result = await client.createDevice(args as Parameters<typeof client.createDevice>[0]);
        break;
      case "update_device": {
        const { device_id, ...rest } = args as { device_id: string; [k: string]: unknown };
        result = await client.updateDevice(device_id, rest);
        break;
      }
      case "delete_device":
        result = await client.deleteDevice(args.device_id as string);
        break;

      // Rules list
      case "list_rules":
        result = await client.listRules(
          args.profile_id as string,
          args.folder_id as string | undefined
        );
        break;

      // Default rule
      case "get_default_rule":
        result = await client.getDefaultRule(args.profile_id as string);
        break;
      case "update_default_rule": {
        const { profile_id, ...rest } = args as { profile_id: string; [k: string]: unknown };
        result = await client.updateDefaultRule(profile_id, rest as Parameters<typeof client.updateDefaultRule>[1]);
        break;
      }

      // Services catalog
      case "list_all_services":
        result = await client.listAllServices();
        break;

      // Device types
      case "list_device_types":
        result = await client.listDeviceTypes();
        break;

      // Analytics
      case "list_analytics_levels":
        result = await client.listAnalyticsLevels();
        break;

      // Organization
      case "get_organization":
        result = await client.getOrganization();
        break;
      case "list_organization_members":
        result = await client.listOrganizationMembers();
        break;
      case "list_sub_organizations":
        result = await client.listSubOrganizations();
        break;
      case "create_sub_organization":
        result = await client.createSubOrganization(args as Parameters<typeof client.createSubOrganization>[0]);
        break;
      case "update_organization":
        result = await client.updateOrganization(args);
        break;

      // Billing
      case "get_payments":
        result = await client.getPayments();
        break;
      case "get_subscriptions":
        result = await client.getSubscriptions();
        break;
      case "get_products":
        result = await client.getProducts();
        break;

      // Utilities
      case "get_caller_ip":
        result = await client.getCallerIp();
        break;
      case "get_network":
        result = await client.getNetwork();
        break;

      // Access
      case "list_access":
        result = await client.listAccess(args.device_id as string);
        break;
      case "add_access":
        result = await client.addAccess(
          args.device_id as string,
          args.ips as string[]
        );
        break;
      case "remove_access":
        result = await client.removeAccess(
          args.device_id as string,
          args.ips as string[]
        );
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Control D MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
