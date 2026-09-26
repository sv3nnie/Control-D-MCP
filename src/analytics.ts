import { ControlDClient } from "./api.js";

type Field = { name: string; wire: string; location: string; required: boolean; property: Record<string, unknown> };
type Operation = { name: string; method: string; path: string; description: string; fields: Field[] };

// Control D analytics parameter names and constraints.
const OPERATIONS: Operation[] =
[
  { name: "get_analytics_auth_token", method: "GET", path: "/v2/auth/token", description: "Obtain a single-use token for use by the /v2/activity-log/realtime call.", fields: [

  ] },
  { name: "get_activity_log", method: "GET", path: "/v2/activity-log", description: "Returns up to 33 days of historical query data, descending by default.", fields: [
    {"name":"startTime","wire":"startTime","location":"query","required":true,"property":{"type":"string","description":"Start time as a RFC3339 format"}},
    {"name":"endTime","wire":"endTime","location":"query","required":false,"property":{"type":"string","description":"End time as a RFC3339 format"}},
    {"name":"endpointId","wire":"endpointId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of endpointIDs"}},
    {"name":"clientId","wire":"clientId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of clientIDs"}},
    {"name":"action","wire":"action[]","location":"query","required":false,"property":{"type":"array","items":{"type":"number"},"description":"Actions taken by Robert such as 0 for blocked, 1 for bypassed or 3 for redirected."}},
    {"name":"trigger","wire":"trigger[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string","enum":["default","filter","service","custom","grule","rebind"]},"description":"Action triggers such as 'filter', 'service', 'custom'"}},
    {"name":"triggerValue","wire":"triggerValue[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Action trigger values such as 'ads', 'netflix'"}},
    {"name":"spoofTarget","wire":"spoofTarget[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Redirect targets such as a location code or domain"}},
    {"name":"question","wire":"question[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS domain name to match"}},
    {"name":"profileId","wire":"profileId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"ID of the active profile."}},
    {"name":"searchQuestion","wire":"searchQuestion","location":"query","required":false,"property":{"type":"string","description":"A search string that filters by partial match on question."}},
    {"name":"searchQuestionMode","wire":"searchQuestionMode","location":"query","required":false,"property":{"type":"string","enum":["includes","startsWith","endsWith","excludes","apex"],"description":"Only used together with searchQuestion."}},
    {"name":"protocol","wire":"protocol[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS protocol such as 'doh' or 'doq'."}},
    {"name":"statusCode","wire":"statusCode[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"A list of DNS status codes to filter by"}},
    {"name":"rrType","wire":"rrType[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS response type to filter by"}},
    {"name":"srcCountry","wire":"srcCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source country code"}},
    {"name":"dstCountry","wire":"dstCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination country code"}},
    {"name":"dstAsn","wire":"dstAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Destination ISP's ASN"}},
    {"name":"srcAsn","wire":"srcAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Source ISP's ASN"}},
    {"name":"dstIsp","wire":"dstIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination ISP's name"}},
    {"name":"srcIsp","wire":"srcIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source ISP's name"}},
    {"name":"page","wire":"page","location":"query","required":false,"property":{"type":"number","description":"Page number (indexing starts with 0), default 0"}},
    {"name":"pageSize","wire":"pageSize","location":"query","required":false,"property":{"type":"number","description":"Page size for pagination, default 100."}},
    {"name":"sortOrder","wire":"sortOrder","location":"query","required":false,"property":{"type":"string","enum":["asc","desc"],"description":"Whether to sort ascending or descending."}},
  ] },
  { name: "delete_activity_log", method: "DELETE", path: "/v2/activity-log", description: "Queue deletion of Activity Log queries; without filters, deletes all query data in this region.", fields: [
    {"name":"endpointId","wire":"endpointId","location":"query","required":false,"property":{"type":"string","description":"The ID of the endpoint"}},
    {"name":"clientId","wire":"clientId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of clientIDs"}},
  ] },
  { name: "export_activity_log_csv", method: "GET", path: "/v2/activity-log/csv", description: "CSV version of /activity-log, downloadable as CSV.", fields: [
    {"name":"startTime","wire":"startTime","location":"query","required":true,"property":{"type":"string","description":"Start time as a RFC3339 format"}},
    {"name":"endTime","wire":"endTime","location":"query","required":false,"property":{"type":"string","description":"End time as a RFC3339 format"}},
    {"name":"endpointId","wire":"endpointId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of endpointIDs"}},
    {"name":"clientId","wire":"clientId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of clientIDs"}},
    {"name":"action","wire":"action[]","location":"query","required":false,"property":{"type":"array","items":{"type":"number"},"description":"Actions taken by Robert such as 0 for blocked, 1 for bypassed or 3 for redirected."}},
    {"name":"trigger","wire":"trigger[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string","enum":["default","filter","service","custom","grule","rebind"]},"description":"Action triggers such as 'filter', 'service', 'custom'"}},
    {"name":"triggerValue","wire":"triggerValue[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Action trigger values such as 'ads', 'netflix'"}},
    {"name":"spoofTarget","wire":"spoofTarget[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Redirect targets such as a location code or domain"}},
    {"name":"question","wire":"question[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS domain name to match"}},
    {"name":"profileId","wire":"profileId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"ID of the active profile."}},
    {"name":"searchQuestion","wire":"searchQuestion","location":"query","required":false,"property":{"type":"string","description":"A search string that filters by partial match on question."}},
    {"name":"searchQuestionMode","wire":"searchQuestionMode","location":"query","required":false,"property":{"type":"string","enum":["includes","startsWith","endsWith","excludes","apex"],"description":"Only used together with searchQuestion."}},
    {"name":"protocol","wire":"protocol[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS protocol such as 'doh' or 'doq'."}},
    {"name":"statusCode","wire":"statusCode[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"A list of DNS status codes to filter by"}},
    {"name":"rrType","wire":"rrType[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS response type to filter by"}},
    {"name":"srcCountry","wire":"srcCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source country code"}},
    {"name":"dstCountry","wire":"dstCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination country code"}},
    {"name":"dstAsn","wire":"dstAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Destination ISP's ASN"}},
    {"name":"srcAsn","wire":"srcAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Source ISP's ASN"}},
    {"name":"dstIsp","wire":"dstIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination ISP's name"}},
    {"name":"srcIsp","wire":"srcIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source ISP's name"}},
    {"name":"sortOrder","wire":"sortOrder","location":"query","required":false,"property":{"type":"string","enum":["asc","desc"],"description":"Whether to sort ascending or descending."}},
  ] },
  { name: "stream_activity_log", method: "GET", path: "/v2/activity-log/realtime", description: "Realtime Query SSE stream.", fields: [
    {"name":"endpointId","wire":"endpointId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of endpointIDs"}},
    {"name":"clientId","wire":"clientId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of clientIDs"}},
    {"name":"action","wire":"action[]","location":"query","required":false,"property":{"type":"array","items":{"type":"number"},"description":"Actions taken by Robert such as 0 for blocked, 1 for bypassed or 3 for redirected."}},
    {"name":"trigger","wire":"trigger[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string","enum":["default","filter","service","custom","grule","rebind"]},"description":"Action triggers such as 'filter', 'service', 'custom'"}},
    {"name":"triggerValue","wire":"triggerValue[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Action trigger values such as 'ads', 'netflix'"}},
    {"name":"spoofTarget","wire":"spoofTarget[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Redirect targets such as a location code or domain"}},
    {"name":"question","wire":"question[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS domain name to match"}},
    {"name":"profileId","wire":"profileId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"ID of the active profile."}},
    {"name":"searchQuestion","wire":"searchQuestion","location":"query","required":false,"property":{"type":"string","description":"A search string that filters by partial match on question."}},
    {"name":"searchQuestionMode","wire":"searchQuestionMode","location":"query","required":false,"property":{"type":"string","enum":["includes","startsWith","endsWith","excludes","apex"],"description":"Only used together with searchQuestion."}},
    {"name":"protocol","wire":"protocol[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS protocol such as 'doh' or 'doq'."}},
    {"name":"statusCode","wire":"statusCode[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"A list of DNS status codes to filter by"}},
    {"name":"rrType","wire":"rrType[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS response type to filter by"}},
    {"name":"srcCountry","wire":"srcCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source country code"}},
    {"name":"dstCountry","wire":"dstCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination country code"}},
    {"name":"dstAsn","wire":"dstAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Destination ISP's ASN"}},
    {"name":"srcAsn","wire":"srcAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Source ISP's ASN"}},
    {"name":"dstIsp","wire":"dstIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination ISP's name"}},
    {"name":"srcIsp","wire":"srcIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source ISP's name"}},
  ] },
  { name: "get_analytics_data_availability", method: "GET", path: "/v2/data-availability", description: "Returns data availability information for Analytics queries.", fields: [

  ] },
  { name: "get_statistics_timeseries", method: "GET", path: "/v2/statistic/timeseries", description: "Returns a single time series, including the start and end time.", fields: [
    {"name":"startTime","wire":"startTime","location":"query","required":true,"property":{"type":"string","description":"Start time as a RFC3339 format"}},
    {"name":"endTime","wire":"endTime","location":"query","required":false,"property":{"type":"string","description":"End time as a RFC3339 format"}},
    {"name":"limit","wire":"limit","location":"query","required":false,"property":{"type":"number","description":"Maximum number of results."}},
    {"name":"endpointId","wire":"endpointId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of endpointIDs"}},
    {"name":"clientId","wire":"clientId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of clientIDs"}},
    {"name":"action","wire":"action[]","location":"query","required":false,"property":{"type":"array","items":{"type":"number"},"description":"Actions taken by Robert such as 0 for blocked, 1 for bypassed or 3 for redirected."}},
    {"name":"trigger","wire":"trigger[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string","enum":["default","filter","service","custom","grule","rebind"]},"description":"Action triggers such as 'filter', 'service', 'custom'"}},
    {"name":"triggerValue","wire":"triggerValue[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Action trigger values such as 'ads', 'netflix'"}},
    {"name":"spoofTarget","wire":"spoofTarget[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Redirect targets such as a location code or domain"}},
    {"name":"question","wire":"question[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS domain name to match"}},
    {"name":"searchQuestion","wire":"searchQuestion","location":"query","required":false,"property":{"type":"string","description":"A search string that filters by partial match on question."}},
    {"name":"searchQuestionMode","wire":"searchQuestionMode","location":"query","required":false,"property":{"type":"string","enum":["includes","startsWith","endsWith","excludes","apex"],"description":"Only used together with searchQuestion."}},
    {"name":"profileId","wire":"profileId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"ID of the active profile."}},
    {"name":"protocol","wire":"protocol[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS protocol such as 'doh' or 'doq'."}},
    {"name":"statusCode","wire":"statusCode[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"A list of DNS status codes to filter by"}},
    {"name":"rrType","wire":"rrType[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS response type to filter by"}},
    {"name":"srcCountry","wire":"srcCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source country code"}},
    {"name":"dstCountry","wire":"dstCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination country code"}},
    {"name":"dstAsn","wire":"dstAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Destination ISP's ASN"}},
    {"name":"srcAsn","wire":"srcAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Source ISP's ASN"}},
    {"name":"dstIsp","wire":"dstIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination ISP's name"}},
    {"name":"srcIsp","wire":"srcIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source ISP's name"}},
  ] },
  { name: "get_statistics_timeseries_group", method: "GET", path: "/v2/statistic/timeseries/{group}", description: "Returns multiple single time series, split into distinct values of {group}.", fields: [
    {"name":"group","wire":"group","location":"path","required":true,"property":{"type":"string","enum":["endpointId","clientId","profileId","action","trigger","triggerValue","spoofTarget","question","protocol","statusCode","rrType","srcCountry","dstCountry","srcIsp","dstIsp","srcAsn","dstAsn"],"description":"The column name to group by."}},
    {"name":"startTime","wire":"startTime","location":"query","required":true,"property":{"type":"string","description":"Start time as a RFC3339 format"}},
    {"name":"endTime","wire":"endTime","location":"query","required":false,"property":{"type":"string","description":"End time as a RFC3339 format"}},
    {"name":"limit","wire":"limit","location":"query","required":false,"property":{"type":"number","description":"Maximum number of results."}},
    {"name":"endpointId","wire":"endpointId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of endpointIDs"}},
    {"name":"clientId","wire":"clientId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of clientIDs"}},
    {"name":"action","wire":"action[]","location":"query","required":false,"property":{"type":"array","items":{"type":"number"},"description":"Actions taken by Robert such as 0 for blocked, 1 for bypassed or 3 for redirected."}},
    {"name":"trigger","wire":"trigger[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string","enum":["default","filter","service","custom","grule","rebind"]},"description":"Action triggers such as 'filter', 'service', 'custom'"}},
    {"name":"triggerValue","wire":"triggerValue[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Action trigger values such as 'ads', 'netflix'"}},
    {"name":"spoofTarget","wire":"spoofTarget[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Redirect targets such as a location code or domain"}},
    {"name":"question","wire":"question[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS domain name to match"}},
    {"name":"searchQuestion","wire":"searchQuestion","location":"query","required":false,"property":{"type":"string","description":"A search string that filters by partial match on question."}},
    {"name":"searchQuestionMode","wire":"searchQuestionMode","location":"query","required":false,"property":{"type":"string","enum":["includes","startsWith","endsWith","excludes","apex"],"description":"Only used together with searchQuestion."}},
    {"name":"profileId","wire":"profileId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"ID of the active profile."}},
    {"name":"protocol","wire":"protocol[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS protocol such as 'doh' or 'doq'."}},
    {"name":"statusCode","wire":"statusCode[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"A list of DNS status codes to filter by"}},
    {"name":"rrType","wire":"rrType[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS response type to filter by"}},
    {"name":"srcCountry","wire":"srcCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source country code"}},
    {"name":"dstCountry","wire":"dstCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination country code"}},
    {"name":"dstAsn","wire":"dstAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Destination ISP's ASN"}},
    {"name":"srcAsn","wire":"srcAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Source ISP's ASN"}},
    {"name":"dstIsp","wire":"dstIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination ISP's name"}},
    {"name":"srcIsp","wire":"srcIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source ISP's name"}},
  ] },
  { name: "get_statistics_count", method: "GET", path: "/v2/statistic/count", description: "Counts records based on the parameters.", fields: [
    {"name":"startTime","wire":"startTime","location":"query","required":true,"property":{"type":"string","description":"Start time as a RFC3339 format"}},
    {"name":"endTime","wire":"endTime","location":"query","required":false,"property":{"type":"string","description":"End time as a RFC3339 format"}},
    {"name":"limit","wire":"limit","location":"query","required":false,"property":{"type":"number","description":"Maximum number of results."}},
    {"name":"endpointId","wire":"endpointId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of endpointIDs"}},
    {"name":"clientId","wire":"clientId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of clientIDs"}},
    {"name":"action","wire":"action[]","location":"query","required":false,"property":{"type":"array","items":{"type":"number"},"description":"Actions taken by Robert such as 0 for blocked, 1 for bypassed or 3 for redirected."}},
    {"name":"trigger","wire":"trigger[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string","enum":["default","filter","service","custom","grule","rebind"]},"description":"Action triggers such as 'filter', 'service', 'custom'"}},
    {"name":"triggerValue","wire":"triggerValue[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Action trigger values such as 'ads', 'netflix'"}},
    {"name":"spoofTarget","wire":"spoofTarget[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Redirect targets such as a location code or domain"}},
    {"name":"question","wire":"question[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS domain name to match"}},
    {"name":"searchQuestion","wire":"searchQuestion","location":"query","required":false,"property":{"type":"string","description":"A search string that filters by partial match on question."}},
    {"name":"searchQuestionMode","wire":"searchQuestionMode","location":"query","required":false,"property":{"type":"string","enum":["includes","startsWith","endsWith","excludes","apex"],"description":"Only used together with searchQuestion."}},
    {"name":"profileId","wire":"profileId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"ID of the active profile."}},
    {"name":"protocol","wire":"protocol[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS protocol such as 'doh' or 'doq'."}},
    {"name":"statusCode","wire":"statusCode[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"A list of DNS status codes to filter by"}},
    {"name":"rrType","wire":"rrType[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS response type to filter by"}},
    {"name":"srcCountry","wire":"srcCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source country code"}},
    {"name":"dstCountry","wire":"dstCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination country code"}},
    {"name":"dstAsn","wire":"dstAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Destination ISP's ASN"}},
    {"name":"srcAsn","wire":"srcAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Source ISP's ASN"}},
    {"name":"dstIsp","wire":"dstIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination ISP's name"}},
    {"name":"srcIsp","wire":"srcIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source ISP's name"}},
  ] },
  { name: "get_statistics_count_group", method: "GET", path: "/v2/statistic/count/{group}", description: "Counts records based on the parameters, split into unique values of {group}.", fields: [
    {"name":"group","wire":"group","location":"path","required":true,"property":{"type":"string","enum":["endpointId","clientId","profileId","action","trigger","triggerValue","spoofTarget","question","protocol","statusCode","rrType","srcCountry","dstCountry","srcIsp","dstIsp","srcAsn","dstAsn"],"description":"The column name to group by."}},
    {"name":"startTime","wire":"startTime","location":"query","required":true,"property":{"type":"string","description":"Start time as a RFC3339 format"}},
    {"name":"endTime","wire":"endTime","location":"query","required":false,"property":{"type":"string","description":"End time as a RFC3339 format"}},
    {"name":"limit","wire":"limit","location":"query","required":false,"property":{"type":"number","description":"Maximum number of results."}},
    {"name":"endpointId","wire":"endpointId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of endpointIDs"}},
    {"name":"clientId","wire":"clientId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of clientIDs"}},
    {"name":"action","wire":"action[]","location":"query","required":false,"property":{"type":"array","items":{"type":"number"},"description":"Actions taken by Robert such as 0 for blocked, 1 for bypassed or 3 for redirected."}},
    {"name":"trigger","wire":"trigger[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string","enum":["default","filter","service","custom","grule","rebind"]},"description":"Action triggers such as 'filter', 'service', 'custom'"}},
    {"name":"triggerValue","wire":"triggerValue[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Action trigger values such as 'ads', 'netflix'"}},
    {"name":"spoofTarget","wire":"spoofTarget[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Redirect targets such as a location code or domain"}},
    {"name":"question","wire":"question[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS domain name to match"}},
    {"name":"searchQuestion","wire":"searchQuestion","location":"query","required":false,"property":{"type":"string","description":"A search string that filters by partial match on question."}},
    {"name":"searchQuestionMode","wire":"searchQuestionMode","location":"query","required":false,"property":{"type":"string","enum":["includes","startsWith","endsWith","excludes","apex"],"description":"Only used together with searchQuestion."}},
    {"name":"profileId","wire":"profileId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"ID of the active profile."}},
    {"name":"protocol","wire":"protocol[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS protocol such as 'doh' or 'doq'."}},
    {"name":"statusCode","wire":"statusCode[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"A list of DNS status codes to filter by"}},
    {"name":"rrType","wire":"rrType[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS response type to filter by"}},
    {"name":"srcCountry","wire":"srcCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source country code"}},
    {"name":"dstCountry","wire":"dstCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination country code"}},
    {"name":"dstAsn","wire":"dstAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Destination ISP's ASN"}},
    {"name":"srcAsn","wire":"srcAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Source ISP's ASN"}},
    {"name":"dstIsp","wire":"dstIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination ISP's name"}},
    {"name":"srcIsp","wire":"srcIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source ISP's name"}},
    {"name":"sortOrder","wire":"sortOrder","location":"query","required":false,"property":{"type":"string","enum":["asc","desc"],"description":"Whether to sort ascending or descending."}},
  ] },
  { name: "get_statistics_trend_group", method: "GET", path: "/v2/statistic/trend/{group}", description: "Counts queries in the specified interval, grouped by {group}, compared to a specified baseline interval.", fields: [
    {"name":"group","wire":"group","location":"path","required":true,"property":{"type":"string","enum":["endpointId","clientId","profileId","action","trigger","triggerValue","spoofTarget","question","protocol","statusCode","rrType","srcCountry","dstCountry","srcIsp","dstIsp","srcAsn","dstAsn"],"description":"The column name to group by"}},
    {"name":"baselineStartTime","wire":"baselineStartTime","location":"query","required":false,"property":{"type":"string","description":"Start time of the baseline interval."}},
    {"name":"baselineEndTime","wire":"baselineEndTime","location":"query","required":false,"property":{"type":"string","description":"End time of the baseline interval."}},
    {"name":"startTime","wire":"startTime","location":"query","required":false,"property":{"type":"string","description":"Start time as a RFC3339 format"}},
    {"name":"endTime","wire":"endTime","location":"query","required":false,"property":{"type":"string","description":"End time as a RFC3339 format"}},
    {"name":"limit","wire":"limit","location":"query","required":false,"property":{"type":"number","description":"Maximum number of results."}},
    {"name":"endpointId","wire":"endpointId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of endpointIDs"}},
    {"name":"clientId","wire":"clientId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of clientIDs"}},
    {"name":"action","wire":"action[]","location":"query","required":false,"property":{"type":"array","items":{"type":"number"},"description":"Actions taken by Robert such as 0 for blocked, 1 for bypassed or 3 for redirected."}},
    {"name":"trigger","wire":"trigger[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string","enum":["default","filter","service","custom","grule","rebind"]},"description":"Action triggers such as 'filter', 'service', 'custom'"}},
    {"name":"triggerValue","wire":"triggerValue[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Action trigger values such as 'ads', 'netflix'"}},
    {"name":"spoofTarget","wire":"spoofTarget[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Redirect targets such as a location code or domain"}},
    {"name":"question","wire":"question[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS domain name to match"}},
    {"name":"searchQuestion","wire":"searchQuestion","location":"query","required":false,"property":{"type":"string","description":"A search string that filters by partial match on question."}},
    {"name":"searchQuestionMode","wire":"searchQuestionMode","location":"query","required":false,"property":{"type":"string","enum":["includes","startsWith","endsWith","excludes","apex"],"description":"Only used together with searchQuestion."}},
    {"name":"profileId","wire":"profileId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"ID of the active profile."}},
    {"name":"protocol","wire":"protocol[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS protocol such as 'doh' or 'doq'."}},
    {"name":"statusCode","wire":"statusCode[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"A list of DNS status codes to filter by"}},
    {"name":"rrType","wire":"rrType[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"DNS response type to filter by"}},
    {"name":"srcCountry","wire":"srcCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source country code"}},
    {"name":"dstCountry","wire":"dstCountry[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination country code"}},
    {"name":"dstAsn","wire":"dstAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Destination ISP's ASN"}},
    {"name":"srcAsn","wire":"srcAsn[]","location":"query","required":false,"property":{"type":"array","items":{"type":"integer"},"description":"Source ISP's ASN"}},
    {"name":"dstIsp","wire":"dstIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Destination ISP's name"}},
    {"name":"srcIsp","wire":"srcIsp[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Source ISP's name"}},
    {"name":"sortOrder","wire":"sortOrder","location":"query","required":false,"property":{"type":"string","enum":["asc","desc"],"description":"Whether to sort ascending or descending."}},
  ] },
  { name: "get_admin_actions", method: "GET", path: "/v2/admin-action", description: "Get admin action logs.", fields: [
    {"name":"action","wire":"action","location":"query","required":false,"property":{"type":"string","description":"Action type to filter by"}},
    {"name":"startTime","wire":"startTime","location":"query","required":true,"property":{"type":"string","description":"Start time as a RFC3339 format"}},
    {"name":"endTime","wire":"endTime","location":"query","required":false,"property":{"type":"string","description":"End time as a RFC3339 format"}},
    {"name":"pageSize","wire":"pageSize","location":"query","required":false,"property":{"type":"number","description":"Page size for pagination, default 100."}},
    {"name":"userId","wire":"userId","location":"query","required":false,"property":{"type":"string","description":"The ID of the user"}},
    {"name":"orgId","wire":"orgId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of orgIDs"}},
    {"name":"page","wire":"page","location":"query","required":false,"property":{"type":"number","description":"Page number (indexing starts with 0), default 0"}},
    {"name":"search","wire":"search","location":"query","required":false,"property":{"type":"string","description":"A search string that filters by partial match on action or metadata."}},
    {"name":"fetchExternal","wire":"fetchExternal","location":"query","required":false,"property":{"type":"boolean","description":"If set to true, will also read from other storage regions."}},
  ] },
  { name: "get_analytics_clients", method: "GET", path: "/v2/client", description: "Returns the metadata for an endpoint, and/or a set of ClientIds.", fields: [
    {"name":"endpointId","wire":"endpointId","location":"query","required":false,"property":{"type":"string","description":"The ID of the endpoint"}},
    {"name":"clientId","wire":"clientId[]","location":"query","required":false,"property":{"type":"array","items":{"type":"string"},"description":"Array of clientIDs"}},
  ] },
  { name: "delete_analytics_client_metadata", method: "DELETE", path: "/v2/client", description: "Deletes the client's metadata (host/mac/ip/os) _without_ deleting the client's queries or last activity time.", fields: [

  ] },
  { name: "delete_analytics_client_alias", method: "DELETE", path: "/v2/client/alias/{endpointId}/{clientId}", description: "Remove a client alias", fields: [
    {"name":"endpointId","wire":"endpointId","location":"path","required":true,"property":{"type":"string","description":"The endpointId of the client"}},
    {"name":"clientId","wire":"clientId","location":"path","required":true,"property":{"type":"string","description":"The ID of the client for which to create the alias"}},
  ] },
  { name: "set_analytics_client_alias", method: "PUT", path: "/v2/client/alias/{endpointId}/{clientId}", description: "Create or update a client alias.", fields: [
    {"name":"endpointId","wire":"endpointId","location":"path","required":true,"property":{"type":"string","description":"The endpointId of the client"}},
    {"name":"clientId","wire":"clientId","location":"path","required":true,"property":{"type":"string","description":"The ID of the client for which to create the alias"}},
  ] },
];

