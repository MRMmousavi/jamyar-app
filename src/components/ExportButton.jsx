import React, { useState } from 'react'
import { toPng } from 'html-to-image'

export default function ExportButton({ targetRef, fileName = 'mpc-fixture-table' }) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (!targetRef.current) return
    try {
      setLoading(true)

      const dataUrl = await toPng(targetRef.current, {
        quality: 0.95,
        backgroundColor: '#0f172a', // پس‌زمینه تیره هماهنگ با تم
        pixelRatio: 2, // کیفیت ۲ برابری و فوق‌العاده شارپ
        cacheBust: true,
      })

      // دانلود خودکار عکس
      const link = document.createElement('a')
      link.download = `${fileName}_${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('خطا در گرفتن خروجی تصویر:', err)
      alert('مشکلی در ایجاد خروجی تصویر پیش آمد!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          در حال ساخت تصویر...
        </span>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>دانلود عکس (PNG)</span>
        </>
      )}
    </button>
  )
}
