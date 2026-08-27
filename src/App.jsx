import { useState, useEffect, useMemo } from 'react'
import OpportunityList from './components/OpportunityList'
import ReviewDetailPanel from './components/ReviewDetailPanel'
import ScheduleDayPanel from './components/ScheduleDayPanel'
import {
  toISODate,
  todayDate,
  parseDateOnly,
  monthStartDate,
  addMonths,
  DAILY_SCHEDULE_TARGET,
  DEFAULT_SCHEDULE_TIME,
  buildScheduleCounts,
  buildCalendarMonths,
  publishedDayKey,
  combineLondonDateAndTime
} from './calendarUtils'
import { computeHealth } from './opportunityHealth'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const PAGES = ['Scouted', 'Schedule']
// The admin portal actually lives at the .co domain, not .com (.com is a different site — it
// serves the marketing homepage fine but 404s on every /content/* route, including this one).
const REAL_PORTAL_BASE_URL = 'https://meet-eric.co'
const REAL_PORTAL_CONTENT_URL = `${REAL_PORTAL_BASE_URL}/content/list`

// Mirrors transformData()'s type resolution (api-server.cjs) — Events are a separate top-level
// content type on the real portal, everything else is "announcements". Only used as a fallback
// for publishLog entries written before contentTypeSegment was stored directly.
function resolveContentTypeSegment(opportunityType) {
  return opportunityType === 'Event' ? 'events' : 'announcements'
}

function buildRealPortalEditUrl(entry) {
  if (!entry?.masterPortalDocId) return null
  const segment = entry.contentTypeSegment || resolveContentTypeSegment(entry.opportunityType)
  return `${REAL_PORTAL_BASE_URL}/content/edit/${segment}/${entry.masterPortalDocId}`
}

function dayDiff(a, b) {
  const ms = 1000 * 60 * 60 * 24
  return Math.round((a.getTime() - b.getTime()) / ms)
}

function scheduleRule(deadlineRaw) {
  const today = todayDate()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const deadline = parseDateOnly(deadlineRaw)

  if (!deadline) {
    return {
      kind: 'free',
      minDate: toISODate(today),
      maxDate: '',
      note: 'No deadline found, schedule date is flexible.'
    }
  }

  const diff = dayDiff(deadline, today)
  if (diff <= 0) {
    return {
      kind: 'today-only',
      minDate: toISODate(today),
      maxDate: toISODate(today),
      note: 'Deadline is today or overdue, schedule must be today.'
    }
  }

  if (diff === 1) {
    return {
      kind: 'today-or-tomorrow',
      minDate: toISODate(today),
      maxDate: toISODate(tomorrow),
      note: 'Deadline is tomorrow, schedule must be today or tomorrow.'
    }
  }

  return {
    kind: 'free',
    minDate: toISODate(today),
    maxDate: '',
    note: 'Deadline is beyond tomorrow, schedule date is flexible.'
  }
}

// Groups the Scouted queue by how soon it needs attention — an unparseable/missing deadline
// is treated as urgent rather than flexible, since "unclear" needs a human look, not a default.
function urgencyBucket(deadlineRaw) {
  const deadline = parseDateOnly(deadlineRaw)
  if (!deadline) return 'urgent'
  const diff = dayDiff(deadline, todayDate())
  if (diff <= 3) return 'urgent'
  if (diff <= 14) return 'soon'
  return 'later'
}

const URGENCY_SECTIONS = [
  { key: 'urgent', label: 'Urgent' },
  { key: 'soon', label: 'Within 2 weeks' },
  { key: 'later', label: 'Months of time' }
]

async function loadScheduledMap() {
  try {
    const res = await fetch(`${API_BASE}/schedule-state`)
    if (!res.ok) return {}
    const data = await res.json()
    return data.scheduleState && typeof data.scheduleState === 'object' ? data.scheduleState : {}
  } catch {
    return {}
  }
}

