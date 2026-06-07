import { idempotencyKey, nowIso, stableId } from "./ids.js";
import type {
  AccountRequestOptions,
  ClaimOutcomeFeedback,
  FetchLike,
  JsonObject,
  JsonValue,
  ListQuery,
  PublicIntelAppKeyCreate,
  PublicIntelQuotaRequest,
  PublicFeedback,
  RequestOptions,
  SymbolCockpitEvidenceQuery,
  ThesisFeedback,
  ThesisFeedbackQuery,
  TradeOSApiErrorBody,
  TradeOSPublicIntelClientOptions,
  WatchlistCreate,
  WatchlistDeliveryTrigger,
  WatchlistFeedback,
  WatchlistItemCreate,
  WatchlistNotificationChannelCreate,
  WatchlistSnapshotQuery,
  WatchlistUpdate,
} from "./types.js";

const DEFAULT_BASE_URL = "https://api.tradeos.tech/v1/public-intel";

export class TradeOSApiError extends Error {
  readonly status: number;
  readonly body: TradeOSApiErrorBody | string | undefined;

  constructor(message: string, status: number, body?: TradeOSApiErrorBody | string) {
    super(message);
    this.name = "TradeOSApiError";
    this.status = status;
    this.body = body;
  }
}

export class TradeOSPublicIntelClient {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly accountToken?: string;
  readonly appName: string;
  readonly appVersion: string;
  private readonly fetchImpl: FetchLike;

  constructor(options: TradeOSPublicIntelClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? process.env.TRADEOS_API_BASE ?? DEFAULT_BASE_URL);
    this.apiKey = options.apiKey ?? process.env.TRADEOS_PUBLIC_INTEL_KEY;
    this.accountToken = options.accountToken ?? process.env.TRADEOS_ACCOUNT_TOKEN;
    this.appName = options.appName ?? "tradeos-public-intel-kit";
    this.appVersion = options.appVersion ?? "0.1.0";
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async sourcesHealth(): Promise<JsonObject> {
    return this.get("/sources/health");
  }

  async getAppAttribution(): Promise<JsonObject> {
    return this.get("/app-attribution");
  }

  async createAppKey(request: PublicIntelAppKeyCreate, options: AccountRequestOptions = {}): Promise<JsonObject> {
    const payload: JsonObject = {
      app_name: request.appName,
    };
    setIfPresent(payload, "scopes", request.scopes);
    setIfPresent(payload, "expires_at", request.expiresAt);
    return this.post("/api-keys", payload, {
      authToken: this.requireAccountToken(options.accountToken),
      headers: options.headers,
    });
  }

