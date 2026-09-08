import assert from "node:assert/strict";
import test from "node:test";

import { ControlDClient } from "../dist/api.js";

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
