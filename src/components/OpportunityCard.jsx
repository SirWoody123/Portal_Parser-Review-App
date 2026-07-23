import { useState } from 'react'

const CATEGORIES = ['Apprenticeship', 'Course', 'Internship', 'Junior full-time role', 'Junior part-time role', 'Freelance role', 'Work experience', 'Training scheme', 'Event', 'Competition/Grant', 'Mentoring', 'Runner role', 'Opportunity']
const REGIONS = ['North East', 'North West', 'Yorkshire and the Humber', 'East Midlands', 'West Midlands', 'East of England', 'London', 'South East', 'South West', 'Wales', 'Scotland', 'Northern Ireland']
const DEMOGRAPHICS = {
  age: ['16', '17', '18', '19', '20', '21', '22', '23', '24', '25', 'Over 18', 'Under 18', 'Over 25', '16 and under', 'All ages'],
  gender: ['He/Him', 'She/Her', 'They/Them', 'LGBTQIA+', 'All genders & preferences'],
  ethnicity: ['African Caribbean or Black British', 'Arab', 'Asian or Asian British', 'Mixed or Multiple Ethnic Group', 'Other Ethnic Group', 'White or White British', 'All ethnicities'],
  disability: ['Physical disability', 'Mental health', 'Neurodiversity', 'Chronic illness', 'All disability'],
  economic: ['Only those from lower socio-economic background', 'All backgrounds']
}

export default function OpportunityCard({ opportunity, onPublish }) {
  const [edited, setEdited] = useState(opportunity)
  const [publishing, setPublishing] = useState(false)

  const handleChange = (field, value) => {
    setEdited({ ...edited, [field]: value })
  }

  const handleDemoChange = (category, value, checked) => {
    const dem = edited.demographic || {}
    const key = category === 'age' ? 'age' : category === 'gender' ? 'genderSexualPreference' : category === 'ethnicity' ? 'ethnicity' : category === 'disability' ? 'disability' : 'lowerSocioEconomicBackground'
    const arr = dem[key] || []
    const newArr = checked ? [...arr, value] : arr.filter(v => v !== value)
    setEdited({ ...edited, demographic: { ...dem, [key]: newArr } })
  }

  const handlePublish = async () => {
    setPublishing(true)
    await onPublish(edited.rowIndex, edited)
    setPublishing(false)
  }

  return (
    <div className="card">
      <h3>{edited.title || 'Untitled Opportunity'}</h3>

      <fieldset>
        <legend>Basic Info</legend>
        <label>Title: <input value={edited.title || ''} onChange={e => handleChange('title', e.target.value)} /></label>
        <label>Category: <select value={edited.opportunityType || ''} onChange={e => handleChange('opportunityType', e.target.value)}>
          <option value="">Select...</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select></label>
        <label>Description: <textarea value={edited.draftedContent || ''} onChange={e => handleChange('draftedContent', e.target.value)} rows={4} /></label>
        <label>Salary: <input value={edited.salary || ''} onChange={e => handleChange('salary', e.target.value)} /></label>
        <label>Deadline: <input type="date" value={edited.applicationDeadline || ''} onChange={e => handleChange('applicationDeadline', e.target.value)} /></label>
        <label>Location: <input value={edited.location || ''} onChange={e => handleChange('location', e.target.value)} /></label>
        <label>Link: <input value={edited.link || ''} onChange={e => handleChange('link', e.target.value)} /></label>
        <label>Publish Date: <input type="date" value={edited.publishDate || ''} onChange={e => handleChange('publishDate', e.target.value)} /></label>
      </fieldset>

      <fieldset>
        <legend>Flags</legend>
        <label><input type="checkbox" checked={edited.remote || false} onChange={e => handleChange('remote', e.target.checked)} /> Remote</label>
        <label><input type="checkbox" checked={edited.ukWide || false} onChange={e => handleChange('ukWide', e.target.checked)} /> UK Wide</label>
      </fieldset>

      <fieldset>
        <legend>Demographics</legend>
        {Object.entries(DEMOGRAPHICS).map(([cat, options]) => (
          <div key={cat} className="demo-group">
            <h4>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h4>
            {options.map(opt => {
              const key = cat === 'age' ? 'age' : cat === 'gender' ? 'genderSexualPreference' : cat === 'ethnicity' ? 'ethnicity' : cat === 'disability' ? 'disability' : 'lowerSocioEconomicBackground'
              const isChecked = (edited.demographic?.[key] || []).includes(opt)
              return (
                <label key={opt}>
                  <input type="checkbox" checked={isChecked} onChange={e => handleDemoChange(cat, opt, e.target.checked)} />
                  {opt}
                </label>
              )
            })}
          </div>
        ))}
      </fieldset>

      <div className="actions">
        <button onClick={handlePublish} disabled={publishing} className="publish">{publishing ? 'Publishing...' : 'Publish'}</button>
      </div>
    </div>
  )
}
