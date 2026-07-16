# N8N_NODE_VALUES.md — Exact Node Configuration for TRIGA-S Workflow

Copy these values verbatim into each n8n node's fields.

> **Note on email header image loading:** Email header images are loaded by Gmail as remote images from `https://www.afa-ai.com/triga-s-email/headers/`. This cannot be made completely instant — Gmail fetches external images after the email body structure renders. However, the following optimizations reduce visible loading as much as possible: optimized PNG file size (22–27 KB each), fixed `width` and `height` attributes (Gmail reserves the exact space immediately), and a matching `background-color:#003B70` fallback on the container `<td>` (shows TRIGA-S blue instead of a white flash while the image loads).

---

## Node: TRIGA-S Lead Intern

This node sends the internal notification email for new chatbot leads.
It runs **before** any Gmail node, so `$json` is still the original webhook/Set data.

| Field | Value |
|---|---|
| **To** | `info@afa-ai.com` |
| **Subject** | `Neue TRIGA-S Chatbot-Anfrage – {{ $('leadId').first().json.interesse \|\| $('leadId').first().json.body?.interesse \|\| $('TrigaS-ChatBot-Lead').first().json.body?.interesse \|\| 'Allgemein' }}` |
| **Message** | *(paste full content of `trigas_anfrage_intern_n8n.html`)* |
| **Message type** | HTML |

---

## Node: Anfrage Bestätigung Kunde

This node sends the confirmation email to the customer.
It runs **after** the "TRIGA-S Lead Intern" Gmail node — meaning `$json` at this point contains **Gmail API output**, not lead data.

**All expressions in this template MUST use `$('leadId').first().json` — never `$json` alone.**

| Field | Value |
|---|---|
| **To** | `{{ $('leadId').first().json.email \|\| $('leadId').first().json['E-Mail'] \|\| $('leadId').first().json.body?.email \|\| $('TrigaS-ChatBot-Lead').first().json.body?.email \|\| '' }}` |
| **Subject** | `Vielen Dank für Ihre Anfrage bei TRIGA-S` |
| **Message** | *(paste full content of `trigas_anfrage_bestaetigung_kunde_n8n.html`)* |
| **Message type** | HTML |

---

## Google Sheets: Telefon Column #ERROR Fix

**Problem:** Phone numbers starting with `+49` are interpreted as formula prefixes by Google Sheets, causing `#ERROR`.

**Fix:** Prepend an apostrophe character to force Google Sheets to treat the value as plain text.

### Expression to use in the Google Sheets node (Telefon field):

```
{{ "'" + ($('leadId').first().json.telefon || $('leadId').first().json.Telefon || $('leadId').first().json.body?.telefon || $('TrigaS-ChatBot-Lead').first().json.body?.telefon || '') }}
```

**How it works:**
- The leading `'` (apostrophe) tells Google Sheets: "this is text, not a formula"
- The apostrophe is invisible in the cell — the user sees the phone number normally
- The `||` fallback chain ensures it works regardless of where in the n8n data the phone number lives

**Where to apply:** In the Google Sheets node that writes lead data, find the column mapped to "Telefon" and replace the current expression with the one above.

---

## Image Deployment Verification

**Before testing the real email, open these URLs in the browser:**

- `https://www.afa-ai.com/triga-s-email/trigas-full-logo-white.png`
- `https://www.afa-ai.com/triga-s-email/trigas-lines.png`

If either URL gives 404, the images are not deployed yet and Gmail cannot show them.

The source files exist at:
- `public/triga-s-email/trigas-full-logo-white.png` (45,374 bytes)
- `public/triga-s-email/trigas-lines.png` (981,708 bytes)

These files are served at the root of `https://www.afa-ai.com/` — confirm they are included in the production deployment.

---

## Node: Code in JavaScript5 (TrigaS-termin-verschieben-auto)

Position in workflow: after Google Sheets read, before `Get many events1`.

**Only two things changed from the original — everything else is identical:**

1. After `oldStartParts`/`oldEndParts` — added input fallbacks for `old_start_ms` / `old_start_rfc3339`
2. `oldStartDate`/`oldEndDate` block — replaced the narrow `toDate(newStartParts)` fallback with a 30-day lookback so `Get many events1` always returns the existing event when the Sheets row date columns are empty

**Paste this complete code into the Code in JavaScript5 node:**

