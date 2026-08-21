import { useEffect, useMemo, useState } from 'react'
import ScheduleDatePicker from './ScheduleDatePicker'
import ImageBankPicker from './ImageBankPicker'
import { parseDateOnly, toISODate, normalizeTimeInput } from '../calendarUtils'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const CATEGORIES = [
  'Apprenticeship',
  'Course',
  'Internship',
  'Junior full-time role',
  'Junior part-time role',
  'Freelance role',
  'Work experience',
  'Training scheme',
  'Event',
  'Competition/Grant',
  'Mentoring',
  'Runner role',
  'Opportunity'
]

const DEMOGRAPHICS = {
  age: ['16', '17', '18', '19', '20', '21', '22', '23', '24', '25', 'Over 18', 'Under 18', 'Over 25', '16 and under', 'All ages'],
  genderSexualPreference: ['He/Him', 'She/Her', 'They/Them', 'LGBTQIA+', 'All genders & preferences'],
  ethnicity: ['African Caribbean or Black British', 'Arab', 'Asian or Asian British', 'Mixed or Multiple Ethnic Group', 'Other Ethnic Group', 'White or White British', 'All ethnicities'],
  disability: ['Physical disability', 'Mental health', 'Neurodiversity', 'Chronic illness', 'All disability'],
  lowerSocioEconomicBackground: ['Only those from lower socio-economic background', 'All backgrounds']
}

const INDUSTRY_TAGS = [
  'all creative industries', 'acting', 'advertising', 'animation', 'architecture', 'arts', 'audio', 'comedy',
  'content creation', 'craft', 'culture', 'dance', 'design', 'digital', 'directing', 'e-sport', 'fashion', 'film',
  'gaming', 'graphic design', 'heritage', 'journalism', 'marketing', 'media', 'museum', 'music', 'performing arts',
  'photography', 'podcasting', 'PR', 'presenting', 'publishing', 'radio', 'social media', 'theatre', 'TV',
  'UX/UI design', 'VFX', 'videography', 'visual art', 'writing'
]

// The real portal truncates/rejects titles past this length.
const TITLE_MAX_LENGTH = 50

const POPULAR_KEYWORDS = ['Advice', "CV's & Portfolios", 'Money & Finance', 'Interviews', 'Networking', 'Mentoring']
const PARTNERS = ['UK Creative Festival']
const SECTIONS = ['Industry', 'Demographic', 'Keywords', 'Audience location', 'Partner affiliation']

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {
      // Fall back to comma-separated parsing.
    }
    return trimmed
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

function toBool(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'yes' || normalized === 'true' || normalized === '1'
  }
  return Boolean(value)
}

function firstAvailable(obj, keys) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key]
  }
  return undefined
}

function parseDemographicsText(value) {
  if (!value || typeof value !== 'string') {
    return {
      age: [],
      genderSexualPreference: [],
      ethnicity: [],
      disability: [],
      lowerSocioEconomicBackground: [],
      remote: undefined,
      ukWide: undefined
    }
  }

  const parsed = {
    age: [],
    genderSexualPreference: [],
    ethnicity: [],
    disability: [],
    lowerSocioEconomicBackground: [],
    remote: undefined,
    ukWide: undefined
  }

  const lines = value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    const [rawKey, ...rest] = line.split(':')
    if (!rawKey || rest.length === 0) continue
    const key = rawKey.trim().toLowerCase()
    const rawVal = rest.join(':').trim()
    const arr = toArray(rawVal)

    if (key === 'age') parsed.age = arr
    if (key === 'gender' || key === 'gender & sexual preference') parsed.genderSexualPreference = arr
    if (key === 'ethnicity') parsed.ethnicity = arr
    if (key === 'disability') parsed.disability = arr
    if (key === 'economic background' || key === 'lower socio economic background') {
      parsed.lowerSocioEconomicBackground = arr
    }
    if (key === 'remote') parsed.remote = toBool(rawVal)
    if (key === 'uk wide' || key === 'uk-wide') parsed.ukWide = toBool(rawVal)
  }

  return parsed
}

