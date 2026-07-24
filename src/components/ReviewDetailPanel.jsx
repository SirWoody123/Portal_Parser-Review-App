import { useEffect, useState } from 'react'

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

function normalizeDateInput(raw) {
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const dt = new Date(raw)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toISOString().slice(0, 10)
}

function toLabels(key) {
  if (key === 'genderSexualPreference') return 'Gender'
  if (key === 'lowerSocioEconomicBackground') return 'Economic background'
  return key[0].toUpperCase() + key.slice(1)
}

function updateArray(setter, source, key, value, checked) {
  const current = source.demographic?.[key] || []
  const next = checked ? [...current, value] : current.filter(v => v !== value)
  setter({
    ...source,
    demographic: {
      ...(source.demographic || {}),
      [key]: next
    }
  })
}

export default function ReviewDetailPanel({ opportunity, onSaveDraft, onPublish }) {
  const [edited, setEdited] = useState(opportunity)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    setEdited(opportunity)
  }, [opportunity])

  const changeField = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }))
  }

  const saveDraft = () => {
    onSaveDraft(edited.rowIndex, edited)
  }

  const publish = async () => {
    setPublishing(true)
    await onPublish(edited.rowIndex, edited)
    setPublishing(false)
  }

  return (
    <div className="detail-card">
      <header className="detail-top">
        <p className="eyebrow">Review details</p>
        <h3>{edited.title || 'Untitled opportunity'}</h3>
      </header>

      <div className="form-grid">
        <label>
          Title
          <input value={edited.title || ''} onChange={e => changeField('title', e.target.value)} />
        </label>
        <label>
          Category
          <select value={edited.opportunityType || ''} onChange={e => changeField('opportunityType', e.target.value)}>
            <option value="">Select category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
        <label className="span-2">
          Description
          <textarea rows={5} value={edited.draftedContent || ''} onChange={e => changeField('draftedContent', e.target.value)} />
        </label>
        <label>
          Salary
          <input value={edited.salary || ''} onChange={e => changeField('salary', e.target.value)} />
        </label>
        <label>
          Deadline
          <input type="date" value={normalizeDateInput(edited.applicationDeadline)} onChange={e => changeField('applicationDeadline', e.target.value)} />
        </label>
        <label>
          Publish date
          <input type="date" value={normalizeDateInput(edited.publishDate)} onChange={e => changeField('publishDate', e.target.value)} />
        </label>
        <label>
          Location
          <input value={edited.location || ''} onChange={e => changeField('location', e.target.value)} />
        </label>
        <label className="span-2">
          Link
          <input value={edited.link || ''} onChange={e => changeField('link', e.target.value)} />
        </label>
      </div>

      <div className="flag-row">
        <label className="toggle-pill">
          <input type="checkbox" checked={edited.remote || false} onChange={e => changeField('remote', e.target.checked)} />
          <span>Remote</span>
        </label>
        <label className="toggle-pill">
          <input type="checkbox" checked={edited.ukWide || false} onChange={e => changeField('ukWide', e.target.checked)} />
          <span>UK Wide</span>
        </label>
      </div>

      <div className="demographic-wrap">
        {Object.entries(DEMOGRAPHICS).map(([group, options]) => (
          <section key={group} className="demo-section">
            <h4>{toLabels(group)}</h4>
            <div className="chip-grid">
              {options.map(opt => {
                const checked = (edited.demographic?.[group] || []).includes(opt)
                return (
                  <label key={opt} className={`chip ${checked ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => updateArray(setEdited, edited, group, opt, e.target.checked)}
                    />
                    <span>{opt}</span>
                  </label>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="actions review-actions">
        <button className="ghost" onClick={saveDraft}>Save draft</button>
        <button className="publish" onClick={publish} disabled={publishing}>
          {publishing ? 'Approving...' : 'Approve & publish'}
        </button>
      </div>
    </div>
  )
}