export const analyticsTools = OPERATIONS.map(operation => {
  const properties: Record<string, unknown> = Object.fromEntries(operation.fields.map(field => [field.name, field.property]));
  const required = operation.fields.filter(field => field.required).map(field => field.name);
  if (operation.name === "delete_analytics_client_metadata") {
    properties.endpointIds = { type: "array", items: { type: "string" }, description: "Endpoint IDs whose client metadata should be deleted" };
    properties.clientIds = { type: "array", items: { type: "string" }, description: "Client IDs whose metadata should be deleted" };
    properties.endTime = { type: "string", description: "Delete metadata up to this RFC3339 time" };
  }
  if (operation.name === "set_analytics_client_alias") {
    properties.alias = { type: "string", maxLength: 64, description: "New client alias, up to 64 UTF-8 characters" };
    required.push("alias");
  }
  if (operation.name === "stream_activity_log") {
    properties.max_events = { type: "integer", minimum: 1, maximum: 100, description: "Stop after this many events; default 20" };
    properties.duration_ms = { type: "integer", minimum: 1000, maximum: 30000, description: "Stop after this many milliseconds; default 10000" };
  }
  if (operation.name === "get_analytics_clients") {
    properties.clientId = { type: "array", items: { type: "string" }, description: "Client IDs to find; add endpointId to narrow the API request" };
  }
  if (operation.name === "get_activity_log") {
    properties.pageSize = { type: "integer", minimum: 1, maximum: 500, description: "Page size; the live API currently allows at most 500" };
  }
  properties.organization_id = { type: "string", description: "Optional sub-organization ID for X-Force-Org-Id" };
  const description = operation.name === "get_activity_log"
    ? `${operation.description} Returns one page at a time (up to 500 queries). Start at page 0; keep an explicit endTime and all filters fixed, then advance until queries.length is less than meta.pageSize.`
    : operation.name === "get_analytics_clients"
      ? `${operation.description} Client IDs can be looked up without knowing their endpoint.`
      : operation.description;
  return { name: operation.name, description, inputSchema: { type: "object" as const, properties, required } };
});

