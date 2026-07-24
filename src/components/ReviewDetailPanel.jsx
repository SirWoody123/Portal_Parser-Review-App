import { useEffect, useMemo, useState } from 'react'

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

const POPULAR_KEYWORDS = ['Advice', "CV's & Portfolios", 'Money & Finance', 'Interviews', 'Networking', 'Mentoring']
const PARTNERS = ['UK Creative Festival']
const SECTIONS = ['Industry', 'Demographic', 'Keywords', 'Audience location', 'Partner affiliation']

function normalizeDateInput(raw) {
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const dt = new Date(raw)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toISOString().slice(0, 10)
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

export default function ReviewDetailPanel({ opportunity, onSaveDraft, onClose }) {
  const [edited, setEdited] = useState(opportunity)
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [activeSection, setActiveSection] = useState('Industry')
  const [keywordInput, setKeywordInput] = useState('')

  useEffect(() => {
    setEdited(opportunity)
  }, [opportunity])

  const tags = useMemo(() => selectedTagSummary(edited), [edited])

  const changeField = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }))
  }

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

  const handleSave = () => {
    onSaveDraft(edited.rowIndex, edited)
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
                      <span key={item} className="selected-pill">{item} ×</span>
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
              <select value={edited.ukWide ? 'Yes' : 'No'} onChange={e => changeField('ukWide', e.target.value === 'Yes')}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
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
          <section className="editor-main-form">
            <p className="breadcrumb">All content  ›  Add new {edited.opportunityType || 'opportunity'}</p>

            <label>
              Video Type
              <select value={edited.opportunityType || ''} onChange={e => changeField('opportunityType', e.target.value)}>
                <option value="">Select the type of content you want to promote</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <div className="admin-row">
              <strong>ERIC Admin only:</strong>
              <label>
                <input type="checkbox" checked={edited.hideFromFeed || false} onChange={e => changeField('hideFromFeed', e.target.checked)} />
                Does not display in the feed
              </label>
              <label>
                <input type="checkbox" checked={edited.republish14Days || false} onChange={e => changeField('republish14Days', e.target.checked)} />
                Republish every 14 days
              </label>
            </div>

            <label>
              Video title
              <input value={edited.title || ''} onChange={e => changeField('title', e.target.value)} />
            </label>

            <label>
              Short summary
              <textarea rows={6} value={edited.draftedContent || ''} onChange={e => changeField('draftedContent', e.target.value)} />
            </label>

            <label>
              Optional expiry date:
              <input type="date" value={normalizeDateInput(edited.expiredDate)} onChange={e => changeField('expiredDate', e.target.value)} />
              <span className="field-help">Let us know if this content should expire. If not, it'll stay on the ERIC app indefinitely.</span>
            </label>

            <div className="tags-block">
              <p className="tag-heading">Please add some relevant hashtags to help our community find this video:</p>
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
                Location
                <input value={edited.location || ''} onChange={e => changeField('location', e.target.value)} />
              </label>
              <label>
                Link
                <input value={edited.link || ''} onChange={e => changeField('link', e.target.value)} />
              </label>
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
      </div>
    </div>
  )
}