  async listAppKeys(options: AccountRequestOptions = {}): Promise<JsonObject> {
    return this.request("/api-keys", {
      method: "GET",
      headers: accountAuthHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async revokeAppKey(keyId: string, options: AccountRequestOptions = {}): Promise<JsonObject> {
    return this.request(`/api-keys/${encodeURIComponent(keyId)}`, {
      method: "DELETE",
      headers: accountAuthHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async submitQuotaRequest(request: PublicIntelQuotaRequest, options: AccountRequestOptions = {}): Promise<JsonObject> {
    const payload: JsonObject = {
      project_name: request.projectName,
      use_case: request.useCase,
    };
    setIfPresent(payload, "project_url", request.projectUrl);
    setIfPresent(payload, "app_key_id", request.appKeyId);
    setIfPresent(payload, "requested_tier", request.requestedTier);
    setIfPresent(payload, "expected_daily_reads", request.expectedDailyReads);
    setIfPresent(payload, "expected_symbols_per_day", request.expectedSymbolsPerDay);
    setIfPresent(payload, "monetization_model", request.monetizationModel);
    setIfPresent(payload, "feedback_plan", request.feedbackPlan);
    setIfPresent(payload, "paid_intent", request.paidIntent);
    return this.post("/quota-requests", payload, {
      authToken: this.requireAccountToken(options.accountToken),
      headers: options.headers,
    });
  }

  async getMarketDigest(query: ListQuery = {}): Promise<JsonObject> {
    return this.get("/digest-inputs", listQueryParams(query));
  }

  async getPublicCandidates(query: ListQuery = {}): Promise<JsonObject> {
    return this.get("/candidates", listQueryParams(query));
  }

  async getThesisCandidates(query: ListQuery = {}): Promise<JsonObject> {
    return this.get("/thesis-candidates", listQueryParams(query));
  }

  async getThesisCheckpointCandidates(query: ListQuery = {}): Promise<JsonObject> {
    return this.get("/thesis-checkpoint-candidates", listQueryParams(query));
  }

  async getThesisOutcomeFollowupCandidates(query: ListQuery = {}): Promise<JsonObject> {
    return this.get("/thesis-outcome-followup-candidates", listQueryParams(query));
  }

  async getThesisWatchlist(query: ListQuery = {}): Promise<JsonObject> {
    return this.get("/thesis-watchlist", listQueryParams(query));
  }

  async getThesisWatchlistPulseInputs(query: ListQuery = {}): Promise<JsonObject> {
    return this.get("/thesis-watchlist-pulse-inputs", listQueryParams(query));
  }

  async getSupportedUniverseDigestInputs(query: ListQuery = {}): Promise<JsonObject> {
    return this.get("/supported-universe-digest-inputs", listQueryParams(query));
  }

  async getThesis(thesisId: string): Promise<JsonObject> {
    return this.get(`/theses/${encodeURIComponent(thesisId)}`);
  }

  async getThesisEvents(thesisId: string, limit = 100): Promise<JsonObject> {
    return this.get(`/theses/${encodeURIComponent(thesisId)}/events`, { limit });
  }

  async getThesisCheckpoints(thesisId: string, limit = 100): Promise<JsonObject> {
    return this.get(`/theses/${encodeURIComponent(thesisId)}/checkpoints`, { limit });
  }

  async getThesisEvidence(thesisId: string, limit = 100): Promise<JsonObject> {
    return this.get(`/theses/${encodeURIComponent(thesisId)}/evidence`, { limit });
  }

  async getThesisPublications(thesisId: string, limit = 100): Promise<JsonObject> {
    return this.get(`/theses/${encodeURIComponent(thesisId)}/publications`, { limit });
  }

  async getThesisFeedback(query: ThesisFeedbackQuery = {}): Promise<JsonObject> {
    const params: Record<string, string | number | undefined> = {
      source_service: query.sourceService,
      thesis_type: query.thesisType,
      subject: query.subject,
      horizon_seconds: query.horizonSeconds,
    };
    return this.get("/thesis-feedback", params);
  }

  async getWatchlistCapabilities(): Promise<JsonObject> {
    return this.get("/watchlist-capabilities");
  }

  async getTokenWatchlistSnapshot(tokenRef: string, query: WatchlistSnapshotQuery = {}): Promise<JsonObject> {
    return this.get(`/tokens/${encodeURIComponent(tokenRef)}/watchlist-snapshot`, {
      mode: query.mode,
      chain: query.chain,
      contract_address: query.contractAddress,
      limit: query.limit,
    });
  }

  async getSymbolCockpitEvidence(
    symbol: string,
    query: SymbolCockpitEvidenceQuery = {},
  ): Promise<JsonObject> {
    const sources: JsonObject = {};
    const sourceErrors: JsonObject = {};
    await Promise.all([
      captureSource(sourceErrors, "watchlist_snapshot", async () => {
        sources.watchlist_snapshot = await this.getTokenWatchlistSnapshot(symbol, {
          mode: query.mode,
          chain: query.chain,
          contractAddress: query.contractAddress,
          limit: query.watchlistLimit,
        });
      }),
      captureSource(sourceErrors, "digest", async () => {
        sources.digest = await this.getMarketDigest({
          chainId: query.chain,
          limit: query.digestLimit ?? 10,
        });
      }),
      captureSource(sourceErrors, "candidates", async () => {
        sources.candidates = await this.getPublicCandidates({
          chainId: query.chain,
          limit: query.candidateLimit ?? 10,
        });
      }),
      captureSource(sourceErrors, "thesis_watchlist", async () => {
        sources.thesis_watchlist = await this.getThesisWatchlist({
          chainId: query.chain,
          limit: query.watchlistLimit ?? 100,
        });
      }),
    ]);
    return {
      schema_version: "tradeos.public_intel.symbol_cockpit_evidence.v1",
      symbol: symbol.trim().toUpperCase(),
      chain: query.chain ?? "",
      mode: query.mode ?? "investor",
      sources,
      source_errors: sourceErrors,
      generated_at: nowIso(),
    };
  }

  async createWatchlist(request: WatchlistCreate, options: AccountRequestOptions = {}): Promise<JsonObject> {
    const payload: JsonObject = {
      name: request.name,
      mode: request.mode ?? "investor",
    };
    setIfPresent(payload, "description", request.description);
    setIfPresent(payload, "settings", request.settings);
    return this.post("/watchlists", payload, {
      authToken: this.requireAccountToken(options.accountToken),
      headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async listWatchlists(options: AccountRequestOptions = {}): Promise<JsonObject> {
    return this.request("/watchlists", {
      method: "GET",
      headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async getWatchlist(watchlistId: string, options: AccountRequestOptions = {}): Promise<JsonObject> {
    return this.request(`/watchlists/${encodeURIComponent(watchlistId)}`, {
      method: "GET",
      headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async updateWatchlist(
    watchlistId: string,
    request: WatchlistUpdate,
    options: AccountRequestOptions = {},
  ): Promise<JsonObject> {
    const payload: JsonObject = {};
    setIfPresent(payload, "name", request.name);
    setIfPresent(payload, "mode", request.mode);
    setIfPresent(payload, "description", request.description);
    setIfPresent(payload, "settings", request.settings);
    setIfPresent(payload, "archived", request.archived);
    return this.request(`/watchlists/${encodeURIComponent(watchlistId)}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        ...this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
      },
      body: JSON.stringify(payload),
    });
  }

  async archiveWatchlist(watchlistId: string, options: AccountRequestOptions = {}): Promise<JsonObject> {
    return this.request(`/watchlists/${encodeURIComponent(watchlistId)}`, {
      method: "DELETE",
      headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async addWatchlistItem(
    watchlistId: string,
    request: WatchlistItemCreate,
    options: AccountRequestOptions = {},
  ): Promise<JsonObject> {
    const payload: JsonObject = {
      symbol: request.symbol,
    };
    setIfPresent(payload, "chain", request.chain);
    setIfPresent(payload, "contract_address", request.contractAddress);
    setIfPresent(payload, "asset_namespace", request.assetNamespace);
    setIfPresent(payload, "source_ref", request.sourceRef);
    setIfPresent(payload, "identity_confidence", request.identityConfidence);
    setIfPresent(payload, "notes", request.notes);
    setIfPresent(payload, "metadata", request.metadata);
    return this.post(`/watchlists/${encodeURIComponent(watchlistId)}/items`, payload, {
      authToken: this.requireAccountToken(options.accountToken),
      headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async removeWatchlistItem(
    watchlistId: string,
    itemId: string,
    options: AccountRequestOptions = {},
  ): Promise<JsonObject> {
    return this.request(
      `/watchlists/${encodeURIComponent(watchlistId)}/items/${encodeURIComponent(itemId)}`,
      {
        method: "DELETE",
        headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
      },
    );
  }

  async getWatchlistState(watchlistId: string, options: AccountRequestOptions = {}): Promise<JsonObject> {
    return this.request(`/watchlists/${encodeURIComponent(watchlistId)}/state`, {
      method: "GET",
      headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async listWatchlistEvents(
    watchlistId: string,
    options: AccountRequestOptions & { limit?: number } = {},
  ): Promise<JsonObject> {
    return this.request(
      `/watchlists/${encodeURIComponent(watchlistId)}/events`,
      {
        method: "GET",
        headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
      },
      { limit: options.limit },
    );
  }

  async listWatchlistNotificationChannels(
    watchlistId: string,
    options: AccountRequestOptions = {},
  ): Promise<JsonObject> {
    return this.request(`/watchlists/${encodeURIComponent(watchlistId)}/notification-channels`, {
      method: "GET",
      headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async createWatchlistNotificationChannel(
    watchlistId: string,
    request: WatchlistNotificationChannelCreate,
    options: AccountRequestOptions = {},
  ): Promise<JsonObject> {
    const payload: JsonObject = {
      channel_kind: request.channelKind,
      target: request.target,
    };
    setIfPresent(payload, "min_severity", request.minSeverity);
    setIfPresent(payload, "digest_frequency", request.digestFrequency);
    setIfPresent(payload, "enabled", request.enabled);
    setIfPresent(payload, "metadata", request.metadata);
    return this.post(`/watchlists/${encodeURIComponent(watchlistId)}/notification-channels`, payload, {
      authToken: this.requireAccountToken(options.accountToken),
      headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async listWatchlistDeliveries(
    watchlistId: string,
    options: AccountRequestOptions & { limit?: number } = {},
  ): Promise<JsonObject> {
    return this.request(
      `/watchlists/${encodeURIComponent(watchlistId)}/deliveries`,
      {
        method: "GET",
        headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
      },
      { limit: options.limit },
    );
  }

  async triggerWatchlistDeliveries(
    watchlistId: string,
    request: WatchlistDeliveryTrigger = {},
    options: AccountRequestOptions = {},
  ): Promise<JsonObject> {
    const payload: JsonObject = {};
    setIfPresent(payload, "event_ids", request.eventIds);
    setIfPresent(payload, "channel_kinds", request.channelKinds);
    setIfPresent(payload, "min_severity", request.minSeverity);
    setIfPresent(payload, "max_events", request.maxEvents);
    setIfPresent(payload, "dry_run", request.dryRun);
    setIfPresent(payload, "force", request.force);
    return this.post(`/watchlists/${encodeURIComponent(watchlistId)}/deliveries/trigger`, payload, {
      authToken: this.requireAccountToken(options.accountToken),
      headers: this.accountHeaders(this.requireAccountToken(options.accountToken), options.headers),
    });
  }

  async getPublicClaimProof(publicClaimId: string): Promise<JsonObject> {
    return this.get(`/proofs/${encodeURIComponent(publicClaimId)}`);
  }

  async getAttestation(domain: string, date: string): Promise<JsonObject> {
    return this.get(`/attestations/${encodeURIComponent(domain)}/${encodeURIComponent(date)}`);
  }

  async writeClaim(payload: JsonObject, options: RequestOptions = {}): Promise<JsonObject> {
    return this.post("/claims", payload, options);
  }

  async submitClaimOutcomeFeedback(feedback: ClaimOutcomeFeedback, options: RequestOptions = {}): Promise<JsonObject> {
    const occurredAt = feedback.occurredAt ?? nowIso();
    const payload = {
      event_id: stableId("claim_feedback", [feedback.publicClaimId, feedback.label, occurredAt]),
      public_claim_id: feedback.publicClaimId,
      outcome_id: feedback.outcomeId ?? stableId("claim_outcome", [feedback.publicClaimId, feedback.label, occurredAt]),
      outcome_class: feedback.outcomeClass ?? feedback.label,
      outcome_score: feedback.outcomeScore ?? scoreForLabel(feedback.label),
      target_type: feedback.targetType,
      target_id: feedback.targetId,
      label: feedback.label,
      optional_note: feedback.optionalNote ?? "",
      consent_for_dataset_use: Boolean(feedback.consentForDatasetUse),
      anonymous_session_id_or_user_id: feedback.anonymousSessionIdOrUserId ?? "",
      client_app: feedback.clientApp ?? this.appName,
      client_version: feedback.clientVersion ?? this.appVersion,
      source_snapshot_refs: feedback.sourceSnapshotRefs ?? [],
      ...feedbackProvenance(feedback),
      occurred_at: occurredAt,
    };
    return this.post("/claim-outcomes", payload, options);
  }

  async submitThesisFeedback(feedback: ThesisFeedback, options: RequestOptions = {}): Promise<JsonObject> {
    const occurredAt = feedback.occurredAt ?? nowIso();
    const payload = {
      event_id: stableId("thesis_feedback", [feedback.thesisId, feedback.label, occurredAt]),
      thesis_id: feedback.thesisId,
      event_type: "outcome_observed",
      thesis_type: feedback.thesisType ?? "",
      subject: feedback.subject ?? "",
      chain_id: feedback.chainId ?? "",
      source_service: "tradeos-public-intel-kit",
      source_endpoint: "client.submitThesisFeedback",
      source_snapshot_refs: feedback.sourceSnapshotRefs ?? [],
      thesis_feedback_status: feedback.label,
      outcome_class: feedback.label,
      outcome_score: feedback.outcomeScore ?? scoreForLabel(feedback.label),
      event_json: {
        target_type: feedback.targetType,
        target_id: feedback.targetId,
        label: feedback.label,
        optional_note: feedback.optionalNote ?? "",
        consent_for_dataset_use: Boolean(feedback.consentForDatasetUse),
        anonymous_session_id_or_user_id: feedback.anonymousSessionIdOrUserId ?? "",
        client_app: feedback.clientApp ?? this.appName,
        client_version: feedback.clientVersion ?? this.appVersion,
        ...feedbackProvenance(feedback),
      },
      occurred_at: occurredAt,
    };
    return this.post("/thesis-outcomes", payload, options);
  }

  async submitDigestFeedback(feedback: PublicFeedback, options: RequestOptions = {}): Promise<JsonObject> {
    const occurredAt = feedback.occurredAt ?? nowIso();
    const payload = {
      event_id: stableId("digest_feedback", [feedback.targetType, feedback.targetId, feedback.label, occurredAt]),
      event_type: "public_intel_feedback",
      target_type: feedback.targetType,
      target_id: feedback.targetId,
      label: feedback.label,
      optional_note: feedback.optionalNote ?? "",
      consent_for_dataset_use: Boolean(feedback.consentForDatasetUse),
      anonymous_session_id_or_user_id: feedback.anonymousSessionIdOrUserId ?? "",
      client_app: feedback.clientApp ?? this.appName,
      client_version: feedback.clientVersion ?? this.appVersion,
      source_snapshot_refs: feedback.sourceSnapshotRefs ?? [],
      ...feedbackProvenance(feedback),
      occurred_at: occurredAt,
    };
    return this.post("/conversions", payload, options);
  }

  async submitWatchlistFeedback(feedback: WatchlistFeedback, options: RequestOptions = {}): Promise<JsonObject> {
    const occurredAt = feedback.occurredAt ?? nowIso();
    const note = feedback.optionalNote ?? feedback.notes ?? "";
    const payload = {
      target_type: feedback.targetType,
      target_id: feedback.targetId,
      label: feedback.label,
      optional_note: note,
      notes: note,
      source_snapshot_refs: feedback.sourceSnapshotRefs ?? [],
      event_id: feedback.eventId ?? feedback.targetId,
      client_app: feedback.clientApp ?? this.appName,
      client_version: feedback.clientVersion ?? this.appVersion,
      ...feedbackProvenance(feedback),
      occurred_at: occurredAt,
    };
    return this.post(`/watchlists/${encodeURIComponent(feedback.watchlistId)}/feedback`, payload, {
      ...options,
      authToken: this.requireAccountToken(options.authToken),
      headers: this.accountHeaders(this.requireAccountToken(options.authToken), options.headers),
    });
  }

  async postRaw(path: string, payload: JsonObject, options: RequestOptions = {}): Promise<JsonObject> {
    return this.post(path, payload, options);
  }

  private async get(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<JsonObject> {
    return this.request(path, { method: "GET" }, query);
  }

  private async post(path: string, payload: JsonObject, options: RequestOptions = {}): Promise<JsonObject> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      ...options.headers,
    };
    headers["idempotency-key"] = options.idempotencyKey ?? idempotencyKey();
    if (options.requestId) {
      headers["x-request-id"] = options.requestId;
    }
    if (options.authToken) {
      headers.authorization = `Bearer ${options.authToken}`;
    }
    return this.request(path, { method: "POST", headers, body: JSON.stringify(payload) });
  }

  private async request(
    path: string,
    init: RequestInit,
    query?: Record<string, string | number | boolean | undefined>,
  ): Promise<JsonObject> {
    const url = new URL(`${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value === undefined || value === "") {
        continue;
      }
      url.searchParams.set(key, String(value));
    }

    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    headers.set("user-agent", `${this.appName}/${this.appVersion}`);
    if (this.apiKey && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${this.apiKey}`);
    }

    const response = await this.fetchImpl(url, { ...init, headers });
    const text = await response.text();
    const body = text ? parseJson(text) : {};
    if (!response.ok) {
      throw new TradeOSApiError(
        `TradeOS public intelligence request failed: ${response.status} ${response.statusText}`,
        response.status,
        isJsonObject(body) ? body : String(body),
      );
    }
    if (!isJsonObject(body)) {
      throw new TradeOSApiError("TradeOS public intelligence response was not a JSON object", response.status, text);
    }
    return body;
  }

  private requireAccountToken(override?: string): string {
    const token = override ?? this.accountToken;
    if (!token) {
      throw new Error("TRADEOS_ACCOUNT_TOKEN or an account token option is required for account-scoped public-intel operations.");
    }
    return token;
  }

  private accountHeaders(accountToken: string, headers: Record<string, string> = {}): Record<string, string> {
    const result = accountAuthHeaders(accountToken, headers);
    if (this.apiKey && !result["x-tradeos-public-intel-key"]) {
      result["x-tradeos-public-intel-key"] = this.apiKey;
    }
    return result;
  }
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function listQueryParams(query: ListQuery): Record<string, string | number | undefined> {
  return {
    limit: query.limit,
    chain_id: query.chainId,
    since: query.since,
    window_start: query.windowStart,
    window_end: query.windowEnd,
  };
}

function feedbackProvenance(feedback: PublicFeedback): JsonObject {
  const provenance: JsonObject = {};
  setIfPresent(provenance, "feedback_source", feedback.feedbackSource);
  setIfPresent(provenance, "automation_level", feedback.automationLevel);
  setIfPresent(provenance, "agent_id", feedback.agentId);
  setIfPresent(provenance, "agent_run_id", feedback.agentRunId);
  setIfPresent(provenance, "agent_model", feedback.agentModel);
  setIfPresent(provenance, "agent_confidence", feedback.agentConfidence);
  setIfPresent(provenance, "provenance_note", feedback.provenanceNote);
  return provenance;
}

function setIfPresent(target: JsonObject, key: string, value: JsonValue | undefined): void {
  if (value === undefined || value === "") {
    return;
  }
  target[key] = value;
}

function accountAuthHeaders(accountToken: string, headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...headers,
    authorization: `Bearer ${accountToken}`,
  };
}

async function captureSource(errors: JsonObject, name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error: unknown) {
    errors[name] = error instanceof Error ? error.message : String(error);
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scoreForLabel(label: string): number {
  switch (label) {
    case "useful":
    case "state_rebounded":
    case "state_stabilized":
      return 1;
    case "not_useful":
    case "false_positive":
    case "confusing_explanation":
    case "evidence_too_thin":
      return -1;
    default:
      return 0;
  }
}