export async function callAnalyticsTool(client: ControlDClient, name: string, args: Record<string, unknown>): Promise<unknown> {
  const operation = OPERATIONS.find(item => item.name === name);
  if (!operation) throw new Error(`Unknown analytics tool: ${name}`);
  if (name === "get_activity_log" && args.pageSize !== undefined &&
    (typeof args.pageSize !== "number" || !Number.isInteger(args.pageSize) || args.pageSize < 1 || args.pageSize > 500)) {
    throw new Error("Activity Log pageSize must be an integer from 1 to 500; increment page to retrieve more results");
  }
  if (name === "get_analytics_clients" && Array.isArray(args.clientId) && args.clientId.length > 0 && !args.endpointId) {
    const data = await client.analyticsRequest("GET", "/v2/client") as {
      items?: Record<string, { clients?: Record<string, unknown>; [key: string]: unknown }>;
      [key: string]: unknown;
    };
    const selected = new Set(args.clientId);
    const items = Object.fromEntries(Object.entries(data.items ?? {}).flatMap(([endpointId, endpoint]) => {
      const clients = Object.fromEntries(Object.entries(endpoint.clients ?? {}).filter(([clientId]) => selected.has(clientId)));
      return Object.keys(clients).length ? [[endpointId, { ...endpoint, clients }]] : [];
    }));
    return { ...data, items };
  }
  let path = operation.path;
  const params: Record<string, unknown> = {};
  for (const field of operation.fields) {
    const value = args[field.name];
    if (value === undefined) continue;
    if (field.location === "path") path = path.replace(`{${field.wire}}`, encodeURIComponent(String(value)));
    else params[field.name] = value;
  }
  if (name === "stream_activity_log") {
    return client.streamActivityLog(params, Number(args.max_events ?? 20), Number(args.duration_ms ?? 10000));
  }
  let body: unknown;
  if (name === "delete_analytics_client_metadata") {
    body = Object.fromEntries(["endpointIds", "clientIds", "endTime"].filter(key => args[key] !== undefined).map(key => [key, args[key]]));
  } else if (name === "set_analytics_client_alias") {
    body = args.alias;
  }
  return client.analyticsRequest(operation.method, path, params, body, name === "export_activity_log_csv" ? "csv" : "json");
}

export function isAnalyticsTool(name: string) {
  return OPERATIONS.some(operation => operation.name === name);
}