```javascript
function safeNodeJson(nodeName) {
  try {
    return $(nodeName).first().json || {};
  } catch (e) {
    return {};
  }
}

const inputA = safeNodeJson('Edit Fields Verschieben');
const inputB = safeNodeJson('Edit Fields5');
const webhook = safeNodeJson('TrigaS-termin-verschieben-auto');

const body = webhook.body || {};
const query = webhook.query || {};

const rows = items.map(item => item.json || {});

function clean(value) {
  return String(value ?? '').trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function normalizeKey(key) {
  return String(key ?? '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
    .replace(/[^a-z0-9äöüß]/g, '');
}

function normalizeEventId(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[​-‍﻿]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function getByPossibleKeys(row, possibleKeys) {
  const normalizedRow = {};

  for (const key of Object.keys(row || {})) {
    normalizedRow[normalizeKey(key)] = row[key];
  }

  for (const key of possibleKeys) {
    const normalizedKey = normalizeKey(key);

    if (
      normalizedRow[normalizedKey] !== undefined &&
      normalizedRow[normalizedKey] !== null &&
      String(normalizedRow[normalizedKey]).trim() !== ''
    ) {
      return normalizedRow[normalizedKey];
    }
  }

  return '';
}

const eventIdKeys = [
  'Google Kalender Termin-ID',
  'Google Calendar Termin-ID',
  'Google Kalender Termin ID',
  'Google Calendar Event ID',
  'Google Calendar ID',
  'Google Kalender Event ID',
  'Termin-ID',
  'Termin ID',
  'Event ID',
  'event_id',
  'eventId',
  'id',
];

const input = {
  event_id:
    inputA.event_id ||
    inputB.event_id ||
    body.event_id ||
    query.event_id ||
    webhook.event_id ||
    '',

  email:
    inputA.email ||
    inputB.email ||
    body.email ||
    query.email ||
    webhook.email ||
    '',

  new_datetime:
    inputA.new_datetime ||
    inputB.new_datetime ||
    body.new_datetime ||
    body.requested_datetime ||
    query.new_datetime ||
    query.requested_datetime ||
    webhook.new_datetime ||
    '',

  new_date:
    inputA.new_date ||
    inputB.new_date ||
    body.new_date ||
    body.requested_date ||
    query.new_date ||
    query.requested_date ||
    webhook.new_date ||
    '',

  new_time:
    inputA.new_time ||
    inputB.new_time ||
    body.new_time ||
    body.requested_time ||
    query.new_time ||
    query.requested_time ||
    webhook.new_time ||
    '',

  duration_minutes:
    inputA.duration_minutes ||
    inputB.duration_minutes ||
    body.duration_minutes ||
    query.duration_minutes ||
    webhook.duration_minutes ||
    30,

  timezone:
    inputA.timezone ||
    inputB.timezone ||
    body.timezone ||
    query.timezone ||
    webhook.timezone ||
    'Europe/Berlin',

  source:
    inputA.source ||
    inputB.source ||
    body.source ||
    query.source ||
    webhook.source ||
    'TRIGA-S Chatbot',

  message:
    inputA.message ||
    inputB.message ||
    body.message ||
    query.message ||
    webhook.message ||
    '',
};

const requestedEventId = clean(input.event_id);
const requestedEventIdNormalized = normalizeEventId(requestedEventId);
const requestedEmail = lower(input.email);

if (!requestedEventId) {
  return [
    {
      json: {
        success: false,
        error: 'missing_event_id',
        message: 'Es fehlt die Termin-ID.',
        debug_input: input,
      },
    },
  ];
}

let found = null;

if (rows.length === 1) {
  found = rows[0];
}

if (!found) {
  found = rows.find(row => {
    const rowEventIdRaw = getByPossibleKeys(row, eventIdKeys);
    const rowEventIdNormalized = normalizeEventId(rowEventIdRaw);

    return (
      rowEventIdNormalized === requestedEventIdNormalized ||
      rowEventIdNormalized.includes(requestedEventIdNormalized) ||
      requestedEventIdNormalized.includes(rowEventIdNormalized)
    );
  });
}

if (!found && requestedEmail) {
  found = rows.find(row => {
    const rowEmail = lower(
      getByPossibleKeys(row, ['E-Mail', 'Email', 'email', 'E Mail'])
    );

    return rowEmail === requestedEmail;
  });
}

if (!found) {
  return [
    {
      json: {
        success: false,
        error: 'appointment_not_found',
        event_id: requestedEventId,
        event_id_normalized: requestedEventIdNormalized,
        email: requestedEmail,
        message: 'Ich konnte keinen passenden Termin zu dieser Termin-ID finden.',
        debug: {
          received_event_id: requestedEventId,
          received_event_id_normalized: requestedEventIdNormalized,
          rows_checked: rows.length,
          available_event_ids: rows.map(row => clean(getByPossibleKeys(row, eventIdKeys))),
          available_event_ids_normalized: rows.map(row => normalizeEventId(getByPossibleKeys(row, eventIdKeys))),
          available_columns: rows[0] ? Object.keys(rows[0]) : [],
        },
      },
    },
  ];
}

const rowEmail = lower(
  getByPossibleKeys(found, ['E-Mail', 'Email', 'email', 'E Mail'])
);

if (requestedEmail && rowEmail && rowEmail !== requestedEmail) {
  return [
    {
      json: {
        success: false,
        error: 'email_mismatch',
        event_id: requestedEventId,
        email: requestedEmail,
        row_email: rowEmail,
        message: 'Die Termin-ID wurde gefunden, aber die E-Mail-Adresse passt nicht zum Termin.',
      },
    },
  ];
}

const currentStatus = lower(getByPossibleKeys(found, ['Status', 'status']));

if (
  currentStatus === 'storniert' ||
  currentStatus === 'cancelled' ||
  currentStatus === 'canceled'
) {
  return [
    {
      json: {
        success: false,
        error: 'appointment_already_cancelled',
        event_id: requestedEventId,
        email: requestedEmail,
        message: 'Dieser Termin wurde bereits storniert.',
      },
    },
  ];
}

const timeZone = clean(input.timezone) || 'Europe/Berlin';
const durationMinutes = Number(input.duration_minutes || 30);

const BUSINESS_START_HOUR = 8;
const BUSINESS_END_HOUR = 18;
const ALLOW_WEEKENDS = false;

function pad(num) {
  return String(num).padStart(2, '0');
}

function parseDateTime(inputValue, inputDate, inputTime) {
  let raw = clean(inputValue);

  if (!raw && clean(inputDate) && clean(inputTime)) {
    raw = `${clean(inputDate)} ${clean(inputTime)}`;
  }

  if (!raw) return null;

  raw = raw.replace('T', ' ').replace(/\s+/g, ' ').trim();

  let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);

  if (match) {
    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
      hour: Number(match[4]),
      minute: Number(match[5]),
      second: Number(match[6] || 0),
    };
  }

  match = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);

  if (match) {
    return {
      year: Number(match[3]),
      month: Number(match[2]),
      day: Number(match[1]),
      hour: Number(match[4]),
      minute: Number(match[5]),
      second: Number(match[6] || 0),
    };
  }

  return null;
}

function lastSunday(year, monthIndex) {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
  const day = lastDay.getUTCDay();
  return lastDay.getUTCDate() - day;
}

function getBerlinOffset(year, month, day, hour) {
  const marchLastSunday = lastSunday(year, 2);
  const octoberLastSunday = lastSunday(year, 9);

  let isDST = false;

  if (month > 3 && month < 10) {
    isDST = true;
  } else if (month === 3) {
    isDST = day > marchLastSunday || (day === marchLastSunday && hour >= 2);
  } else if (month === 10) {
    isDST = day < octoberLastSunday || (day === octoberLastSunday && hour < 3);
  }

  return isDST ? '+02:00' : '+01:00';
}

function toLocalString(parts) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second || 0)}`;
}