function normalizeOpportunityForEditor(raw) {
  const demographic = raw.demographic || {}
  const fromSheetBlock = parseDemographicsText(raw.demographics)
  return {
    ...raw,
    remote: toBool(firstAvailable(raw, ['remote', 'isRemote']) ?? fromSheetBlock.remote),
    ukWide: toBool(firstAvailable(raw, ['ukWide', 'isUkWide', 'uk_wide']) ?? fromSheetBlock.ukWide),
    industryTags: toArray(firstAvailable(raw, ['industryTags', 'industry', 'industries', 'industry_tags'])),
    keywords: toArray(firstAvailable(raw, ['keywords', 'keywordTags', 'keyword_tags'])),
    partnerAffiliation: toArray(firstAvailable(raw, ['partnerAffiliation', 'partnerAffiliations', 'partners'])),
    demographic: {
      age: toArray(firstAvailable(demographic, ['age']) ?? raw.age ?? fromSheetBlock.age),
      genderSexualPreference: toArray(
        firstAvailable(demographic, ['genderSexualPreference', 'gender', 'genderPreference']) ??
        raw.genderSexualPreference ??
        raw.gender ??
        fromSheetBlock.genderSexualPreference
      ),
      ethnicity: toArray(firstAvailable(demographic, ['ethnicity']) ?? raw.ethnicity ?? fromSheetBlock.ethnicity),
      disability: toArray(firstAvailable(demographic, ['disability']) ?? raw.disability ?? fromSheetBlock.disability),
      lowerSocioEconomicBackground: toArray(
        firstAvailable(demographic, ['lowerSocioEconomicBackground', 'economic', 'lowerSocioEconomic']) ??
        raw.lowerSocioEconomicBackground ??
        raw.economic ??
        fromSheetBlock.lowerSocioEconomicBackground
      )
    }
  }
}

function normalizeDateInput(raw) {
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const dt = parseDateOnly(raw)
  if (!dt) return ''
  return toISODate(dt)
}

function toLabel(key) {
  if (key === 'genderSexualPreference') return 'Gender & Sexual Preference'
  if (key === 'lowerSocioEconomicBackground') return 'Lower Socio Economic Background'
  return key[0].toUpperCase() + key.slice(1)
}

function toggleTextArray(current, value, maxCount = Infinity) {
  if (current.includes(value)) return current.filter(item => item !== value)
  if (current.length >= maxCount) return current
  return [...current, value]
}

function selectedTagSummary(edited) {
  return [
    ...(edited.industryTags || []),
    ...(edited.keywords || []),
    ...(edited.partnerAffiliation || []),
    ...Object.values(edited.demographic || {}).flat().filter(Boolean)
  ]
}

// A field counts as "needs review" if it's empty or still carries Claude's own placeholder
// for "couldn't work this out" — the same signal the publish-time guard in App.jsx uses, just
// surfaced while editing instead of only at the point of publishing.
function isBlankish(value) {
  if (value === undefined || value === null) return true
  const trimmed = String(value).trim()
  if (!trimmed) return true
  return /unclear/i.test(trimmed)
}

function isDescriptionUsable(value) {
  if (isBlankish(value)) return false
  return String(value).trim().length >= 20
}

