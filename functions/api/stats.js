const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

const PERIODS = {
  "24h": { label: "最近 24 小時", seconds: 24 * 60 * 60 },
  today: { label: "今日", today: true },
  "7d": { label: "最近 7 天", seconds: 7 * 24 * 60 * 60 },
  all: { label: "總體", all: true }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function cleanText(value, maxLength = 120) {
  return String(value || "").slice(0, maxLength);
}

function parseBoolean(value) {
  return value ? 1 : 0;
}

function getPeriodStart(periodKey) {
  const period = PERIODS[periodKey] || PERIODS["24h"];
  if (period.all) return null;
  const now = new Date();
  if (period.today) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
  }
  return new Date(Date.now() - period.seconds * 1000).toISOString();
}

function periodWhere(periodKey) {
  const start = getPeriodStart(periodKey);
  return start ? { clause: "WHERE created_at >= ?", params: [start] } : { clause: "", params: [] };
}

async function readJson(request) {
  const text = await request.text();
  if (!text.trim()) return {};
  return JSON.parse(text);
}

async function handlePost(request, env) {
  if (!env.HOF_STATS_DB) {
    return json({ ok: false, error: "D1 binding HOF_STATS_DB is not configured." }, 500);
  }

  let payload;
  try {
    payload = await readJson(request);
  } catch {
    return json({ ok: false, error: "Invalid JSON payload." }, 400);
  }

  const detail = payload.detail && typeof payload.detail === "object"
    ? JSON.stringify(payload.detail).slice(0, 2000)
    : "";
  const country = cleanText(request.cf?.country || payload.country || payload.browserRegion || "", 8);

  await env.HOF_STATS_DB.prepare(`
    INSERT INTO events (
      created_at, site_id, event_name, session_id, language, question_type,
      has_custom_topic, reading_mode, path, timezone, browser_locale,
      browser_region, country, detail
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    cleanText(payload.timestamp, 40) || new Date().toISOString(),
    cleanText(payload.siteId, 80) || "hof-divination",
    cleanText(payload.eventName, 80),
    cleanText(payload.sessionId, 160),
    cleanText(payload.language, 16),
    cleanText(payload.questionType, 40),
    parseBoolean(payload.hasCustomTopic),
    cleanText(payload.readingMode, 40),
    cleanText(payload.path, 240),
    cleanText(payload.timezone, 80),
    cleanText(payload.browserLocale, 40),
    cleanText(payload.browserRegion, 16),
    country,
    detail
  ).run();

  return json({ ok: true });
}

async function countBy(db, column, where, eventName = "reading_drawn") {
  const eventFilter = eventName ? `${where.clause ? " AND" : "WHERE"} event_name = ?` : "";
  const params = eventName ? [...where.params, eventName] : where.params;
  const query = `
    SELECT COALESCE(NULLIF(${column}, ''), 'unknown') AS key, COUNT(*) AS count
    FROM events
    ${where.clause}
    ${eventFilter}
    GROUP BY key
    ORDER BY count DESC
    LIMIT 20
  `;
  const result = await db.prepare(query).bind(...params).all();
  return result.results || [];
}

async function handleGet(request, env) {
  if (!env.HOF_STATS_DB) {
    return json({ ok: false, error: "D1 binding HOF_STATS_DB is not configured." }, 500);
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (!env.HOF_STATS_TOKEN || token !== env.HOF_STATS_TOKEN) {
    return json({ ok: false, error: "Unauthorized." }, 401);
  }

  const periodKey = PERIODS[url.searchParams.get("period")] ? url.searchParams.get("period") : "24h";
  const where = periodWhere(periodKey);
  const db = env.HOF_STATS_DB;

  const totalsRows = await db.prepare(`
    SELECT event_name AS eventName, COUNT(*) AS count
    FROM events
    ${where.clause}
    GROUP BY event_name
  `).bind(...where.params).all();

  const totals = {};
  for (const row of totalsRows.results || []) {
    totals[row.eventName] = row.count;
  }

  const withQuestion = await db.prepare(`
    SELECT COUNT(*) AS count
    FROM events
    ${where.clause ? `${where.clause} AND` : "WHERE"} event_name = 'reading_drawn'
      AND detail LIKE '%"hasQuestion":true%'
  `).bind(...where.params).first();
  totals.reading_with_question = withQuestion?.count || 0;

  const uniqueSessions = await db.prepare(`
    SELECT COUNT(DISTINCT session_id) AS count
    FROM events
    ${where.clause}
  `).bind(...where.params).first();

  const conversionTargets = await db.prepare(`
    SELECT
      CASE
        WHEN event_name = 'about_link_clicked' THEN '{"target":"about_game"}'
        ELSE COALESCE(NULLIF(detail, ''), '{"target":"unknown"}')
      END AS key,
      COUNT(*) AS count
    FROM events
    ${where.clause}
    ${where.clause ? " AND" : "WHERE"} event_name IN ('about_link_clicked', 'outbound_clicked')
    GROUP BY key
    ORDER BY count DESC
    LIMIT 20
  `).bind(...where.params).all();

  const recentFilter = `${where.clause ? " AND" : "WHERE"} event_name NOT IN ('about_link_clicked', 'about_page_view', 'outbound_clicked', 'language_changed')`;
  const recent = await db.prepare(`
    SELECT created_at AS timestamp, event_name AS eventName, language, question_type AS questionType, country
    FROM events
    ${where.clause}
    ${recentFilter}
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(...where.params).all();

  return json({
    ok: true,
    period: periodKey,
    periodLabel: PERIODS[periodKey].label,
    uniqueSessions: uniqueSessions?.count || 0,
    totals,
    byLanguage: await countBy(db, "language", where),
    byTopic: await countBy(db, "question_type", where),
    byCountry: await countBy(db, "country", where),
    byConversionTarget: conversionTargets.results || [],
    recent: recent.results || []
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }
  if (request.method === "POST") return handlePost(request, env);
  if (request.method === "GET") return handleGet(request, env);
  return json({ ok: false, error: "Method not allowed." }, 405);
}