async function saveScheduledMap(map) {
  try {
    await fetch(`${API_BASE}/schedule-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleState: map })
    })
  } catch {
    // Best-effort — the opportunities state already reflects the change locally either way.
  }
}

function computeSuggestedScheduleDate(opportunity, allRows, publishedEntries = []) {
  const today = todayDate()
  const counts = buildScheduleCounts(allRows, publishedEntries)
  const rule = scheduleRule(opportunity.applicationDeadline)

  if (rule.kind === 'today-only') {
    return rule.minDate
  }

  if (rule.kind === 'today-or-tomorrow') {
    const dayA = rule.minDate
    const dayB = rule.maxDate
    const scoreA = counts[dayA]?.total || 0
    const scoreB = counts[dayB]?.total || 0
    return scoreA <= scoreB ? dayA : dayB
  }

  const deadline = parseDateOnly(opportunity.applicationDeadline)
  const start = new Date(today)
  const end = deadline && dayDiff(deadline, today) > 1
    ? deadline
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)

  // Fill near-term days up to the daily target before spreading further out — a distant
  // deadline shouldn't mean the next week goes unscheduled just because some day months away
  // happens to be emptier. Only once every day in range is already at/above target do we fall
  // back to picking whichever day is least loaded. Counts total (scheduled + already sent) so
  // this doesn't happily pile more onto a day that's already published a full day's worth.
  let cursor = new Date(start)
  let bestDate = toISODate(start)
  let bestScore = Number.POSITIVE_INFINITY

  while (cursor <= end) {
    const key = toISODate(cursor)
    const load = counts[key]?.total || 0
    if (load < DAILY_SCHEDULE_TARGET) {
      return key
    }
    const distance = dayDiff(cursor, today)
    const score = load * 100 + distance
    if (score < bestScore) {
      bestScore = score
      bestDate = key
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return bestDate
}

function validateScheduleDate(deadlineRaw, scheduleRaw) {
  if (!scheduleRaw) {
    return { ok: true, message: '' }
  }

  const rule = scheduleRule(deadlineRaw)
  if (rule.kind === 'free') return { ok: true, message: '' }
  if (rule.kind === 'today-only' && scheduleRaw !== rule.minDate) {
    return { ok: false, message: 'Deadline is today. Schedule date must be today.' }
  }
  if (rule.kind === 'today-or-tomorrow') {
    if (scheduleRaw !== rule.minDate && scheduleRaw !== rule.maxDate) {
      return { ok: false, message: 'Deadline is tomorrow. Schedule date must be today or tomorrow.' }
    }
  }
  return { ok: true, message: '' }
}

function searchMatch(opp, term) {
  if (!term) return true
  const haystack = [
    opp.title,
    opp.opportunityType,
    opp.draftedContent,
    opp.location,
    opp.salary,
    opp.link
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(term.toLowerCase())
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string') return []
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

function toBool(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'yes' || normalized === 'true' || normalized === '1'
  }
  return Boolean(value)
}

function parseDemographicsBlock(raw) {
  const result = {
    age: [],
    genderSexualPreference: [],
    ethnicity: [],
    disability: [],
    lowerSocioEconomicBackground: []
  }
  if (!raw || typeof raw !== 'string') return result
  const lines = raw.split('\n').map(line => line.trim()).filter(Boolean)
  for (const line of lines) {
    const [k, ...rest] = line.split(':')
    if (!k || rest.length === 0) continue
    const key = k.trim().toLowerCase()
    const val = rest.join(':').trim()
    if (key === 'age') result.age = toArray(val)
    if (key === 'gender' || key === 'gender & sexual preference') result.genderSexualPreference = toArray(val)
    if (key === 'ethnicity') result.ethnicity = toArray(val)
    if (key === 'disability') result.disability = toArray(val)
    if (key === 'economic background' || key === 'lower socio economic background') {
      result.lowerSocioEconomicBackground = toArray(val)
    }
  }
  return result
}

function normalizeDateForBackend(raw) {
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(raw)) return raw
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T00:00:00.000Z`
  const dmyMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmyMatch) {
    const dd = String(Number(dmyMatch[1])).padStart(2, '0')
    const mm = String(Number(dmyMatch[2])).padStart(2, '0')
    const yyyy = dmyMatch[3]
    return `${yyyy}-${mm}-${dd}T00:00:00.000Z`
  }
  // Falls back to parseDateOnly() (not a bare `new Date(raw)`) specifically so a year-less
  // scrape like "19 Aug" doesn't get sent to the real portal as literally 2001 — this is the
  // function that actually determines what applicationDeadline/eventDate/publishDate the live
  // opportunity gets, so getting the year right here matters more than anywhere else it's parsed.
  const parsed = parseDateOnly(raw)
  if (!parsed) return ''
  return `${toISODate(parsed)}T00:00:00.000Z`
}

function buildPublishPayload(opp) {
  const fallbackDemo = parseDemographicsBlock(opp.demographics)
  const currentDemo = opp.demographic || {}
  return {
    ...opp,
    companyID: opp.companyID || opp.companyId || '',
    applicationDeadline: normalizeDateForBackend(opp.applicationDeadline),
    // transformData() reads publishedAt, not publishDate — keep both so nothing downstream breaks.
    publishDate: normalizeDateForBackend(opp.publishDate),
    publishedAt: normalizeDateForBackend(opp.publishDate),
    // transformData() reads description, not draftedContent — the copywriter's edited text lives in draftedContent.
    description: opp.draftedContent || opp.description || '',
    schedulePost: opp.schedulePost || '',
    scheduleTime: opp.scheduleTime || '',
    remote: toBool(opp.remote),
    ukWide: toBool(opp.ukWide),
    // Live-sampled a confirmed-searchable real opportunity (one the user manually resaved
    // through the real portal's own admin form) and found its status was "published", not
    // "live" — the value this pipeline had been setting. "live" isn't in the real portal's own
    // status vocabulary at all; content search-visible in the consumer app is "published".
    status: 'published',
    // A one-off event's date and its application deadline are almost always the same day —
    // fall back to the deadline whenever extraction didn't land a separate event date, rather
    // than publishing a blank eventDate/eventTime (which threw "Invalid time value" on the
    // consumer app when it tried to format an empty date).
    eventDate: normalizeDateForBackend(opp.eventDate || opp.applicationDeadline),
    eventName: opp.title || '',
    eventTime: combineLondonDateAndTime(opp.eventDate || opp.applicationDeadline, opp.eventStartTime),
    eventTimeEnd: combineLondonDateAndTime(opp.eventDate || opp.applicationDeadline, opp.eventEndTime),
    demographic: {
      age: currentDemo.age || fallbackDemo.age,
      genderSexualPreference: currentDemo.genderSexualPreference || fallbackDemo.genderSexualPreference,
      ethnicity: currentDemo.ethnicity || fallbackDemo.ethnicity,
      disability: currentDemo.disability || fallbackDemo.disability,
      lowerSocioEconomicBackground: currentDemo.lowerSocioEconomicBackground || fallbackDemo.lowerSocioEconomicBackground,
      // industryTags is what the editor's Industry tag picker actually writes to.
      industry: (opp.industryTags && opp.industryTags.length ? opp.industryTags : null) || currentDemo.industry || toArray(opp.industry)
    }
  }
}

function isDescriptionUsable(description) {
  if (!description) return false
  const trimmed = description.trim()
  if (trimmed.length < 20) return false
  // Claude's extraction prompt writes "Unclear" when it can't determine a real description —
  // correct behaviour for it, but never something that should reach a real user as-is.
  if (/unclear/i.test(trimmed)) return false
  return true
}

function validatePublishPayload(opp) {
  const errors = []
  if (!opp.title) errors.push('Title is required.')
  if (!opp.opportunityType) errors.push('Opportunity type is required.')
  if (!opp.applicationDeadline) errors.push('Application deadline is missing or invalid.')
  if (!isDescriptionUsable(opp.description)) {
    errors.push('Description looks incomplete or unclear — write a proper summary before publishing.')
  }
  return errors
}

function App() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  // Each entry: { id, message, rowIndex, timestamp }. rowIndex lets the Errors page jump
  // straight to the opportunity a failure was about, instead of leaving you to guess.
  const [errorLog, setErrorLog] = useState([])
  const [toast, setToast] = useState(null)
  const [publishLog, setPublishLog] = useState([])
  const [editing, setEditing] = useState(null)
  const [page, setPage] = useState('Scouted')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [calendarStart, setCalendarStart] = useState(() => {
    const now = todayDate()
    return toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
  })
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('')

  const pushError = (message, rowIndex = null) => {
    setErrorLog(prev => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, rowIndex, timestamp: new Date().toISOString() }, ...prev])
  }
  const dismissError = id => {
    setErrorLog(prev => prev.filter(e => e.id !== id))
  }
  const showToast = message => {
    setToast({ id: Date.now(), message })
  }

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  // Fetched on mount now, not gated to a Log tab — the Schedule tab needs it for every day's
  // "sent" section and density, not just a dedicated history page. limit=1000 covers a full
  // 12-month calendar view; the default 200 was only ever enough for a short recent list.
  const fetchPublishLog = async () => {
    try {
      const res = await fetch(`${API_BASE}/publish-log?limit=1000`)
      const data = res.ok ? await res.json() : { entries: [] }
      setPublishLog(data.entries || [])
    } catch {
      setPublishLog([])
    }
  }

  useEffect(() => {
    fetchPublishLog()
  }, [])

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/queue-review`)
      if (!res.ok) throw new Error('Failed to fetch opportunities')
      const data = await res.json()
      const rows = data.opportunities || []
      const scheduledMap = await loadScheduledMap()
      const hydrated = rows.map(row => {
        const localScheduled = scheduledMap[row.rowIndex]
        if (!localScheduled) return row
        // errorNotes is written directly to the sheet by the scheduler, independent of
        // anything the review app does — a stale cached copy from whenever this schedule
        // entry was last saved would otherwise silently hide a fresh scheduler error (or a
        // fresh error clearing) behind whatever errorNotes looked like back then.
        return { ...row, ...localScheduled, errorNotes: row.errorNotes || '' }
      })
      setOpportunities(hydrated)
    } catch (err) {
      pushError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Returns { ok } so callers (auto-publish, "Publish now") know whether a schedule-state
  // entry should actually be cleared — a failed publish must not look like a successful one.
  const handlePublish = async (rowIndex, editedOpp) => {
    try {
      const payload = buildPublishPayload(editedOpp)
      const errors = validatePublishPayload(payload)
      if (errors.length > 0) {
        pushError(errors.join(' '), rowIndex)
        return { ok: false, message: errors.join(' ') }
      }

      const res = await fetch(`${API_BASE}/update-queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex, editedOpportunity: payload })
      })
      if (!res.ok) throw new Error('Failed to publish')
      const data = await res.json()
      setOpportunities(prev => {
        const next = prev.filter(o => o.rowIndex !== rowIndex)
        if (editing?.rowIndex === rowIndex) {
          setEditing(null)
        }
        return next
      })
      // The backend's publish-claim guard caught this as a duplicate attempt (e.g. the
      // scheduler already sent it moments earlier) — nothing new went out, so don't claim it did.
      showToast(data.alreadyPublished
        ? `"${payload.title || 'Opportunity'}" was already sent to the real portal.`
        : `"${payload.title || 'Opportunity'}" was sent to the real portal.`)
      fetchPublishLog()
      return { ok: true }
    } catch (err) {
      pushError(err.message, rowIndex)
      return { ok: false, message: err.message }
    }
  }

  const handleSaveDraft = async (rowIndex, updatedFields) => {
    const check = validateScheduleDate(updatedFields.applicationDeadline, updatedFields.schedulePost)
    if (!check.ok) {
      pushError(check.message, rowIndex)
      return { ok: false, message: check.message }
    }

    let scheduleEntry = null

    setOpportunities(prev => {
      const next = prev.map(opp => {
        if (opp.rowIndex !== rowIndex) return opp
        const merged = { ...opp, ...updatedFields }
        if (merged.schedulePost) {
          merged.status = 'scheduled'
          // Same 100%-complete-gets-a-default-time rule as the editor — covers a save that
          // never opened ReviewDetailPanel (e.g. a future bulk-schedule action).
          if (!merged.scheduleTime && computeHealth(merged).percent === 100) {
            merged.scheduleTime = DEFAULT_SCHEDULE_TIME
          }
        }
        return merged
      })

      // Store the full edited opportunity, not just a handful of fields — this is the only
      // place copywriter edits (description, banner, event details, salary, ...) survive a
      // page reload or a different browser/session. A narrower whitelist here previously meant
      // edits only lived in this tab's React state and silently reverted to the raw
      // Claude-drafted content the next time anyone (or the publish-when-due scheduler) loaded
      // this row from scratch.
      const edited = next.find(opp => opp.rowIndex === rowIndex)
      scheduleEntry = edited?.schedulePost ? edited : null

      return next
    })

    const scheduledMap = await loadScheduledMap()
    if (scheduleEntry) {
      scheduledMap[rowIndex] = scheduleEntry
    } else {
      delete scheduledMap[rowIndex]
    }
    await saveScheduledMap(scheduledMap)

    return { ok: true }
  }

  const publishScheduledNow = async opp => {
    const result = await handlePublish(opp.rowIndex, opp)
    if (!result.ok) return
    const scheduledMap = await loadScheduledMap()
    delete scheduledMap[opp.rowIndex]
    await saveScheduledMap(scheduledMap)
  }

  // Removes an opportunity from the review app entirely — never touches the real portal.
  // Distinct from publishing: this is for scrapped/test/duplicate rows that should just go away.
  const handleDelete = async opp => {
    if (!window.confirm(`Delete "${opp.title || 'this opportunity'}"? It won't be sent to the real portal, and this can't be undone from here.`)) {
      return
    }
    try {
      const res = await fetch(`${API_BASE}/delete-queue-row`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: opp.rowIndex })
      })
      if (!res.ok) throw new Error('Failed to delete')
      setOpportunities(prev => prev.filter(o => o.rowIndex !== opp.rowIndex))
      if (editing?.rowIndex === opp.rowIndex) setEditing(null)
    } catch (err) {
      pushError(err.message, opp.rowIndex)
    }
  }

  // Publishing due opportunities is the backend cron's job now, not the browser's — it used to
  // duplicate here: this effect re-fired on every `opportunities` change (including someone
  // just editing something in the Schedule tab) with zero coordination with the backend's own
  // due-check, so a copywriter having the app open right as the cron ticked could publish the
  // same opportunity twice. The backend is now both claim-protected (won't double-publish
  // itself) and idempotency-protected (publishOpportunityToPortal refuses a row that's already
  // been claimed) — this just nudges it to catch up immediately on page load instead of
  // waiting for the next tick, through that same protected path.
  useEffect(() => {
    fetch(`${API_BASE}/process-due-schedules`, { method: 'POST' }).catch(() => {})
  }, [])

  const types = [
    'all',
    ...new Set(opportunities.map(o => o.opportunityType).filter(Boolean))
  ]

  // Only Scouted uses this filtering/pagination path now — Schedule has its own dedicated data
  // flow (scheduledByDate/selectedDayOpps + publishLog), since a calendar day view was never a
  // simple filtered list to begin with.
  const pageFiltered = opportunities.filter(opp => {
    const status = (opp.status || opp.originalStatus || '').toLowerCase()
    return !status || status.includes('scouted') || status.includes('review') || status.includes('ready')
  })

  const filtered = pageFiltered.filter(opp => {
    const matchesType = typeFilter === 'all' || opp.opportunityType === typeFilter
    return matchesType && searchMatch(opp, search)
  })

  const scoutedGroups = useMemo(() => {
    if (page !== 'Scouted') return null
    const groups = { urgent: [], soon: [], later: [] }
    filtered.forEach(opp => {
      groups[urgencyBucket(opp.applicationDeadline)].push(opp)
    })
    return groups
  }, [page, filtered])

  // Most-recent client-side error per row, keyed for O(1) lookup when rendering a card —
  // errorLog is newest-first (pushError prepends), so the first match per rowIndex wins.
  const clientErrorsByRow = useMemo(() => {
    const map = {}
    errorLog.forEach(entry => {
      if (entry.rowIndex && !(entry.rowIndex in map)) map[entry.rowIndex] = entry.message
    })
    return map
  }, [errorLog])

  const withClientError = opp => ({ ...opp, errorMessage: clientErrorsByRow[opp.rowIndex] })

  const calendarMonths = useMemo(() => {
    const start = parseDateOnly(calendarStart) || monthStartDate(todayDate())
    return buildCalendarMonths(opportunities, monthStartDate(start), 12, publishLog)
  }, [opportunities, calendarStart, publishLog])

  const scheduledByDate = useMemo(
    () => opportunities.filter(opp => (opp.status || '').toLowerCase() === 'scheduled' && opp.schedulePost),
    [opportunities]
  )

  // Which scheduled days have at least one item with an error — drives the calendar's red dot,
  // separate from the count/density (an errored item is still "waiting", just stuck).
  const daysWithErrors = useMemo(() => {
    const set = new Set()
    scheduledByDate.forEach(opp => {
      if (opp.errorNotes || clientErrorsByRow[opp.rowIndex]) set.add(opp.schedulePost)
    })
    return set
  }, [scheduledByDate, clientErrorsByRow])

  const selectedDayOpps = useMemo(() => {
    if (!selectedCalendarDate) return []
    return scheduledByDate.filter(opp => opp.schedulePost === selectedCalendarDate)
  }, [scheduledByDate, selectedCalendarDate])

  const selectedDaySentEntries = useMemo(() => {
    if (!selectedCalendarDate) return []
    return publishLog.filter(entry => publishedDayKey(entry) === selectedCalendarDate)
  }, [publishLog, selectedCalendarDate])

  const jumpCalendar = months => {
    const start = parseDateOnly(calendarStart) || monthStartDate(todayDate())
    setCalendarStart(toISODate(addMonths(start, months)))
  }
  const editingSuggestion = useMemo(() => {
    if (!editing) return ''
    if (editing.schedulePost) return editing.schedulePost
    return computeSuggestedScheduleDate(editing, opportunities, publishLog)
  }, [editing, opportunities, publishLog])
  const editingRule = useMemo(() => scheduleRule(editing?.applicationDeadline), [editing])

  return (
    <div className="portal-shell">
      <main className="portal-content-wrap portal-content-only">
        <section className="portal-content review-feed">
          <header className="review-top-row">
            <div className="page-tabs">
              {PAGES.map(label => (
                <button
                  key={label}
                  className={`page-tab ${page === label ? 'is-active' : ''}`}
                  onClick={() => setPage(label)}
                >
                  {label}
                </button>
              ))}
            </div>

            {page === 'Scouted' && (
              <div className="filter-row compact">
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by type">
                  {types.map(type => (
                    <option key={type} value={type}>{type === 'all' ? 'Content type' : type}</option>
                  ))}
                </select>
                <div className="search-wrap">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search...."
                    aria-label="Search opportunities"
                  />
                  <button className="search-button" aria-label="Search">⌕</button>
                </div>
              </div>
            )}
          </header>

          {page === 'Scouted' ? (
            <div className="queue-count">{filtered.length} in scouted</div>
          ) : (
            <div className="queue-count">{scheduledByDate.length} waiting to send</div>
          )}

          {errorLog.length > 0 && (
            <div className="error dismissible">
              <span>{errorLog[0].message}</span>
              <button className="dismiss-error" onClick={() => dismissError(errorLog[0].id)} aria-label="Dismiss">×</button>
            </div>
          )}

          {loading ? (
            <div className="loading spinner-wrap" role="status" aria-live="polite">
              <span className="spinner" />
            </div>
          ) : page === 'Scouted' ? (
            filtered.length === 0 ? (
              <div className="empty">No opportunities in scouted.</div>
            ) : (
              <>
                {URGENCY_SECTIONS.map(section => {
                  const items = scoutedGroups[section.key]
                  if (items.length === 0) return null
                  return (
                    <section key={section.key} className="urgency-section">
                      <h3 className={`urgency-heading urgency-${section.key}`}>
                        {section.label} <span className="urgency-count">({items.length})</span>
                      </h3>
                      <OpportunityList
                        opportunities={items.map(withClientError)}
                        onEdit={opp => setEditing(opp)}
                        onApprove={opp => handlePublish(opp.rowIndex, opp)}
                        onDelete={handleDelete}
                        primaryLabel="Approve"
                      />
                    </section>
                  )
                })}
              </>
            )
          ) : null}

          {page === 'Schedule' && (
            <section className="schedule-calendar">
              <div className="calendar-toolbar">
                <div className="calendar-header">Schedule Calendar: 12 month view</div>
                <div className="calendar-nav">
                  <button className="show-more" onClick={() => jumpCalendar(-12)}>Previous 12</button>
                  <button className="show-more" onClick={() => jumpCalendar(12)}>Next 12</button>
                </div>
              </div>

              <div className="calendar-months-grid">
                {calendarMonths.map(month => (
                  <article key={month.key} className="calendar-month-card">
                    <div className="month-label">{month.monthLabel}</div>
                    <div className="calendar-grid">
                      {month.cells.map(cell =>
                        cell.empty ? (
                          <div key={cell.key} className="calendar-cell empty" />
                        ) : (
                          <button
                            key={cell.key}
                            className={`calendar-cell ${cell.density} ${selectedCalendarDate === cell.key ? 'selected' : ''}`}
                            onClick={() => setSelectedCalendarDate(cell.key)}
                          >
                            {daysWithErrors.has(cell.key) && <span className="calendar-error-dot" aria-label="Has an error" />}
                            <span className="calendar-day">{cell.day}</span>
                            <span className="calendar-count">{cell.count}</span>
                            {cell.sentCount > 0 && <span className="calendar-sent-count">✓ {cell.sentCount}</span>}
                          </button>
                        )
                      )}
                    </div>
                  </article>
                ))}
              </div>

              <div className="calendar-legend">
                <span><i className="dot low" /> below 20</span>
                <span><i className="dot mid" /> 20 to 29</span>
                <span><i className="dot high" /> 30 and above</span>
                <span><i className="dot error" /> has an error</span>
              </div>

              <ScheduleDayPanel
                selectedDate={selectedCalendarDate}
                waitingOpps={selectedDayOpps.map(withClientError)}
                sentEntries={selectedDaySentEntries}
                onEdit={opp => setEditing(opp)}
                onApprove={opp => publishScheduledNow(opp)}
                onDelete={handleDelete}
                getRealPortalUrl={buildRealPortalEditUrl}
              />
            </section>
          )}
        </section>
      </main>

      {editing && (
        <ReviewDetailPanel
          opportunity={editing}
          allOpportunities={opportunities}
          onSaveDraft={handleSaveDraft}
          suggestedScheduleDate={editingSuggestion}
          scheduleRuleInfo={editingRule}
          onClose={() => setEditing(null)}
        />
      )}

      {toast && (
        <div className="publish-toast" role="status">
          <span>{toast.message}</span>
          <a href={REAL_PORTAL_CONTENT_URL} target="_blank" rel="noreferrer">Review on real portal →</a>
          <button className="dismiss-error" onClick={() => setToast(null)} aria-label="Dismiss">×</button>
        </div>
      )}
    </div>
  )
}

export default App