// Checklist behind the health bar — each item is worth equal weight. Deliberately limited to
// fields every opportunity needs regardless of type; type-specific fields (event/course/
// apprenticeship details) aren't scored to keep this simple and honest rather than exhaustive.
function computeHealth(edited) {
  const hasAnyDemographic = Object.values(edited.demographic || {}).some(arr => (arr || []).length > 0)
  const checks = [
    { label: 'Title', ok: !isBlankish(edited.title) },
    { label: 'Description', ok: isDescriptionUsable(edited.draftedContent) },
    { label: 'Deadline', ok: !isBlankish(edited.applicationDeadline) },
    { label: 'Industry tags', ok: (edited.industryTags || []).length > 0 },
    { label: 'Demographics', ok: hasAnyDemographic },
    { label: 'Location', ok: edited.ukWide || !isBlankish(edited.location) },
    { label: 'Link', ok: !isBlankish(edited.link) },
    { label: 'Banner image', ok: !isBlankish(edited.bannerPic) }
  ]

  if (edited.opportunityType === 'Event') {
    checks.push({ label: 'Event date', ok: !isBlankish(edited.eventDate) })
    checks.push({ label: 'Event start time', ok: !isBlankish(edited.eventStartTime) })
  } else if (edited.opportunityType === 'Course') {
    checks.push({ label: 'Length of course', ok: !isBlankish(edited.lengthOfCourse) })
    checks.push({ label: 'Paid or free', ok: !isBlankish(edited.paidOrFreeCourses) })
  } else if (edited.opportunityType === 'Apprenticeship') {
    checks.push({ label: 'Length of apprenticeship', ok: !isBlankish(edited.lengthOfApprenticeship) })
    checks.push({ label: 'Level of apprenticeship', ok: !isBlankish(edited.levelOfApprenticeship) })
  }

  const passed = checks.filter(c => c.ok).length
  const percent = Math.round((passed / checks.length) * 100)
  const missing = checks.filter(c => !c.ok).map(c => c.label)
  let tone = 'poor'
  if (percent >= 80) tone = 'good'
  else if (percent >= 50) tone = 'fair'
  return { percent, missing, tone }
}

function needsReviewClass(value) {
  return isBlankish(value) ? 'needs-review' : ''
}