function toRFC3339(parts) {
  const offset = timeZone === 'Europe/Berlin'
    ? getBerlinOffset(parts.year, parts.month, parts.day, parts.hour)
    : '+01:00';

  return `${toLocalString(parts)}${offset}`;
}

function toDate(parts) {
  return new Date(toRFC3339(parts));
}

function addMinutes(parts, minutesToAdd) {
  const offset = timeZone === 'Europe/Berlin'
    ? getBerlinOffset(parts.year, parts.month, parts.day, parts.hour)
    : '+01:00';

  const utcDate = new Date(`${toLocalString(parts)}${offset}`);
  utcDate.setMinutes(utcDate.getMinutes() + minutesToAdd);

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formatted = formatter.formatToParts(utcDate);
  const map = {};

  for (const part of formatted) {
    map[part.type] = part.value;
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

function formatGermanDateTime(parts) {
  return `${pad(parts.day)}.${pad(parts.month)}.${parts.year}, ${pad(parts.hour)}:${pad(parts.minute)} Uhr`;
}

function isPast(parts) {
  return toDate(parts).getTime() <= Date.now();
}

function getWeekday(parts) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
  return date.getUTCDay();
}

function isWithinBusinessHours(startParts, endParts) {
  const weekday = getWeekday(startParts);

  if (!ALLOW_WEEKENDS && (weekday === 0 || weekday === 6)) return false;
  if (startParts.hour < BUSINESS_START_HOUR) return false;
  if (endParts.hour > BUSINESS_END_HOUR) return false;
  if (endParts.hour === BUSINESS_END_HOUR && endParts.minute > 0) return false;

  return true;
}

const newStartParts = parseDateTime(
  input.new_datetime,
  input.new_date,
  input.new_time
);

if (!newStartParts) {
  return [
    {
      json: {
        success: false,
        error: 'invalid_new_datetime',
        message: 'Bitte gib ein gültiges neues Datum mit Uhrzeit an.',
      },
    },
  ];
}

const newEndParts = addMinutes(newStartParts, durationMinutes);

if (isPast(newStartParts)) {
  return [
    {
      json: {
        success: false,
        error: 'new_datetime_in_past',
        message: 'Der neue Termin darf nicht in der Vergangenheit liegen.',
      },
    },
  ];
}

if (!isWithinBusinessHours(newStartParts, newEndParts)) {
  return [
    {
      json: {
        success: false,
        error: 'outside_business_hours',
        message: 'Dieser Termin liegt außerhalb der verfügbaren Zeiten. Bitte wähle eine andere Uhrzeit.',
      },
    },
  ];
}

const eventId = clean(getByPossibleKeys(found, eventIdKeys)) || requestedEventId;

const vorname = clean(getByPossibleKeys(found, ['Vorname', 'vorname', 'First Name']));
const nachname = clean(getByPossibleKeys(found, ['Nachname', 'nachname', 'Last Name']));
const email = clean(getByPossibleKeys(found, ['E-Mail', 'Email', 'email', 'E Mail'])) || requestedEmail;
const telefon = clean(getByPossibleKeys(found, ['Telefon', 'telefon', 'Phone']));
const unternehmen = clean(getByPossibleKeys(found, ['Unternehmen', 'unternehmen', 'Company']));
const interesse = clean(getByPossibleKeys(found, ['Interesse', 'interesse', 'Leistung', 'Service']));

const oldTerminRaw = clean(
  getByPossibleKeys(found, [
    'Termin Datum/Zeit',
    'Termin Datum Zeit',
    'appointmentDateTime',
  ])
);

const oldDate = clean(
  getByPossibleKeys(found, [
    'Termin-Datum',
    'Termin Datum',
    'Datum',
    'date',
  ])
);

const oldTime = clean(
  getByPossibleKeys(found, [
    'Termin-Uhrzeit',
    'Termin Uhrzeit',
    'Uhrzeit',
    'time',
  ])
);

const oldStartParts = parseDateTime(oldTerminRaw, oldDate, oldTime);
const oldEndParts = oldStartParts ? addMinutes(oldStartParts, durationMinutes) : null;

// ── Additional old-appointment sources when Sheets columns are empty ────────────
// Upstream nodes (Edit Fields Verschieben / Edit Fields5) may forward the
// Google Calendar event's start time as old_start_rfc3339 / old_start_ms.
const oldStartRFC_input = clean(inputA.old_start_rfc3339 || inputB.old_start_rfc3339);
const oldEndRFC_input   = clean(inputA.old_end_rfc3339   || inputB.old_end_rfc3339);
const oldStartMs_input  = Number(inputA.old_start_ms || inputB.old_start_ms || 0) || 0;
const oldEndMs_input    = Number(inputA.old_end_ms   || inputB.old_end_ms   || 0) || 0;

const besprechungslink = clean(
  getByPossibleKeys(found, [
    'Besprechungslink',
    'Meeting Link',
    'hangoutLink',
  ])
);

const kalenderlink = clean(
  getByPossibleKeys(found, [
    'Kalenderlink',
    'Calendar Link',
    'calendarLink',
  ])
);

const newStartLocal = toLocalString(newStartParts);
const newEndLocal = toLocalString(newEndParts);

const newStartRFC3339 = toRFC3339(newStartParts);
const newEndRFC3339 = toRFC3339(newEndParts);

const oldTerminFormatted = oldStartParts
  ? formatGermanDateTime(oldStartParts)
  : clean(oldTerminRaw || `${oldDate} ${oldTime}`) || 'Nicht angegeben';

const newTerminFormatted = formatGermanDateTime(newStartParts);

const newStartDate = toDate(newStartParts);
const newEndDate   = toDate(newEndParts);

// ── Availability window: spans BOTH old and new appointment ────────────────────
// Priority: parsed Sheets parts → RFC3339 input → ms input → 30-day lookback.
// The 30-day lookback guarantees Get many events1 always returns the existing
// event even when Termin-Datum / Termin-Uhrzeit are empty in the Sheets row.
let oldStartDate, oldEndDate;

if (oldStartParts) {
  oldStartDate = toDate(oldStartParts);
  oldEndDate   = toDate(oldEndParts);
} else if (oldStartRFC_input) {
  oldStartDate = new Date(oldStartRFC_input);
  oldEndDate   = oldEndRFC_input
    ? new Date(oldEndRFC_input)
    : new Date(oldStartDate.getTime() + durationMinutes * 60 * 1000);
} else if (oldStartMs_input) {
  oldStartDate = new Date(oldStartMs_input);
  oldEndDate   = oldEndMs_input
    ? new Date(oldEndMs_input)
    : new Date(oldStartDate.getTime() + durationMinutes * 60 * 1000);
} else {
  // Old date unknown: look back 30 days from new start to catch the existing event
  oldStartDate = new Date(newStartDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  oldEndDate   = new Date(oldStartDate.getTime() + durationMinutes * 60 * 1000);
}

const availabilityStartDate = new Date(Math.min(oldStartDate.getTime(), newStartDate.getTime()) - 60 * 1000);
const availabilityEndDate   = new Date(Math.max(oldEndDate.getTime(),   newEndDate.getTime())   + 60 * 1000);

const now = new Date();

const changedAt = now.toLocaleString('de-DE', {
  timeZone: 'Europe/Berlin',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

return [
  {
    json: {
      success: true,
      action: 'prepare_reschedule',

      event_id: eventId,
      email,
      vorname,
      nachname,
      name: `${vorname} ${nachname}`.trim(),
      telefon,
      unternehmen,
      interesse,

      old_termin_raw: oldTerminRaw || `${oldDate} ${oldTime}`.trim(),
      old_termin_formatted: oldTerminFormatted,

      new_start_local: newStartLocal,
      new_end_local: newEndLocal,
      new_start_rfc3339: newStartRFC3339,
      new_end_rfc3339: newEndRFC3339,
      new_start_ms: newStartDate.getTime(),
      new_end_ms: newEndDate.getTime(),
      new_termin_formatted: newTerminFormatted,

      availability_check_start_rfc3339: availabilityStartDate.toISOString(),
      availability_check_end_rfc3339: availabilityEndDate.toISOString(),

      duration_minutes: durationMinutes,
      timeZone,

      besprechungslink,
      kalenderlink,

      source: clean(input.source) || 'TRIGA-S Chatbot',
      customer_message: clean(input.message),

      status_update: 'Termin verschoben',
      changed_at: changedAt,

      notizen:
        `Termin automatisch verschoben am ${changedAt} Uhr. ` +
        `Alter Termin: ${oldTerminFormatted}. ` +
        `Neuer Termin: ${newTerminFormatted}.`,

      chatbot_success_message:
        `Dein Termin wurde erfolgreich auf ${newTerminFormatted} verschoben. Du erhältst zusätzlich eine Bestätigung per E-Mail.`,

      chatbot_not_available_message:
        'Diese Uhrzeit ist leider nicht verfügbar. Bitte wähle eine andere Uhrzeit.',
    },
  },
];
```

---

## Node: FreeBusy Check (TrigaS-termin-verschieben-auto)

Replaces `Get many events1`. Always returns a JSON response — no empty-item problem.

Position in workflow: after `Code in JavaScript5`, before `Code in JavaScript6`.

| Field | Value |
|---|---|
| **Node type** | HTTP Request |
| **Method** | POST |
| **URL** | `https://www.googleapis.com/calendar/v3/freeBusy` |
| **Authentication** | Predefined Credential Type → **Google Calendar OAuth2 API** |
| **Credential** | *(select the same credential used by your Google Calendar nodes)* |
| **Send Body** | ✓ enabled |
| **Body Content Type** | JSON |
| **Specify Body** | Using Fields Below (or JSON editor — see body below) |

**Body (paste into JSON editor):**
```json
{
  "timeMin": "={{ $('Code in JavaScript5').first().json.availability_check_start_rfc3339 }}",
  "timeMax": "={{ $('Code in JavaScript5').first().json.availability_check_end_rfc3339 }}",
  "timeZone": "Europe/Berlin",
  "items": [
    {
      "id": "info@afa-ai.com"
    }
  ]
}
```

> **Note:** If `Code in JavaScript5` outputs `new_start_rfc3339` / `new_end_rfc3339` instead of `availability_check_start_rfc3339` / `availability_check_end_rfc3339`, either rename the fields in the body above or add these aliases to `Code in JavaScript5`'s return object:
> ```
> availability_check_start_rfc3339: new_start_rfc3339,
> availability_check_end_rfc3339:   new_end_rfc3339,
> ```

**FreeBusy response shape:**
```json
{
  "kind": "calendar#freeBusy",
  "timeMin": "...",
  "timeMax": "...",
  "calendars": {
    "info@afa-ai.com": {
      "busy": []          // empty = slot is free
    }
  }
}
```
`busy: []` = slot free → `success: true`.  `busy: [{start, end}]` = conflict → `success: false`.

---

## Node: Code in JavaScript6 (TrigaS-termin-verschieben-auto)

Position in workflow: after `FreeBusy Check`, before `If1`.

**Paste this complete code into the Code in JavaScript6 node (replaces old Get many events1 loop with FreeBusy check):**

```javascript
const prepared = $('Code in JavaScript5').first().json || {};

// ── Read old appointment from upstream Sheets data ─────────────────────────────
const sheetRow = (() => {
  let d;
  try { d = $('Edit Fields Verschieben').first().json; if (d?.['Termin-Datum'] || d?.termin_datum) return d; } catch(_) {}
  return prepared;
})();

// ── Date formatter → "DD.MM.YYYY, HH:MM Uhr" ──────────────────────────────────
function formatTermin(dateStr, timeStr) {
  if (!dateStr) return null;
  const s = String(dateStr);
  let day, mon, yr, hh = '00', mm = '00';
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (iso) {
    yr = iso[1]; mon = iso[2]; day = iso[3];
    if (iso[4]) { hh = iso[4]; mm = iso[5]; }
  } else {
    const de = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (de) { day = de[1].padStart(2,'0'); mon = de[2].padStart(2,'0'); yr = de[3]; }
  }
  if (!day) return null;
  if (timeStr) {
    const tm = String(timeStr).match(/(\d{1,2}):(\d{2})/);
    if (tm) { hh = tm[1].padStart(2,'0'); mm = tm[2]; }
  }
  return `${day}.${mon}.${yr}, ${hh}:${mm} Uhr`;
}

// ── Old appointment (Sheets columns) ──────────────────────────────────────────
const old_date = sheetRow['Termin-Datum']   || sheetRow.termin_datum   || prepared.old_date || '';
const old_time = sheetRow['Termin-Uhrzeit'] || sheetRow.termin_uhrzeit || prepared.old_time || '';

// ── New appointment ────────────────────────────────────────────────────────────
const newDatetime = prepared.new_datetime || prepared.newDatetime || '';
const new_date    = prepared.new_date || prepared.newDate || newDatetime;
const new_time    = prepared.new_time || prepared.newTime || '';

// ── Early exit when Code in JavaScript5 already rejected the request ──────────
if (!prepared.success) {
  return [{ json: prepared }];
}

// ── FreeBusy availability check (replaces Get many events1 loop) ───────────────
const freeBusy     = $('FreeBusy Check').first().json || {};
const calendars    = freeBusy.calendars || {};
const calendarData = calendars['info@afa-ai.com'] || Object.values(calendars)[0] || {};
const busy         = Array.isArray(calendarData.busy) ? calendarData.busy : [];
const slotTaken    = busy.length > 0;

if (slotTaken) {
  return [
    {
      json: {
        ...prepared,
        success: false,
        available: false,
        error: 'not_available',
        conflict_count: busy.length,
        conflicts: busy,
        message: 'Diese Uhrzeit ist leider nicht verfügbar. Bitte wähle eine andere Uhrzeit.',
        chatbot_message: 'Diese Uhrzeit ist leider nicht verfügbar. Bitte wähle eine andere Uhrzeit.',
      },
    },
  ];
}

// ── Build output (slot is free) ────────────────────────────────────────────────
const name =
  prepared.name ||
  `${prepared.vorname || ''} ${prepared.nachname || ''}`.trim() ||
  'Kunde';

const interesse =
  prepared.interesse ||
  'Beratung';

const oldTermin =
  formatTermin(old_date, old_time) ||
  prepared.old_termin_formatted ||
  'Nicht angegeben';

const newTermin =
  formatTermin(new_date, new_time) ||
  prepared.new_termin_formatted ||
  'Nicht angegeben';

const newStartSheet =
  String(prepared.new_start_local || '').replace('T', ' ');

const newEndSheet =
  String(prepared.new_end_local || '').replace('T', ' ');

const calendarSummary =
  `AFA Beratung – ${interesse} – ${name}`;

const calendarDescription =
`Neuer Termin über den AFA Website Chatbot verschoben

━━━━━━━━━━━━━━━━━━━━
KUNDENDATEN
━━━━━━━━━━━━━━━━━━━━

Name: ${name}
E-Mail: ${prepared.email || ''}
Telefon: ${prepared.telefon || ''}
Unternehmen: ${prepared.unternehmen || ''}

━━━━━━━━━━━━━━━━━━━━
TERMIN
━━━━━━━━━━━━━━━━━━━━

Interesse: ${interesse}
Alter Termin: ${oldTermin}
Neuer Termin: ${newTermin}
Format: Google Meet

━━━━━━━━━━━━━━━━━━━━
SYSTEM
━━━━━━━━━━━━━━━━━━━━

Status: Termin verschoben
Quelle: ${prepared.source || 'Website Chatbot'}
`;

return [
  {
    json: {
      ...prepared,

      success: true,
      available: true,
      error: null,

      name,
      interesse,

      email: prepared.email || '',
      vorname: prepared.vorname || '',
      nachname: prepared.nachname || '',
      telefon: prepared.telefon || '',
      unternehmen: prepared.unternehmen || '',

      old_termin_formatted: oldTermin,
      new_termin_formatted: newTermin,
      old_date,
      old_time,
      new_date,
      new_time,

      new_start_sheet: newStartSheet,
      new_end_sheet: newEndSheet,

      calendar_summary: calendarSummary,
      calendar_description: calendarDescription,

      status_update: 'Termin verschoben',

      message: prepared.chatbot_success_message,
      chatbot_message: prepared.chatbot_success_message,
    },
  },
];
```

---

## Node: If1 (TrigaS-termin-verschieben-auto)

Routes on `success` from `Code in JavaScript6`. True → update + emails. False → error response.

| Field | Value |
|---|---|
| **Condition left** | `{{ $json.success }}` |
| **Operation** | Equal |
| **Condition right** | `true` — type must be **Boolean**, not String |
| **True branch** | → `Update an event` → `Update row in sheet4` → `Send message5` → `Respond to Webhook5` |
| **False branch** | → `Respond to Webhook5` |

**Respond to Webhook5 on the false path** — Response Body:
```
{{ $json.chatbot_message || 'Diese Uhrzeit ist leider nicht verfügbar. Bitte wähle eine andere Uhrzeit.' }}
```

---

## Node: Send message5 — Termin verschoben Kunde (TrigaS-termin-verschieben-auto)

**Data source: `Code in JavaScript6` — NOT `Edit Fields3`, NOT `leadId`.**
This branch never executes `Edit Fields3`. Referencing it causes: *Node "Edit Fields3" hasn't been executed*.

| Field | Value |
|---|---|
| **To** | `{{ $('Code in JavaScript6').first().json.email }}` |
| **Subject** | `Ihr TRIGA-S Termin wurde verschoben` |
| **Message** | *(paste full content of `trigas_termin_verschoben_kunde_n8n.html`)* |
| **Message type** | HTML |

Fields used (all from `$('Code in JavaScript6').first().json`):
- `vorname` / `name` — greeting
- `old_termin_formatted` — old appointment (muted, line-through)
- `new_termin_formatted` — new appointment (bold, highlighted)
- `interesse` — Thema row
- `unternehmen`
- `besprechungslink` — yellow "Google Meet öffnen →" button href
- `notizen` — conditional: HTML-comment-hidden when empty, visible when set

**No raw Google Meet URL, Kalenderlink or Termin-ID visible in email body.**

---

## Node: Intern Termin verschoben (TrigaS-termin-verschieben-auto)

**Data source: `Code in JavaScript6`.**

| Field | Value |
|---|---|
| **To** | `info@afa-ai.com` |
| **Subject** | `TRIGA-S Termin verschoben – {{ $('Code in JavaScript6').first().json.vorname \|\| $('Code in JavaScript6').first().json.name \|\| '' }} → {{ $('Code in JavaScript6').first().json.new_termin_formatted \|\| '' }}` |
| **Message** | *(paste full content of `trigas_termin_verschoben_intern_n8n.html`)* |
| **Message type** | HTML |

Fields used (all from `$('Code in JavaScript6').first().json`):
- `vorname` / `name`, `nachname`, `email`, `telefon`, `unternehmen`
- `old_termin_formatted`, `new_termin_formatted`, `interesse`, `status_update`, `changed_at`
- `besprechungslink` — yellow "Google Meet öffnen →" button
- `notizen` — "Keine Notizen" fallback

---

## Node: Termin Bestätigung Kunde (Termine-Workflow)

This node sends the appointment confirmation email to the customer after a booking is made.
**Data source: `Edit Fields3` — NOT `leadId`.**
`leadId` is never executed in the booking/Termine branch and must not be referenced.

| Field | Value |
|---|---|
| **To** | `{{ $node["Edit Fields3"].json.email \|\| '' }}` |
| **Subject** | `Ihre Projektberatung mit TRIGA-S wurde bestätigt` |
| **Message** | *(paste full content of `trigas_termin_bestaetigung_kunde_n8n.html`)* |
| **Message type** | HTML |

Key fields rendered in this email (all from `$node["Edit Fields3"].json`):
- `vorname`, `nachname` — greeting
- `terminDatumZeit` — formatted as "Dienstag, 30.06.2026 um 08:00 Uhr"
- `interesse` — shown as "Thema"
- `unternehmen`
- `meeting_link` / `hangoutLink` — yellow "Google Meet öffnen →" button
- `notizen` — shown only if not empty

**No raw Google Meet URLs, Calendar links or Termin-IDs are visible in this email.**

---

## Node: Termin Bestätigung Intern (Termine-Workflow)

This node sends the internal appointment notification to `info@afa-ai.com`.
**Data source: `Edit Fields3` — NOT `leadId`.**

| Field | Value |
|---|---|
| **To** | `info@afa-ai.com` |
| **Subject** | `TRIGA-S Neuer Termin – {{ $node["Edit Fields3"].json.vorname \|\| '' }} {{ $node["Edit Fields3"].json.nachname \|\| '' }} ({{ $node["Edit Fields3"].json.terminDatumZeit \|\| '' }})` |
| **Message** | *(paste full content of `trigas_termin_bestaetigung_intern_n8n.html`)* |
| **Message type** | HTML |

Key fields rendered in this email (all from `$node["Edit Fields3"].json`):
- Kontakt: `vorname`, `nachname`, `email`, `telefon`, `unternehmen`
- Termin: `interesse`, `terminDatumZeit` (formatted German), `status`, `quelle`
- `meeting_link` / `hangoutLink` — yellow "Google Meet öffnen →" button
- `notizen` — shown with "Keine Notizen" fallback if empty

**Raw Google Meet URL, Kalenderlink and Termin-ID are intentionally NOT shown in the email body.**
They exist in Google Sheets / Edit Fields3 data but must not appear in the visible email.

---

## CRITICAL: Edit Fields3 — terminDatumZeit Datetime Fix

### Root cause of "00:00 Uhr" in emails

The chatbot sends these fields to the booking webhook:

| Field | Example value |
|---|---|
| `terminDatumZeit` | `"2026-07-03T10:00:00+02:00"` (full RFC3339 with Berlin offset) |
| `terminDatum` | `"2026-07-03"` (date only) |
| `terminUhrzeit` | `"10:00"` (time only) |
| `appointment_date` | `"2026-07-03"` |
| `appointment_time` | `"10:00"` |

If the **Edit Fields3** node maps `terminDatumZeit` from `terminDatum` (date-only) instead of `terminDatumZeit` (full RFC), then `new Date("2026-07-03")` in any JavaScript expression is interpreted as **midnight UTC** → `getHours()` = 0 → "00:00 Uhr".

### What the email templates now do

All five booking/reminder email templates (`trigas_termin_bestaetigung_kunde`, `_intern`, `trigas_termin_erinnerung_24h_kunde`, `_intern`, `trigas_termin_erinnerung_1h_intern`) now use a **timezone-safe IIFE** that:

1. Reads both `terminDatumZeit` AND `terminUhrzeit` from Edit Fields3
2. If `terminDatumZeit` is a full RFC3339 string with `T` (e.g. `2026-07-03T10:00:00+02:00`): uses `Intl.DateTimeFormat` with `timeZone: 'Europe/Berlin'` → always shows correct Berlin time
3. If `terminDatumZeit` is date-only (e.g. `2026-07-03`): falls back to combining date + `terminUhrzeit` → shows correct time from the separate field
4. Never calls `d.getHours()` or `d.getMinutes()` (which return UTC on n8n cloud)

### What Edit Fields3 must map

For the email templates to work correctly, ensure Edit Fields3 includes these mappings:

| Edit Fields3 field | Source field from webhook body |
|---|---|
| `terminDatumZeit` | `{{ $json.body.terminDatumZeit }}` — the full RFC3339 field (preferred) |
| `terminUhrzeit` | `{{ $json.body.terminUhrzeit \|\| $json.body.appointment_time \|\| '' }}` |
| `terminDatum` | `{{ $json.body.terminDatum \|\| $json.body.appointment_date \|\| '' }}` |

If `terminDatumZeit` in Edit Fields3 is already the full RFC3339 string (e.g. `2026-07-03T10:00:00+02:00`), the `Intl.DateTimeFormat` path handles it correctly and `terminUhrzeit` is used as a fallback only.

---

## Node Name Reference

| n8n Node Name | Purpose |
|---|---|
| `TrigaS-ChatBot-Lead` | Webhook — receives incoming chatbot form submissions |
| `leadId` | Set/Edit Fields — captures and stores all lead data for downstream nodes |
| `TRIGA-S Lead Intern` | Send Email — internal notification to `info@afa-ai.com` |
| `Anfrage Bestätigung Kunde` | Send Email — customer confirmation (runs AFTER TRIGA-S Lead Intern) |
| `Edit Fields3` | Set/Edit Fields — data source for ALL Termine/booking branch emails |
| `Termin Bestätigung Kunde` | Send Email — customer appointment confirmation (Termine branch) |
| `Termin Bestätigung Intern` | Send Email — internal appointment notification (Termine branch) |

---

## Why `$json` Fails in "Anfrage Bestätigung Kunde"

n8n nodes only expose **their own output** as `$json`. When a Send Email (Gmail) node runs, `$json` becomes the Gmail API response object (containing `id`, `threadId`, `labelIds`, etc.) — the original webhook payload is gone from `$json`.

To access data from any earlier node, reference it by node name:

```js
$('leadId').first().json.email          // from Set node output
$('leadId').first().json.body?.email    // if Set node preserved nested body
$('TrigaS-ChatBot-Lead').first().json.body?.email  // directly from webhook
```

The `leadId` Set node was designed as the single source of truth — all downstream nodes should read from it, not from `$json`.
