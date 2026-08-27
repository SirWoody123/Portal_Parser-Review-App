// Shared by the editor (ReviewDetailPanel) and the Schedule tab / card, so both show the exact
// same completeness score instead of drifting apart. Extracted out of ReviewDetailPanel.jsx so
// App.jsx and OpportunityCard.jsx can use it too, since the Schedule tab needs to know whether
// an opportunity is 100% complete to decide its default send time.

// A field counts as "needs review" if it's empty or still carries Claude's own placeholder for
// "couldn't work this out" — the same signal the publish-time guard in App.jsx uses, just
// surfaced while editing instead of only at the point of publishing.
export function isBlankish(value) {
  if (value === undefined || value === null) return true
  const trimmed = String(value).trim()
  if (!trimmed) return true
  return /unclear/i.test(trimmed)
}

export function isDescriptionUsable(value) {
  if (isBlankish(value)) return false
  return String(value).trim().length >= 20
}

// Checklist behind the health bar — each item is worth equal weight. Deliberately limited to
// fields every opportunity needs regardless of type; type-specific fields (event/course/
// apprenticeship details) are scored too, gated on opportunityType.
export function computeHealth(edited) {
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
