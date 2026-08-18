import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Folder browser over the team's shared Drive image bank. The bank spans every year's image
// bank folder, and their internal structure isn't consistent — some go straight to images,
// some have a category layer first, one has both — so this navigates like a generic folder
// browser (breadcrumb + back) rather than assuming a fixed two-level shape. Selecting an image
// downloads it server-side and re-uploads it through the same Storage path a manual banner
// upload uses, so bannerPic always looks the same regardless of where the image came from.
export default function ImageBankPicker({ onSelect, onClose }) {
  const [path, setPath] = useState([]) // stack of {id, name}; empty = root
  const [folders, setFolders] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectingId, setSelectingId] = useState(null)
  const [selectError, setSelectError] = useState('')

  const current = path[path.length - 1] || null

  useEffect(() => {
    setLoading(true)
    setError('')
    setImages([])
    const url = current
      ? `${API_BASE}/image-bank/categories/${current.id}/images`
      : `${API_BASE}/image-bank/categories`
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load image bank')
        return res.json()
      })
      .then(data => {
        setFolders(current ? (data.folders || []) : (data.categories || []))
        setImages(current ? (data.images || []) : [])
      })
      .catch(err => setError(err.message || 'Failed to load image bank'))
      .finally(() => setLoading(false))
  }, [current])

  const openFolder = folder => setPath(prev => [...prev, folder])
  const goBack = () => setPath(prev => prev.slice(0, -1))
  const goToCrumb = index => setPath(prev => prev.slice(0, index + 1))

  const selectImage = async image => {
    setSelectError('')
    setSelectingId(image.id)
    try {
      const res = await fetch(`${API_BASE}/image-bank/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: image.id }),
      })
      if (!res.ok) throw new Error('Failed to select image')
      const data = await res.json()
      onSelect(data.url)
      onClose()
    } catch (err) {
      setSelectError(err.message || 'Failed to select image')
    } finally {
      setSelectingId(null)
    }
  }

  return (
    <div className="tags-modal-overlay" role="dialog" aria-modal="true" aria-label="Choose an image from the image bank">
      <div className="tags-modal-surface image-bank-surface">
        <button className="close-modal" onClick={onClose} aria-label="Close">×</button>

        <section className="editor-main image-bank-main">
          <div className="image-bank-header-row">
            {path.length > 0 && <button className="ghost image-bank-back" onClick={goBack}>← Back</button>}
            <div className="image-bank-breadcrumb">
              <button className="image-bank-crumb" onClick={() => setPath([])}>Image bank</button>
              {path.map((crumb, i) => (
                <span key={crumb.id}>
                  {' / '}
                  <button className="image-bank-crumb" onClick={() => goToCrumb(i)}>{crumb.name}</button>
                </span>
              ))}
            </div>
          </div>

          {loading && <p className="field-help">Loading...</p>}
          {error && <div className="inline-error">{error}</div>}
          {selectError && <div className="inline-error">{selectError}</div>}
          {!loading && !error && folders.length === 0 && images.length === 0 && (
            <p className="field-help">Nothing in this folder.</p>
          )}

          {folders.length > 0 && (
            <div className="image-bank-category-grid">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  className="image-bank-category-tile"
                  onClick={() => openFolder(folder)}
                >
                  {folder.name}
                </button>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <div className="image-bank-image-grid">
              {images.map(image => (
                <button
                  key={image.id}
                  className="image-bank-thumb"
                  onClick={() => selectImage(image)}
                  disabled={selectingId !== null}
                  title={image.name}
                >
                  <img src={image.thumbnailLink} alt={image.name} loading="lazy" />
                  {selectingId === image.id && <span className="image-bank-thumb-loading">Using...</span>}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
