const BASE_URL = "https://api.controld.com";

export class ControlDClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    let fetchBody: string | undefined;
    if (body && method !== "GET") {
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(
        Object.fromEntries(
          Object.entries(body).filter(([, v]) => v !== undefined && v !== null)
        )
      );
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: fetchBody,
    });

    const text = await res.text();
    let data: { success: boolean; body?: T; error?: { message: string; code: number }; message?: string };
    try {
      data = JSON.parse(text) as typeof data;
    } catch {
      throw new Error(`API returned non-JSON response (HTTP ${res.status}): ${text.slice(0, 200)}`);
    }

    if (!data.success) {
      throw new Error(data.error?.message ?? "Unknown API error");
    }

    return (data.body ?? data) as T;
  }

  // Account
  getUser() {
    return this.request<Record<string, unknown>>("GET", "/users");
  }

  // Proxies
  listProxies() {
    return this.request<Record<string, unknown>>("GET", "/proxies");
  }

  // Profiles
  listProfiles() {
    return this.request<Record<string, unknown>>("GET", "/profiles");
  }

  createProfile(name: string, cloneProfileId?: string) {
    return this.request<Record<string, unknown>>("POST", "/profiles", {
      name,
      ...(cloneProfileId && { clone_profile_id: cloneProfileId }),
    });
  }

  updateProfile(
    profileId: string,
    params: {
      name?: string;
      disable_ttl?: number;
      lock_status?: number;
      lock_message?: string;
      password?: string;
    }
  ) {
    return this.request<Record<string, unknown>>(
      "PUT",
      `/profiles/${profileId}`,
      params as Record<string, unknown>
    );
  }

  deleteProfile(profileId: string) {
    return this.request<Record<string, unknown>>(
      "DELETE",
      `/profiles/${profileId}`
    );
  }

  // Profile Options
  listProfileOptions() {
    return this.request<Record<string, unknown>>("GET", "/profiles/options");
  }

  updateProfileOption(profileId: string, name: string, status: 0 | 1, value?: string) {
    return this.request<Record<string, unknown>>(
      "PUT",
      `/profiles/${profileId}/options/${name}`,
      { status, ...(value !== undefined && { value }) }
    );
  }

  // Filters
  listFilters(profileId: string) {
    return this.request<Record<string, unknown>>(
      "GET",
      `/profiles/${profileId}/filters`
    );
  }

  listExternalFilters(profileId: string) {
    return this.request<Record<string, unknown>>(
      "GET",
      `/profiles/${profileId}/filters/external`
    );
  }

  updateFilter(profileId: string, filter: string, status: 0 | 1) {
    return this.request<Record<string, unknown>>(
      "PUT",
      `/profiles/${profileId}/filters/filter/${filter}`,
      { status }
    );
  }

  batchUpdateFilters(
    profileId: string,
    filters: Array<{ filter: string; status: 0 | 1 }>
  ) {
    return this.request<Record<string, unknown>>(
      "PUT",
      `/profiles/${profileId}/filters`,
      { filters } as Record<string, unknown>
    );
  }

  // Services
  listServices(profileId: string) {
    return this.request<Record<string, unknown>>(
      "GET",
      `/profiles/${profileId}/services`
    );
  }

  updateService(
    profileId: string,
    service: string,
    params: { do?: 0 | 1 | 2 | 3; status?: 0 | 1; via?: string; via_v6?: string }
  ) {
    return this.request<Record<string, unknown>>(
      "PUT",
      `/profiles/${profileId}/services/${service}`,
      params as Record<string, unknown>
    );
  }

  listServiceCategories() {
    return this.request<Record<string, unknown>>("GET", "/services/categories");
  }

  // Custom Rules
  createRule(
    profileId: string,
    params: {
      do: 0 | 1 | 2 | 3;
      status: 0 | 1;
      hostnames: string[];
      via?: string;
      via_v6?: string;
      group?: number;
    }
  ) {
    return this.request<Record<string, unknown>>(
      "POST",
      `/profiles/${profileId}/rules`,
      params as Record<string, unknown>
    );
  }

  updateRule(
    profileId: string,
    params: {
      do: 0 | 1 | 2 | 3;
      status: 0 | 1;
      hostnames: string[];
      via?: string;
      via_v6?: string;
      group?: number;
    }
  ) {
    return this.request<Record<string, unknown>>(
      "PUT",
      `/profiles/${profileId}/rules`,
      params as Record<string, unknown>
    );
  }

  deleteRule(profileId: string, ruleId: string) {
    return this.request<Record<string, unknown>>(
      "DELETE",
      `/profiles/${profileId}/rules/${ruleId}`
    );
  }

  // Rule Groups/Folders
  listGroups(profileId: string) {
    return this.request<Record<string, unknown>>(
      "GET",
      `/profiles/${profileId}/groups`
    );
  }

  createGroup(
    profileId: string,
    params: {
      name: string;
      do?: 0 | 1 | 2 | 3;
      via?: string;
      status?: 0 | 1;
    }
  ) {
    return this.request<Record<string, unknown>>(
      "POST",
      `/profiles/${profileId}/groups`,
      params as Record<string, unknown>
    );
  }

  updateGroup(
    profileId: string,
    groupId: string,
    params: {
      name?: string;
      do?: 0 | 1 | 2 | 3;
      via?: string;
      status?: 0 | 1;
    }
  ) {
    return this.request<Record<string, unknown>>(
      "PUT",
      `/profiles/${profileId}/groups/${groupId}`,
      params as Record<string, unknown>
    );
  }

  deleteGroup(profileId: string, groupId: string) {
    return this.request<Record<string, unknown>>(
      "DELETE",
      `/profiles/${profileId}/groups/${groupId}`
    );
  }

  // Devices
  listDevices(params?: { last_activity?: 1; type?: "users" | "routers" }) {
    const qs = new URLSearchParams();
    if (params?.last_activity) qs.set("last_activity", "1");
    const base = params?.type ? `/devices/${params.type}` : "/devices";
    const query = qs.toString() ? `?${qs}` : "";
    return this.request<Record<string, unknown>>("GET", `${base}${query}`);
  }

  createDevice(params: {
    name: string;
    client_count?: number;
    profile_id?: string;
    icon?: string;
    [key: string]: unknown;
  }) {
    return this.request<Record<string, unknown>>("POST", "/devices", params);
  }

  updateDevice(
    deviceId: string,
    params: {
      name?: string;
      profile_id?: string;
      profile_id2?: string;
      stats?: 0 | 1;
      learn_ip?: 0 | 1;
      restricted?: number;
      status?: 0 | 1 | 2 | 3;
      [key: string]: unknown;
    }
  ) {
    return this.request<Record<string, unknown>>(
      "PUT",
      `/devices/${deviceId}`,
      params
    );
  }

  deleteDevice(deviceId: string) {
    return this.request<Record<string, unknown>>(
      "DELETE",
      `/devices/${deviceId}`
    );
  }

  // Rules list
  listRules(profileId: string, folderId?: string) {
    const path = folderId
      ? `/profiles/${profileId}/rules/${folderId}`
      : `/profiles/${profileId}/rules`;
    return this.request<Record<string, unknown>>("GET", path);
  }

  // Default rule
  getDefaultRule(profileId: string) {
    return this.request<Record<string, unknown>>(
      "GET",
      `/profiles/${profileId}/default`
    );
  }

  updateDefaultRule(
    profileId: string,
    params: { do: 0 | 1 | 2 | 3; status?: 0 | 1; via?: string; via_v6?: string }
  ) {
    return this.request<Record<string, unknown>>(
      "PUT",
      `/profiles/${profileId}/default`,
      params as Record<string, unknown>
    );
  }

  // All services in a catalog category
  listCategoryServices(category: string) {
    return this.request<Record<string, unknown>>(
      "GET",
      `/services/categories/${encodeURIComponent(category)}`
    );
  }

  // Device types
  listDeviceTypes() {
    return this.request<Record<string, unknown>>("GET", "/devices/types");
  }

  // Analytics
  listAnalyticsLevels() {
    return this.request<Record<string, unknown>>("GET", "/analytics/levels");
  }

  listAnalyticsStorageRegions() {
    return this.request<Record<string, unknown>>("GET", "/analytics/endpoints");
  }

  // Organization
  getOrganization() {
    return this.request<Record<string, unknown>>(
      "GET",
      "/organizations/organization"
    );
  }

  listOrganizationMembers() {
    return this.request<Record<string, unknown>>(
      "GET",
      "/organizations/members"
    );
  }

  listSubOrganizations() {
    return this.request<Record<string, unknown>>(
      "GET",
      "/organizations/sub_organizations"
    );
  }

  createSubOrganization(params: { name: string; [key: string]: unknown }) {
    return this.request<Record<string, unknown>>(
      "POST",
      "/organizations/suborg",
      params
    );
  }

  updateOrganization(params: Record<string, unknown>) {
    return this.request<Record<string, unknown>>(
      "PUT",
      "/organizations",
      params
    );
  }

  // Billing
  getPayments() {
    return this.request<Record<string, unknown>>("GET", "/billing/payments");
  }

  getSubscriptions() {
    return this.request<Record<string, unknown>>(
      "GET",
      "/billing/subscriptions"
    );
  }

  getProducts() {
    return this.request<Record<string, unknown>>("GET", "/billing/products");
  }

  // Utilities
  getCallerIp() {
    return this.request<Record<string, unknown>>("GET", "/ip");
  }

  getNetwork() {
    return this.request<Record<string, unknown>>("GET", "/network");
  }

  // Access Control
  listAccess(deviceId: string) {
    return this.request<Record<string, unknown>>(
      "GET",
      `/access?device_id=${encodeURIComponent(deviceId)}`
    );
  }

  addAccess(deviceId: string, ips: string[]) {
    return this.request<Record<string, unknown>>("POST", "/access", {
      device_id: deviceId,
      ips,
    } as Record<string, unknown>);
  }

  removeAccess(deviceId: string, ips: string[]) {
    return this.request<Record<string, unknown>>("DELETE", "/access", {
      device_id: deviceId,
      ips,
    } as Record<string, unknown>);
  }
}
