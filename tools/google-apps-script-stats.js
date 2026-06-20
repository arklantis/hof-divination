const ADMIN_TOKEN = "CHANGE_ME_TO_A_LONG_PRIVATE_TOKEN";
const SHEET_NAME = "events";

function doPost(e) {
  const sheet = getSheet_();
  const payload = parsePayload_(e);
  sheet.appendRow([
    new Date().toISOString(),
    payload.siteId || "",
    payload.eventName || "",
    payload.sessionId || "",
    payload.language || "",
    payload.questionType || "",
    payload.hasCustomTopic ? "1" : "0",
    payload.readingMode || "",
    payload.timezone || "",
    payload.country || payload.browserRegion || "",
    JSON.stringify(payload.detail || {})
  ]);
  return json_({ ok: true });
}

function doGet(e) {
  if ((e.parameter.token || "") !== ADMIN_TOKEN) {
    return json_({ error: "unauthorized" });
  }
  if ((e.parameter.mode || "") !== "summary") {
    return json_({ ok: true });
  }
  return json_(buildSummary_(e.parameter.period || "24h"));
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "timestamp",
      "siteId",
      "eventName",
      "sessionId",
      "language",
      "questionType",
      "hasCustomTopic",
      "readingMode",
      "timezone",
      "country",
      "detail"
    ]);
  }
  return sheet;
}

function parsePayload_(e) {
  try {
    return JSON.parse(e.postData.contents || "{}");
  } catch (error) {
    return {};
  }
}

function buildSummary_(period) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const range = resolvePeriod_(period);
  const rows = values.slice(1)
    .map((row) => {
      const detail = parseDetail_(row[10]);
      return {
        timestamp: row[0],
        eventName: row[2],
        sessionId: row[3],
        language: row[4],
        questionType: row[5],
        readingMode: row[7],
        timezone: row[8],
        country: row[9] || "unknown",
        detail
      };
    })
    .filter((row) => {
      const time = new Date(row.timestamp).getTime();
      return !range.since || time >= range.since.getTime();
    });

  const totals = countBy_(rows, "eventName");
  totals.reading_with_question = rows.filter((row) => row.eventName === "reading_drawn" && row.detail.hasQuestion).length;

  return {
    period,
    periodLabel: range.label,
    uniqueSessions: countUnique_(rows, "sessionId"),
    totals,
    byLanguage: toTable_(countBy_(rows, "language")),
    byTopic: toTable_(countBy_(rows, "questionType")),
    byCountry: toTable_(countBy_(rows, "country")),
    recent: rows.slice(-50).reverse()
  };
}

function resolvePeriod_(period) {
  const now = new Date();
  if (period === "today") {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return { label: "今日", since: today };
  }
  if (period === "7d") {
    return { label: "最近 7 天", since: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
  }
  if (period === "all") {
    return { label: "總體", since: null };
  }
  return { label: "最近 24 小時", since: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
}

function parseDetail_(value) {
  try {
    return JSON.parse(value || "{}");
  } catch (error) {
    return {};
  }
}

function countBy_(rows, key) {
  const result = {};
  rows.forEach((row) => {
    const value = row[key] || "unknown";
    result[value] = (result[value] || 0) + 1;
  });
  return result;
}

function toTable_(counts) {
  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .map((key) => ({ key, count: counts[key] }));
}

function countUnique_(rows, key) {
  return new Set(rows.map((row) => row[key]).filter(Boolean)).size;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
