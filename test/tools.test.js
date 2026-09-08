import assert from "node:assert/strict";
import test from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("server advertises the v0.4 API schemas", async () => {
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

    assert.equal(client.getServerVersion()?.version, "0.4.0");
    assert.equal(tools.length, 46);
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
  } finally {
    await client.close();
  }
});
