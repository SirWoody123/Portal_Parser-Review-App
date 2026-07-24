import { useEffect, useState } from 'react'

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

function toggleTextArray(current, value, maxCount = Infinity) {
  if (current.includes(value)) return current.filter(item => item !== value)
  if (current.length >= maxCount) return current
  return [...current, value]
}

export default function ReviewDetailPanel({ opportunity, onSaveDraft, onClose }) {
  const [edited, setEdited] = useState(opportunity)
  const [activeSection, setActiveSection] = useState('Industry')
  const [keywordInput, setKeywordInput] = useState('')

  useEffect(() => {
    setEdited(opportunity)
  }, [opportunity])

  const changeField = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }))
  }

  const saveDraft = () => {
    onSaveDraft(edited.rowIndex, edited)
    onClose()
  }

  const industryTags = edited.industryTags || []
  const keywords = edited.keywords || []
  const partnerAffiliation = edited.partnerAffiliation || []

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

  const addKeywordFromInput = () => {
    const clean = keywordInput.trim()
    if (!clean) return
    setEdited(prev => ({
      ...prev,
      keywords: toggleTextArray(prev.keywords || [], clean)
    }))
    setKeywordInput('')
  }

  const togglePartner = partner => {
    setEdited(prev => ({
      ...prev,
      partnerAffiliation: toggleTextArray(prev.partnerAffiliation || [], partner)
    }))
  }

  const renderDemographicSelect = (group, options) => {
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
                  onChange={e => updateArray(setEdited, edited, group, opt, e.target.checked)}
                />
                <span>{opt}</span>
              </label>
            )
          })}
        </div>
      </div>
    )
  }

  const renderSection = () => {
    if (activeSection === 'Industry') {
      return (
        <>
          <h5 className="modal-title">Please select the industry tags that this content or opportunity relates to (maximum 3):</h5>
          <div className="industry-grid">
            {INDUSTRY_TAGS.map(tag => {
              const active = industryTags.includes(tag)
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
            {Object.entries(DEMOGRAPHICS).map(([group, options]) => renderDemographicSelect(group, options))}
          </div>
        </>
      )
    }

    if (activeSection === 'Keywords') {
      return (
        <>
          <h5 className="modal-title">Keywords help our users to find your content and opportunities. Type a keyword and press enter after each word.</h5>
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
            placeholder="Type keyword and press Enter"
          />
          <p className="subtitle">Popular keywords:</p>
          <div className="chip-grid">
            {POPULAR_KEYWORDS.map(word => (
              <button
                key={word}
                className={`tag-pill ${keywords.includes(word) ? 'is-active' : ''}`}
                onClick={() => toggleKeyword(word)}
              >
                {word}
              </button>
            ))}
          </div>
          {keywords.length > 0 && (
            <div className="chip-grid selected-keywords">
              {keywords.map(word => (
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
              className={`tag-pill ${partnerAffiliation.includes(partner) ? 'is-active' : ''}`}
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
      <div className="editor-surface">
        <button className="close-modal" onClick={onClose} aria-label="Close">×</button>

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

        <section className="editor-main">
          {renderSection()}

          <div className="actions review-actions editor-actions">
            <button className="ghost" onClick={onClose}>Cancel</button>
            <button className="publish" onClick={saveDraft}>
              Save
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
