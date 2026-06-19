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
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPath, setPhotoPath] = useState<string | null>(null)
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'failed'>('idle')
  const [submitting, setSubmitting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

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
      setExistingPhoto(a.photo)
      setPhotoPath(a.photo)
    })
  }, [id])

  const handleFileChange = async (file: File | null) => {
    if (!file) return
    setPhoto(file)
    setPhotoPath(null)
    setUploadStatus('uploading')
    setError('')
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
      setSaveSuccess(true)
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setSubmitting(false)
      setError(err instanceof Error ? err.message : '保存失败')
    }
  }

  const photoSrc = photo
    ? URL.createObjectURL(photo)
    : photoPath || existingPhoto

  let photoOverlay: string | null = null
  if (uploadStatus === 'uploading') photoOverlay = 'animate-pulse bg-white/10'
  if (uploadStatus === 'failed') photoOverlay = 'bg-trading-down/30'

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
        <div
          className="flex flex-col items-center gap-2 rounded-xl bg-surface-card-dark p-6 active:bg-surface-elevated-dark"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoSrc ? (
            <div className="relative flex size-20 items-center justify-center rounded-xl bg-gold-100/10 text-3xl overflow-hidden">
              <img src={photoSrc} alt="" className="size-20 rounded-xl object-cover ring-1 ring-hairline-on-dark" />
              {photoOverlay && (
                <div className={`absolute inset-0 ${photoOverlay}`} />
              )}
            </div>
          ) : (
            <div className="flex size-20 items-center justify-center rounded-xl bg-gold-100/10 text-3xl">📷</div>
          )}
          <p className="text-xs text-muted">
            {!photoSrc ? '点击上传图片' : '点击更换图片'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFileChange(e.target.files?.[0] || null)}
          />
        </div>

        <div className="rounded-xl bg-surface-card-dark p-4 space-y-4">
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
          </div>

          {w > 0 && ppg > 0 && (
            <div className="rounded-lg bg-gold-400/10 p-3 text-center text-xs text-muted">
              {lastEdited === 'perGram' ? '已根据克价自动计算总价' : '已根据总价自动计算克价'}
            </div>
          )}

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

        {error && (
          <p className="rounded-lg bg-trading-down/10 px-3 py-2 text-center text-xs text-trading-down">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting || saveSuccess}
          className={`w-full rounded-md py-3 text-sm font-semibold transition-colors disabled:opacity-50 ${
            saveSuccess ? 'bg-trading-up text-on-dark' : 'bg-gold-400 text-on-primary active:bg-gold-500'
          }`}
        >
          {saveSuccess ? '✓ 保存成功' : submitting ? '保存中...' : isEdit ? '保存修改' : '添加资产'}
        </button>
      </form>
    </div>
  )
}
