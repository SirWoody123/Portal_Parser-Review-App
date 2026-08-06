import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Two-step picker over the team's shared Drive image bank: pick a category, then pick an
// image. Selecting an image downloads it server-side and re-uploads it through the same
// Storage path a manual banner upload uses, so bannerPic always looks the same regardless of
// where the image came from.
export default function ImageBankPicker({ onSelect, onClose }) {
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')

  const [activeCategory, setActiveCategory] = useState(null)
  const [images, setImages] = useState([])
  const [imagesLoading, setImagesLoading] = useState(false)
  const [imagesError, setImagesError] = useState('')

  const [selectingId, setSelectingId] = useState(null)
  const [selectError, setSelectError] = useState('')

  useEffect(() => {
    setCategoriesLoading(true)
    fetch(`${API_BASE}/image-bank/categories`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load categories')
        return res.json()
      })
      .then(data => setCategories(data.categories || []))
      .catch(err => setCategoriesError(err.message || 'Failed to load categories'))
      .finally(() => setCategoriesLoading(false))
  }, [])

  const openCategory = category => {
    setActiveCategory(category)
    setImages([])
    setImagesError('')
    setImagesLoading(true)
    fetch(`${API_BASE}/image-bank/categories/${category.id}/images`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load images')
        return res.json()
      })
      .then(data => setImages(data.images || []))
      .catch(err => setImagesError(err.message || 'Failed to load images'))
      .finally(() => setImagesLoading(false))
  }

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

        {!activeCategory ? (
          <section className="editor-main image-bank-main">
            <h5 className="modal-title">Choose a category from the image bank:</h5>
            {categoriesLoading && <p className="field-help">Loading categories...</p>}
            {categoriesError && <div className="inline-error">{categoriesError}</div>}
            <div className="image-bank-category-grid">
              {categories.map(category => (
                <button
                  key={category.id}
                  className="image-bank-category-tile"
                  onClick={() => openCategory(category)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="editor-main image-bank-main">
            <div className="image-bank-header-row">
              <button className="ghost image-bank-back" onClick={() => setActiveCategory(null)}>← Categories</button>
              <h5 className="modal-title">{activeCategory.name}</h5>
            </div>
            {imagesLoading && <p className="field-help">Loading images...</p>}
            {imagesError && <div className="inline-error">{imagesError}</div>}
            {selectError && <div className="inline-error">{selectError}</div>}
            {!imagesLoading && !imagesError && images.length === 0 && (
              <p className="field-help">No images in this category.</p>
            )}
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
          </section>
        )}
      </div>
    </div>
  )
}
