import assert from "node:assert/strict";
import test from "node:test";

import { ControlDClient } from "../dist/api.js";
import { callAnalyticsTool } from "../dist/analytics.js";

function mockFetch() {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url, init };
    return new Response(JSON.stringify({ success: true, body: { ok: true } }));
  };
  return () => request;
}

test("scoped requests send X-Force-Org-Id without leaking it into the body", async () => {
  const getRequest = mockFetch();
  const client = new ControlDClient("token").withOrganization("child-org");

  await client.createRule("profile", {
    do: 0,
    status: 1,
    hostnames: ["example.com", "example.net"],
    comment: "Block examples",
  });

  const request = getRequest();
  assert.equal(request.url, "https://api.controld.com/profiles/profile/rules");
  assert.equal(request.init.headers.Authorization, "Bearer token");
  assert.equal(request.init.headers["X-Force-Org-Id"], "child-org");
  assert.equal(
    request.init.headers["Content-Type"],
    "application/x-www-form-urlencoded"
  );
  assert.equal(
    request.init.body,
    "do=0&status=1&hostnames%5B%5D=example.com&hostnames%5B%5D=example.net&comment=Block+examples"
  );
});

test("unscoped requests omit X-Force-Org-Id", async () => {
  const getRequest = mockFetch();

  await new ControlDClient("token").listProfiles();

  assert.equal(getRequest().init.headers["X-Force-Org-Id"], undefined);
});

test("batch filter updates remain JSON encoded", async () => {
  const getRequest = mockFetch();

  await new ControlDClient("token").batchUpdateFilters("profile", [
    { filter: "ads", status: 1 },
  ]);

  assert.equal(getRequest().init.headers["Content-Type"], "application/json");
  assert.equal(
    getRequest().init.body,
    JSON.stringify({ filters: [{ filter: "ads", status: 1 }] })
  );
});

function mockAnalyticsFetch(analyticsResponse = { success: true, body: { queries: [] } }) {
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    if (String(url).startsWith("https://api.controld.com/users")) {
      return new Response(JSON.stringify({ success: true, body: { org: { stats_endpoint: "europe-west4-org01" } } }));
    }
    return new Response(typeof analyticsResponse === "string" ? analyticsResponse : JSON.stringify(analyticsResponse));
  };
  return requests;
}

test("activity log uses discovered regional host and repeated array query parameters", async () => {
  const requests = mockAnalyticsFetch();
  const client = new ControlDClient("token").withOrganization("child-org");
  await callAnalyticsTool(client, "get_activity_log", {
    startTime: "2026-09-25T08:49:00.967Z",
    endpointId: ["one", "two"],
    action: [0, 1],
    page: 0,
  });
  const request = requests[1];
  const url = new URL(request.url);
  assert.equal(url.host, "europe-west4-org01.analytics.controld.com");
  assert.equal(url.pathname, "/v2/activity-log");
  assert.deepEqual(url.searchParams.getAll("endpointId[]"), ["one", "two"]);
  assert.deepEqual(url.searchParams.getAll("action[]"), ["0", "1"]);
  assert.equal(url.searchParams.get("page"), "0");
  assert.equal(request.init.headers.Authorization, "Bearer token");
  assert.equal(request.init.headers["X-Force-Org-Id"], "child-org");
  assert.equal(requests[0].init.headers["X-Force-Org-Id"], "child-org");
});

test("analytics client metadata deletion sends documented JSON body", async () => {
  const requests = mockAnalyticsFetch();
  await callAnalyticsTool(new ControlDClient("token"), "delete_analytics_client_metadata", {
    endpointIds: ["endpoint"], clientIds: ["client"], endTime: "2026-09-25T08:49:00Z",
  });
  assert.equal(requests[1].init.method, "DELETE");
  assert.equal(requests[1].init.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(requests[1].init.body), {
    endpointIds: ["endpoint"], clientIds: ["client"], endTime: "2026-09-25T08:49:00Z",
  });
});

test("client alias is sent as a JSON string and path segments are escaped", async () => {
  const requests = mockAnalyticsFetch();
  await callAnalyticsTool(new ControlDClient("token"), "set_analytics_client_alias", {
    endpointId: "a/b", clientId: "c d", alias: "Living room",
  });
  assert.equal(new URL(requests[1].url).pathname, "/v2/client/alias/a%2Fb/c%20d");
  assert.equal(requests[1].init.body, '"Living room"');
});

test("CSV activity export returns plain text", async () => {
  mockAnalyticsFetch("timestamp,question\n2026-09-25T08:49:00Z,example.com\n");
  const result = await callAnalyticsTool(new ControlDClient("token"), "export_activity_log_csv", {
    startTime: "2026-09-25T08:49:00Z",
  });
  assert.match(result, /example.com/);
});

test("realtime activity uses a single-use token and returns bounded SSE events", async () => {
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    const path = new URL(url).pathname;
    if (path === "/users") return Response.json({ success: true, body: { stats_endpoint: "europe-west4-usr01" } });
    if (path === "/v2/auth/token") return Response.json({ success: true, body: { token: "single-use" } });
    return new Response("data: {\"question\":\"example.com\"}\n\ndata: {\"question\":\"example.net\"}\n\n", {
      headers: { "Content-Type": "text/event-stream" },
    });
  };
  const result = await callAnalyticsTool(new ControlDClient("token"), "stream_activity_log", {
    endpointId: ["resolver"], max_events: 1, duration_ms: 1000,
  });
  assert.deepEqual(result, { events: [{ question: "example.com" }], complete: true });
  const streamUrl = new URL(requests.at(-1).url);
  assert.equal(streamUrl.searchParams.get("authToken"), "single-use");
  assert.deepEqual(streamUrl.searchParams.getAll("endpointId[]"), ["resolver"]);
});

test("analytics rejects an invalid discovery host", async () => {
  globalThis.fetch = async () => Response.json({ success: true, body: { stats_endpoint: "evil.example/path" } });
  await assert.rejects(new ControlDClient("token").analyticsRequest("GET", "/v2/data-availability"), /valid analytics stats_endpoint/);
});

test("client ID lookup works without knowing the endpoint", async () => {
  const requests = mockAnalyticsFetch({
    items: {
      one: { lastActivityTime: "2026-09-26T09:00:00Z", clients: { wanted: { host: "Laptop" }, other: { host: "Phone" } } },
      two: { clients: { another: { host: "Tablet" } } },
    },
  });
  const result = await callAnalyticsTool(new ControlDClient("token"), "get_analytics_clients", { clientId: ["wanted"] });
  assert.deepEqual(result, {
    items: { one: { lastActivityTime: "2026-09-26T09:00:00Z", clients: { wanted: { host: "Laptop" } } } },
  });
  assert.equal(new URL(requests[1].url).search, "");
});

test("activity log rejects a page size above the live API limit before requesting data", async () => {
  await assert.rejects(
    callAnalyticsTool(new ControlDClient("token"), "get_activity_log", { startTime: "2026-09-26T08:00:00Z", pageSize: 1000 }),
    /from 1 to 500/
  );
});
