import assert from "node:assert/strict";
import test from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("server advertises Control D and Analytics API schemas", async () => {
  const client = new Client({ name: "test-client", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["dist/index.js"],
    env: { ...process.env, API_TOKEN: "test-token" },
    stderr: "pipe",
  });

  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    const byName = new Map(tools.map((tool) => [tool.name, tool]));

    assert.equal(client.getServerVersion()?.version, "0.5.0");
    assert.equal(tools.length, 62);
    assert.deepEqual(byName.get("create_device")?.inputSchema.required, [
      "name",
      "client_count",
      "profile_id",
      "icon",
    ]);
    assert.deepEqual(byName.get("update_service")?.inputSchema.required, [
      "profile_id",
      "service",
      "do",
      "status",
    ]);
    assert.equal(
      byName.get("create_rule")?.inputSchema.properties?.comment?.maxLength,
      64
    );
    assert.equal(
      byName.get("list_profiles")?.inputSchema.properties?.organization_id?.type,
      "string"
    );
    assert.equal(
      byName.get("get_payments")?.inputSchema.properties?.organization_id,
      undefined
    );
    assert.deepEqual(byName.get("get_activity_log")?.inputSchema.required, ["startTime"]);
    assert.equal(byName.get("get_activity_log")?.inputSchema.properties?.endpointId?.type, "array");
    assert.equal(byName.get("get_activity_log")?.inputSchema.properties?.organization_id?.type, "string");
    assert.equal(byName.get("get_activity_log")?.inputSchema.properties?.pageSize?.maximum, 500);
    assert.match(byName.get("get_activity_log")?.description ?? "", /page 0/);
    assert.match(byName.get("get_analytics_clients")?.description ?? "", /without knowing their endpoint/);
    assert.deepEqual(byName.get("set_analytics_client_alias")?.inputSchema.required, ["endpointId", "clientId", "alias"]);
    assert.deepEqual(byName.get("get_statistics_count_group")?.inputSchema.required, ["group", "startTime"]);
    assert.equal(byName.get("stream_activity_log")?.inputSchema.properties?.authToken, undefined);
    assert.deepEqual(
      [
        "get_analytics_auth_token", "get_activity_log", "delete_activity_log",
        "export_activity_log_csv", "stream_activity_log", "get_analytics_data_availability",
        "get_statistics_timeseries", "get_statistics_timeseries_group",
        "get_statistics_count", "get_statistics_count_group", "get_statistics_trend_group",
        "get_admin_actions", "get_analytics_clients", "delete_analytics_client_metadata",
        "delete_analytics_client_alias", "set_analytics_client_alias",
      ].filter(name => !byName.has(name)),
      []
    );
  } finally {
    await client.close();
  }
});
