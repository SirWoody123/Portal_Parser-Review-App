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

function toLabel(key) {
  if (key === 'genderSexualPreference') return 'Gender & sexual preference'
  if (key === 'lowerSocioEconomicBackground') return 'Lower socio economic background'
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

function renderSelected(edited) {
  const selected = Object.values(edited.demographic || {}).flat().filter(Boolean)
  if (selected.length === 0) {
    return <p className="no-tags">No tags selected yet.</p>
  }
  return (
    <div className="chip-grid compact-chips">
      {selected.map(item => (
        <span className="chip active static" key={item}>{item}</span>
      ))}
    </div>
  )
}

export default function ReviewDetailPanel({ opportunity, onSaveDraft, onPublish, onClose }) {
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
    <div className="editor-modal" role="dialog" aria-modal="true" aria-label="Edit opportunity">
      <div className="editor-surface">
        <button className="close-modal" onClick={onClose} aria-label="Close">×</button>

        <aside className="editor-nav">
          <button className="editor-nav-item">Industry</button>
          <button className="editor-nav-item is-active">Demographic</button>
          <button className="editor-nav-item">Keywords</button>
          <button className="editor-nav-item">Audience location</button>
          <button className="editor-nav-item">Partner affiliation</button>
        </aside>

        <section className="editor-main">
          <p className="breadcrumb">All content  ›  Add new {edited.opportunityType || 'opportunity'}</p>
          <h3 className="editor-title">Please select relevant demographic tags that this opportunity relates to:</h3>

          <div className="field-stack">
            <label>
              Video type
              <select value={edited.opportunityType || ''} onChange={e => changeField('opportunityType', e.target.value)}>
                <option value="">Select type</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <label>
              Video title
              <input value={edited.title || ''} onChange={e => changeField('title', e.target.value)} />
            </label>

            <label>
              Short summary
              <textarea rows={6} value={edited.draftedContent || ''} onChange={e => changeField('draftedContent', e.target.value)} />
            </label>

            <div className="tags-card">
              <p className="tag-heading">Please add some relevant tags to help our community find this video:</p>
              {renderSelected(edited)}
            </div>

            <div className="demographic-wrap modal-demo">
              {Object.entries(DEMOGRAPHICS).map(([group, options]) => (
                <section key={group} className="demo-section">
                  <h4>{toLabel(group)}</h4>
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
          </div>

          <div className="actions review-actions editor-actions">
            <button className="ghost" onClick={saveDraft}>Save</button>
            <button className="ghost" onClick={onClose}>Cancel</button>
            <button className="publish" onClick={publish} disabled={publishing}>
              {publishing ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </section>

        <aside className="editor-rail">
          <div className="rail-card">
            <p><strong>Created at:</strong> {normalizeDateInput(edited.publishDate) || 'TBC'}</p>
            <p><strong>Status:</strong> In Review</p>
            <label>
              Published at
              <input type="date" value={normalizeDateInput(edited.publishDate)} onChange={e => changeField('publishDate', e.target.value)} />
            </label>
          </div>

          <div className="rail-card">
            <label>
              Select company
              <input value={edited.company || edited.companyName || 'RicNic'} onChange={e => changeField('company', e.target.value)} />
            </label>
            <label>
              Schedule post
              <input type="date" value={normalizeDateInput(edited.applicationDeadline)} onChange={e => changeField('applicationDeadline', e.target.value)} />
            </label>
            <label>
              Link
              <input value={edited.link || ''} onChange={e => changeField('link', e.target.value)} />
            </label>
            <label>
              Location
              <input value={edited.location || ''} onChange={e => changeField('location', e.target.value)} />
            </label>
            <label className="inline-checkbox">
              <input type="checkbox" checked={edited.remote || false} onChange={e => changeField('remote', e.target.checked)} />
              Is this a remote opportunity?
            </label>
            <label className="inline-checkbox">
              <input type="checkbox" checked={edited.ukWide || false} onChange={e => changeField('ukWide', e.target.checked)} />
              Is this a UK-wide opportunity?
            </label>
          </div>
        </aside>
      </div>
    </div>
  )
}
