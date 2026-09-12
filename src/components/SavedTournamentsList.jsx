import React from 'react'
import { Trophy, Trash2, ChevronLeft, Calendar, Flame, Layers, ShieldCheck } from 'lucide-react'

export const SavedTournamentsList = ({
  tournaments,
  onSelectTournament,
  onDeleteTournament,
}) => {
  if (!tournaments || tournaments.length === 0) {
    return null
  }

  const getBadge = (type) => {
    switch (type) {
      case 'knockout':
        return { label: 'حذفی', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
      case 'uclClassic':
        return { label: 'گروهی-حذفی', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
      case 'uclNew':
        return { label: 'سوئیسی', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
      default:
        return { label: 'لیگ دوره‌ای', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <Calendar className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-bold text-white">تورنمنت‌های ذخیره‌شده شما</h3>
      </div>

      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {tournaments.map((item) => {
          const badge = getBadge(item.type)
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-slate-700 transition"
            >
              <div
                onClick={() => onSelectTournament(item)}
                className="flex-1 cursor-pointer flex flex-col gap-1 text-right"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-200 hover:text-amber-400 transition">
                    {item.title}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {item.teams?.length || 0} تیم | آخرین تغییر:{' '}
                  {new Date(item.updatedAt || item.createdAt).toLocaleDateString('fa-IR')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDeleteTournament(item.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="حذف تورنمنت"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTournament(item)}
                  className="p-2 bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition cursor-pointer"
                  title="ادامه تورنمنت"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
