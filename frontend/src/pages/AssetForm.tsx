import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAsset, createAsset, updateAsset, uploadPhoto } from '../api/assets'

const JEWELRY_SUBTYPES = ['手镯', '手链', '戒指', '项链', '耳环', '吊坠'] as const

export default function AssetForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadPromiseRef = useRef<Promise<string> | null>(null)

  const [name, setName] = useState('')
  const [classification, setClassification] = useState<'jewelry' | 'gold_bar'>('jewelry')
  const [subtype, setSubtype] = useState('')
  const [weight, setWeight] = useState('')
  const [purchasePricePerGram, setPurchasePricePerGram] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [lastEdited, setLastEdited] = useState<'perGram' | 'total'>('perGram')
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('深圳市')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPath, setPhotoPath] = useState<string | null>(null)
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'failed'>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const w = Number(weight)
  const ppg = Number(purchasePricePerGram)

  useEffect(() => {
    if (!id) return
    fetchAsset(Number(id)).then(a => {
      setName(a.name)
      setClassification(a.classification)
      setSubtype(a.subtype || '')
      setWeight(String(a.weight))
      setPurchasePricePerGram(String(a.purchase_price_per_gram))
      setPurchasePrice(String(a.purchase_price))
      setLastEdited('perGram')
      setPurchaseDate(a.purchase_date)
      setNotes(a.notes)
      setLocation(a.location || '深圳市')
      setExistingPhoto(a.photo)
      setPhotoPath(a.photo)
    })
  }, [id])

  const handleFileChange = async (file: File | null) => {
    if (!file) return
    setPhoto(file)
    setPhotoPath(null)
    setUploadStatus('uploading')
    const promise = uploadPhoto(file)
    uploadPromiseRef.current = promise
    try {
      const path = await promise
      setPhotoPath(path)
      setUploadStatus('idle')
    } catch {
      setUploadStatus('failed')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let finalPhotoPath = photoPath
      if (uploadStatus === 'uploading' && uploadPromiseRef.current) {
        try {
          finalPhotoPath = await uploadPromiseRef.current
          setPhotoPath(finalPhotoPath)
          setUploadStatus('idle')
        } catch {
          setUploadStatus('failed')
        }
      }

      const form = new FormData()
      form.append('name', name)
      form.append('classification', classification)
      if (subtype) form.append('subtype', subtype)
      form.append('weight', weight)
      form.append('purchase_price_per_gram', purchasePricePerGram)
      form.append('purchase_price', String(Number(purchasePrice)))
      form.append('purchase_date', purchaseDate)
      form.append('notes', notes)
      form.append('location', location)
      if (finalPhotoPath) {
        form.append('photo_path', finalPhotoPath)
      } else if (photo) {
        form.append('photo', photo)
      }

      if (isEdit) {
        await updateAsset(Number(id), form)
      } else {
        await createAsset(form)
      }
      setToast({ type: 'success', text: '保存成功' })
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setSubmitting(false)
      setToast({ type: 'error', text: err instanceof Error ? err.message : '保存失败' })
    }
  }

  const photoSrc = photo
    ? URL.createObjectURL(photo)
    : photoPath || existingPhoto

  const inputClass = 'w-full rounded-lg border border-hairline-on-dark bg-surface-card-dark px-3 py-2.5 text-sm text-body outline-none placeholder:text-muted focus:border-gold-400 focus:ring-1 focus:ring-gold-400'

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted active:text-body">
          ← 返回
        </button>
        <h2 className="text-lg font-semibold text-body">
          {isEdit ? '编辑资产' : '添加资产'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo */}
        <div
          className="flex items-center gap-4 rounded-xl bg-surface-card-dark p-4 active:bg-surface-elevated-dark"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-gold-100/10 overflow-hidden">
            {photoSrc ? (
              <img src={photoSrc} alt="" className="size-14 object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" className="size-6 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
            {uploadStatus === 'uploading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-canvas-dark/60">
                <div className="size-4 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
              </div>
            )}
            {uploadStatus === 'failed' && (
              <div className="absolute inset-0 flex items-center justify-center bg-trading-down/30">
                <svg viewBox="0 0 24 24" className="size-5 text-trading-down" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-body">
              {uploadStatus === 'failed'
                ? '上传失败，点击重试'
                : photoSrc
                  ? '点击更换图片'
                  : '点击上传实物照片'}
            </p>
            <p className="mt-1 text-xs text-muted">
              {uploadStatus === 'uploading' ? '上传中...' : '支持 JPG/PNG，最大 10MB'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFileChange(e.target.files?.[0] || null)}
          />
        </div>

        {/* Section 1: 基础信息 */}
        <div className="rounded-xl bg-surface-card-dark p-4 space-y-4">
          <h3 className="text-sm font-semibold text-muted">基础信息</h3>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">名称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：老凤祥手镯"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">分类</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setClassification('jewelry'); setSubtype('') }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  classification === 'jewelry'
                    ? 'bg-gold-400 text-on-primary'
                    : 'bg-surface-elevated-dark text-muted'
                }`}
              >
                首饰
              </button>
              <button
                type="button"
                onClick={() => { setClassification('gold_bar'); setSubtype('') }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  classification === 'gold_bar'
                    ? 'bg-gold-400 text-on-primary'
                    : 'bg-surface-elevated-dark text-muted'
                }`}
              >
                金条
              </button>
            </div>
          </div>

          {classification === 'jewelry' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">首饰类型</label>
              <div className="flex flex-wrap gap-2">
                {JEWELRY_SUBTYPES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubtype(s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      subtype === s
                        ? 'bg-gold-400 text-on-primary'
                        : 'bg-surface-elevated-dark text-muted active:bg-surface-card-dark'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: 价格信息 */}
        <div className="rounded-xl bg-surface-card-dark p-4 space-y-4">
          <h3 className="text-sm font-semibold text-muted">价格信息</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">克重 (g)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="0.00"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">下单克价 (¥/g)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={purchasePricePerGram}
                onChange={e => {
                  setPurchasePricePerGram(e.target.value)
                  setLastEdited('perGram')
                  if (w > 0) setPurchasePrice(String(Math.ceil(Number(e.target.value) * w)))
                }}
                placeholder="0.00"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">买入总价 (¥)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={purchasePrice}
              onChange={e => {
                setPurchasePrice(e.target.value)
                setLastEdited('total')
                if (w > 0) setPurchasePricePerGram(String(Math.ceil(Number(e.target.value) / w)))
              }}
              placeholder="0.00"
              required
              className={inputClass}
            />
            {w > 0 && ppg > 0 && (
              <p className="mt-1.5 text-xs text-muted">
                {lastEdited === 'perGram' ? '已根据克价自动计算总价' : '已根据总价自动计算克价'}
              </p>
            )}
          </div>
        </div>

        {/* Section 3: 其他信息 */}
        <div className="rounded-xl bg-surface-card-dark p-4 space-y-4">
          <h3 className="text-sm font-semibold text-muted">其他信息</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">买入日期</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">存放地点</label>
              <div className="flex gap-1 rounded-lg bg-surface-elevated-dark p-1">
                {(['深圳市', '汕头市'] as const).map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setLocation(city)}
                    className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
                      location === city
                        ? 'bg-gold-400 text-on-primary'
                        : 'text-muted'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">备注</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="选填"
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-gold-400 py-3 text-sm font-semibold text-on-primary transition-colors active:bg-gold-500 disabled:opacity-50"
        >
          {submitting ? '保存中...' : isEdit ? '保存修改' : '添加资产'}
        </button>
      </form>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'bg-trading-up text-on-dark'
              : 'bg-trading-down text-on-dark'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  )
}
