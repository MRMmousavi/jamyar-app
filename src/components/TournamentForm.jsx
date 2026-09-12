import React, { useState } from 'react'
import { PlusCircle, Trophy, Shuffle, Sparkles } from 'lucide-react'

export function TournamentForm({ onCreateTournament }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('roundRobin')
  const [doubleRound, setDoubleRound] = useState(false)
  const [twoLeggedKnockout, setTwoLeggedKnockout] = useState(true)
  const [teamInput, setTeamInput] = useState('')
  const [teams, setTeams] = useState([])

  const handleAddTeam = (e) => {
    e.preventDefault()
    const trimmed = teamInput.trim()
    if (trimmed && !teams.includes(trimmed)) {
      setTeams([...teams, trimmed])
      setTeamInput('')
    }
  }

  const handleRemoveTeam = (indexToRemove) => {
    setTeams(teams.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (teams.length < 2) {
      alert('حداقل ۲ تیم برای شروع لازم است!')
      return
    }
    if (!title.trim()) {
      alert('لطفاً عنوان تورنمنت را وارد کنید.')
      return
    }
    onCreateTournament({
      title: title.trim(),
      type,
      doubleRound,
      twoLeggedKnockout,
      teams,
    })
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">ایجاد تورنمنت جدید</h2>
          <p className="text-xs text-slate-400">مشخصات، تیم‌ها و فرمت مسابقات را مشخص کنید</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">عنوان مسابقات</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: لیگ برتر یا چمپیونزلیگ"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">فرمت برگزاری</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'roundRobin', label: 'لیگ دوره‌ای' },
              { id: 'knockout', label: 'جام حذفی خالص' },
              { id: 'uclClassic', label: 'چمپیونزلیگ گروهی' },
              { id: 'uclNew', label: 'سوئیسی (UCL جدید)' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setType(fmt.id)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                  type === fmt.id
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* گزینه‌های رفت و برگشت */}
        <div className="space-y-2 pt-1">
          {type === 'roundRobin' && (
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={doubleRound}
                onChange={(e) => setDoubleRound(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
              />
              برگزاری به صورت رفت و برگشت (دوره‌ای)
            </label>
          )}

          {type !== 'roundRobin' && (
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={twoLeggedKnockout}
                onChange={(e) => setTwoLeggedKnockout(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
              />
              مراحل حذفی رفت و برگشت باشد (فینال تک‌بازی)
            </label>
          )}
        </div>

        {/* افزودن تیم‌ها */}
        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            تیم‌های شرکت‌کننده ({teams.length} تیم)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              placeholder="نام تیم را بنویسید..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
            <button
              type="button"
              onClick={handleAddTeam}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              افزودن
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3 max-h-32 overflow-y-auto">
            {teams.map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg"
              >
                {t}
                <button
                  type="button"
                  onClick={() => handleRemoveTeam(idx)}
                  className="text-slate-500 hover:text-rose-400 font-bold ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          ساخت و شروع تورنمنت
        </button>
      </form>
    </div>
  )
}