export default function ReviewDetailPanel({ opportunity, allOpportunities, onSaveDraft, suggestedScheduleDate, scheduleRuleInfo, onClose }) {
  const [edited, setEdited] = useState(() => normalizeOpportunityForEditor(opportunity))
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [activeSection, setActiveSection] = useState('Industry')
  const [keywordInput, setKeywordInput] = useState('')
  const [saveError, setSaveError] = useState('')
  const [bannerUploading, setBannerUploading] = useState(false)
  const [bannerError, setBannerError] = useState('')
  const [titleGenerating, setTitleGenerating] = useState(false)
  const [titleError, setTitleError] = useState('')
  const [showImageBank, setShowImageBank] = useState(false)
  const [locationCheck, setLocationCheck] = useState({ status: 'idle', formattedAddress: null, checkedValue: null })

  useEffect(() => {
    const normalized = normalizeOpportunityForEditor(opportunity)
    if (!normalized.schedulePost && suggestedScheduleDate) {
      normalized.schedulePost = suggestedScheduleDate
      normalized.status = 'scheduled'
    }
    setEdited(normalized)
    setSaveError('')
  }, [opportunity, suggestedScheduleDate])

  const tags = useMemo(() => selectedTagSummary(edited), [edited])
  const health = useMemo(() => computeHealth(edited), [edited])

  const changeField = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }))
  }

  const handleBannerUpload = async file => {
    if (!file) return
    setBannerError('')
    setBannerUploading(true)
    try {
      const imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Could not read file'))
        reader.readAsDataURL(file)
      })

      const res = await fetch(`${API_BASE}/upload-banner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, filename: file.name })
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      changeField('bannerPic', data.url)
    } catch (err) {
      setBannerError(err.message || 'Failed to upload banner image.')
    } finally {
      setBannerUploading(false)
    }
  }

  const handleGenerateTitle = async () => {
    setTitleError('')
    setTitleGenerating(true)
    try {
      const res = await fetch(`${API_BASE}/generate-title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: edited.draftedContent,
          opportunityType: edited.opportunityType,
          location: edited.location,
          salary: edited.salary,
          anythingElseImportant: edited.anythingElseImportant,
          industry: edited.industry
        })
      })
      if (!res.ok) throw new Error('Failed to generate a title')
      const data = await res.json()
      changeField('title', data.title)
    } catch (err) {
      setTitleError(err.message || 'Failed to generate a title.')
    } finally {
      setTitleGenerating(false)
    }
  }

  const checkLocation = async value => {
    const trimmed = (value || '').trim()
    if (!trimmed) {
      setLocationCheck({ status: 'idle', formattedAddress: null, checkedValue: null })
      return
    }
    setLocationCheck({ status: 'checking', formattedAddress: null, checkedValue: trimmed })
    try {
      const res = await fetch(`${API_BASE}/geocode-check?location=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      setLocationCheck({
        status: data.recognized ? (data.isVirtual ? 'virtual' : 'recognized') : 'unrecognized',
        formattedAddress: data.formattedAddress || null,
        checkedValue: trimmed
      })
    } catch {
      setLocationCheck({ status: 'error', formattedAddress: null, checkedValue: trimmed })
    }
  }

  useEffect(() => {
    if (activeSection !== 'Audience location') return
    const trimmed = (edited.location || '').trim()
    if (!trimmed) {
      setLocationCheck({ status: 'idle', formattedAddress: null, checkedValue: null })
      return
    }
    if (locationCheck.checkedValue === trimmed) return
    const timer = setTimeout(() => checkLocation(trimmed), 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, edited.location])

  const updateDemographic = (group, value, checked) => {
    const current = edited.demographic?.[group] || []
    const next = checked ? [...current, value] : current.filter(v => v !== value)
    setEdited(prev => ({
      ...prev,
      demographic: {
        ...(prev.demographic || {}),
        [group]: next
      }
    }))
  }

  const toggleIndustry = tag => {
    setEdited(prev => ({
      ...prev,
      industryTags: toggleTextArray(prev.industryTags || [], tag, 3)
    }))
  }

  const toggleKeyword = tag => {
    setEdited(prev => ({
      ...prev,
      keywords: toggleTextArray(prev.keywords || [], tag)
    }))
  }

  const togglePartner = partner => {
    setEdited(prev => ({
      ...prev,
      partnerAffiliation: toggleTextArray(prev.partnerAffiliation || [], partner)
    }))
  }

  const addKeywordFromInput = () => {
    const clean = keywordInput.trim()
    if (!clean) return
    setEdited(prev => ({
      ...prev,
      keywords: toggleTextArray(prev.keywords || [], clean)
    }))
    setKeywordInput('')
  }

  const handleSave = async () => {
    const result = await onSaveDraft(edited.rowIndex, edited)
    if (result?.ok === false) {
      setSaveError(result.message || 'Unable to save this schedule.')
      return
    }
    onClose()
  }

  const renderTagsSection = () => {
    if (activeSection === 'Industry') {
      return (
        <>
          <h5 className="modal-title">Please select the industry tags that this content or opportunity relates to (maximum 3):</h5>
          <div className="industry-grid">
            {INDUSTRY_TAGS.map(tag => {
              const active = (edited.industryTags || []).includes(tag)
              return (
                <button key={tag} className={`tag-pill ${active ? 'is-active' : ''}`} onClick={() => toggleIndustry(tag)}>
                  {tag}
                </button>
              )
            })}
          </div>
        </>
      )
    }

    if (activeSection === 'Demographic') {
      return (
        <>
          <h5 className="modal-title">Please select relevant demographic tags that this opportunity relates to:</h5>
          <div className="demographic-columns">
            {Object.entries(DEMOGRAPHICS).map(([group, options]) => {
              const selected = edited.demographic?.[group] || []
              return (
                <div className="demo-field" key={group}>
                  <h4>{toLabel(group)}</h4>
                  <div className="select-shell">
                    {selected.length > 0 ? selected.map(item => (
                      <button
                        key={item}
                        type="button"
                        className="selected-pill removable"
                        onClick={() => updateDemographic(group, item, false)}
                      >
                        {item} ×
                      </button>
                    )) : <span className="placeholder">Select...</span>}
                  </div>
                  <div className="chip-grid">
                    {options.map(opt => {
                      const checked = selected.includes(opt)
                      return (
                        <label key={opt} className={`chip ${checked ? 'active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => updateDemographic(group, opt, e.target.checked)}
                          />
                          <span>{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )
    }

    if (activeSection === 'Keywords') {
      return (
        <>
          <h5 className="modal-title">Keywords help our users to find your content & opportunities. Type a keyword and press enter after each word.</h5>
          <input
            className="keyword-input"
            value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addKeywordFromInput()
              }
            }}
            placeholder=""
          />
          <p className="subtitle">Popular keywords:</p>
          <div className="chip-grid">
            {POPULAR_KEYWORDS.map(word => (
              <button
                key={word}
                className={`tag-pill ${(edited.keywords || []).includes(word) ? 'is-active' : ''}`}
                onClick={() => toggleKeyword(word)}
              >
                {word}
              </button>
            ))}
          </div>
          {(edited.keywords || []).length > 0 && (
            <div className="chip-grid selected-keywords">
              {(edited.keywords || []).map(word => (
                <span key={word} className="selected-pill">{word} ×</span>
              ))}
            </div>
          )}
        </>
      )
    }

    if (activeSection === 'Audience location') {
      return (
        <>
          <h5 className="modal-title">Enter the audience location you want this post to reach or let us know if it's remote:</h5>
          <div className="audience-grid">
            <label>
              Is this a remote opportunity?
              <select value={edited.remote ? 'Yes' : 'No'} onChange={e => changeField('remote', e.target.value === 'Yes')}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
            <label>
              Is this a UK-wide opportunity?
              <select
                value={edited.ukWide ? 'Yes' : 'No'}
                onChange={e => {
                  const isUkWide = e.target.value === 'Yes'
                  setEdited(prev => ({ ...prev, ukWide: isUkWide, location: isUkWide ? '' : prev.location }))
                }}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
            {!edited.ukWide && (
              <label className={needsReviewClass(edited.location)}>
                Location
                <input
                  value={edited.location || ''}
                  onChange={e => changeField('location', e.target.value)}
                />
                {edited.location && locationCheck.checkedValue === edited.location.trim() && (
                  <span className={`field-help location-check location-check-${locationCheck.status}`}>
                    {locationCheck.status === 'checking' && 'Checking...'}
                    {locationCheck.status === 'recognized' && (
                      locationCheck.formattedAddress
                        ? `✓ Recognized: ${locationCheck.formattedAddress}`
                        : '✓ Recognized as a place'
                    )}
                    {locationCheck.status === 'virtual' && 'Treated as remote/UK-wide — no map pin needed here.'}
                    {locationCheck.status === 'unrecognized' && "⚠ Couldn't confirm this is a real place — try being more specific, e.g. add the town or city."}
                    {locationCheck.status === 'error' && "Couldn't check this location right now."}
                  </span>
                )}
              </label>
            )}
          </div>
        </>
      )
    }

    return (
      <>
        <h5 className="modal-title">Is this listing associated with any of the following ERIC partners:</h5>
        <div className="chip-grid">
          {PARTNERS.map(partner => (
            <button
              key={partner}
              className={`tag-pill ${(edited.partnerAffiliation || []).includes(partner) ? 'is-active' : ''}`}
              onClick={() => togglePartner(partner)}
            >
              {partner}
            </button>
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="editor-modal" role="dialog" aria-modal="true" aria-label="Edit opportunity">
      <div className="editor-form-surface">
        <button className="close-modal" onClick={onClose} aria-label="Close">×</button>

        <div className="editor-form-grid">
          <div className="health-bar-wrap">
            <div className="health-bar-header">
              <span className={`health-label tone-${health.tone}`}>{health.percent}% complete</span>
              {health.missing.length > 0 && (
                <span className="health-missing">Still needs: {health.missing.join(', ')}</span>
              )}
            </div>
            <div className="health-bar-track">
              <div className={`health-bar-fill tone-${health.tone}`} style={{ width: `${health.percent}%` }} />
            </div>
          </div>

          <section className="editor-main-form">
            <h4 className="zone-heading">Goes live on the real portal</h4>
            <p className="zone-subtitle">Everything below is what people will actually see on meet-eric.com.</p>

            <label>
              Opportunity type
              <select value={edited.opportunityType || ''} onChange={e => changeField('opportunityType', e.target.value)}>
                <option value="">Select a type</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <label>
              Banner image
              {edited.bannerPic && (
                <img className="banner-preview" src={edited.bannerPic} alt="Banner preview" />
              )}
              <div className="banner-upload-row">
                <input
                  type="file"
                  accept="image/*"
                  disabled={bannerUploading}
                  onChange={e => handleBannerUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  className="ghost image-bank-open-btn"
                  onClick={() => setShowImageBank(true)}
                >
                  Browse image bank
                </button>
              </div>
              {bannerUploading && <span className="field-help">Uploading...</span>}
              {bannerError && <div className="inline-error">{bannerError}</div>}
            </label>

            <label className={needsReviewClass(edited.title)}>
              Title
              <div className="title-with-action">
                <input value={edited.title || ''} onChange={e => changeField('title', e.target.value)} />
                <button
                  type="button"
                  className="ghost ai-title-btn"
                  onClick={handleGenerateTitle}
                  disabled={titleGenerating || !isDescriptionUsable(edited.draftedContent)}
                  title={!isDescriptionUsable(edited.draftedContent) ? 'Needs a usable description first' : 'Generate a fun title from this opportunity’s info'}
                >
                  {titleGenerating ? 'Thinking...' : 'Replace with AI title'}
                </button>
              </div>
              <span className={`field-help char-count ${(edited.title || '').length > TITLE_MAX_LENGTH ? 'over-limit' : ''}`}>
                {(edited.title || '').length}/{TITLE_MAX_LENGTH} characters — the real portal cuts titles off past this length
              </span>
              {titleError && <div className="inline-error">{titleError}</div>}
            </label>

            <label className={isDescriptionUsable(edited.draftedContent) ? '' : 'needs-review'}>
              Description
              <textarea rows={12} value={edited.draftedContent || ''} onChange={e => changeField('draftedContent', e.target.value)} />
              <span className="field-help">This is the public-facing copy — rewrite anything Claude marked "Unclear" or left thin.</span>
            </label>

            {edited.opportunityType === 'Course' && (
              <div className="type-specific-fields">
                <label>
                  Length of course
                  <input placeholder="e.g. 6 weeks" value={edited.lengthOfCourse || ''} onChange={e => changeField('lengthOfCourse', e.target.value)} />
                </label>
                <label>
                  Paid or free?
                  <input placeholder="e.g. Free" value={edited.paidOrFreeCourses || ''} onChange={e => changeField('paidOrFreeCourses', e.target.value)} />
                </label>
                <label>
                  Course location
                  <input value={edited.courseLocation || ''} onChange={e => changeField('courseLocation', e.target.value)} />
                </label>
              </div>
            )}

            {edited.opportunityType === 'Apprenticeship' && (
              <div className="type-specific-fields">
                <label>
                  Length of apprenticeship
                  <input placeholder="e.g. 18 months" value={edited.lengthOfApprenticeship || ''} onChange={e => changeField('lengthOfApprenticeship', e.target.value)} />
                </label>
                <label>
                  Level of apprenticeship
                  <input placeholder="e.g. Level 4" value={edited.levelOfApprenticeship || ''} onChange={e => changeField('levelOfApprenticeship', e.target.value)} />
                </label>
              </div>
            )}

            {edited.opportunityType === 'Event' && (
              <div className="type-specific-fields">
                <label>
                  Event date
                  <input type="date" value={normalizeDateInput(edited.eventDate)} onChange={e => changeField('eventDate', e.target.value)} />
                </label>
                <div className="two-col">
                  <label>
                    Event start time
                    <input type="time" value={normalizeTimeInput(edited.eventStartTime)} onChange={e => changeField('eventStartTime', e.target.value)} />
                  </label>
                  <label>
                    Event end time
                    <input type="time" value={normalizeTimeInput(edited.eventEndTime)} onChange={e => changeField('eventEndTime', e.target.value)} />
                    <span className="field-help">Optional — leave blank if it doesn't apply, e.g. an event with multiple separate sessions.</span>
                  </label>
                </div>
              </div>
            )}

            <label>
              Anything else important?
              <textarea rows={3} value={edited.anythingElseImportant || ''} onChange={e => changeField('anythingElseImportant', e.target.value)} />
            </label>

            <label className={needsReviewClass(edited.applicationDeadline)}>
              Application deadline
              <input
                type="date"
                value={normalizeDateInput(edited.applicationDeadline)}
                onChange={e => changeField('applicationDeadline', e.target.value)}
              />
              <span className="field-help">Correct this if the extracted deadline looks wrong — it also drives the schedule-date rules on the right.</span>
            </label>

            <label>
              Company
              <input value="ERIC Recommends" readOnly disabled />
              <span className="field-help">Every opportunity here publishes under ERIC Recommends — this isn't editable.</span>
            </label>

            <label>
              Salary
              <input placeholder="Optional" value={edited.salary || ''} onChange={e => changeField('salary', e.target.value)} />
            </label>

            <label className={needsReviewClass(edited.link)}>
              Link
              <div className="link-with-action">
                <input value={edited.link || ''} onChange={e => changeField('link', e.target.value)} />
                {edited.link && (
                  <a
                    className="open-link-btn"
                    href={edited.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open link ↗
                  </a>
                )}
              </div>
            </label>

            <label>
              Publish date
              <input type="date" value={normalizeDateInput(edited.publishDate)} onChange={e => changeField('publishDate', e.target.value)} />
              <span className="field-help">Shown on the real portal as this opportunity's post date.</span>
            </label>

            {saveError && <div className="inline-error">{saveError}</div>}

            <div className={`tags-block ${tags.length === 0 ? 'needs-review' : ''}`}>
              <p className="tag-heading">Add tags so people can find this opportunity (industry, demographics, keywords):</p>
              <button className="add-tags-btn" onClick={() => setShowTagsModal(true)}>Add Tags</button>
              <div className="chip-grid">
                {tags.length > 0 ? tags.map(tag => <span key={tag} className="selected-pill">{tag}</span>) : <span className="placeholder">No tags selected yet.</span>}
              </div>
            </div>

            <div className="actions review-actions editor-actions">
              <button className="ghost" onClick={onClose}>Cancel</button>
              <button className="publish" onClick={handleSave}>Save</button>
            </div>
          </section>

          <aside className="editor-rail">
            <h4 className="zone-heading">Portal Parser only</h4>
            <p className="zone-subtitle">Controls how this app schedules the opportunity — none of this appears on the real portal.</p>

            <div className="rail-card">
              <p><strong>Drafted by AI on:</strong> {edited.draftedDate || 'n/a'}</p>
              <p><strong>Status:</strong> {edited.schedulePost ? 'Scheduled' : 'In review'}</p>
            </div>

            <div className="rail-card">
              <label>
                Send to portal on
                <ScheduleDatePicker
                  value={edited.schedulePost || ''}
                  onChange={date => changeField('schedulePost', date)}
                  allOpportunities={allOpportunities}
                  minDate={scheduleRuleInfo?.minDate || ''}
                  maxDate={scheduleRuleInfo?.maxDate || ''}
                />
              </label>
              <span className="field-help">{scheduleRuleInfo?.note || 'This app will publish it to the real portal on this date — leave blank to publish manually instead.'}</span>
            </div>
          </aside>
        </div>

        {showTagsModal && (
          <div className="tags-modal-overlay" role="dialog" aria-modal="true" aria-label="Edit tags">
            <div className="tags-modal-surface">
              <button className="close-modal" onClick={() => setShowTagsModal(false)} aria-label="Close">×</button>
              <aside className="editor-nav">
                {SECTIONS.map(section => (
                  <button
                    key={section}
                    className={`editor-nav-item ${activeSection === section ? 'is-active' : ''}`}
                    onClick={() => setActiveSection(section)}
                  >
                    {section}
                  </button>
                ))}
              </aside>

              <section className="editor-main tags-main">
                {renderTagsSection()}
                <div className="actions review-actions editor-actions">
                  <button className="ghost" onClick={() => setShowTagsModal(false)}>Cancel</button>
                  <button className="publish" onClick={() => setShowTagsModal(false)}>Save</button>
                </div>
              </section>
            </div>
          </div>
        )}

        {showImageBank && (
          <ImageBankPicker
            onSelect={url => changeField('bannerPic', url)}
            onClose={() => setShowImageBank(false)}
          />
        )}
      </div>
    </div>
  )
}
