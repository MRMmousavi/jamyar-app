import React from 'react'

export function StandingsTable({ standings, title, format = 'league' }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        جدولی برای نمایش وجود ندارد.
      </div>
    )
  }

  const isSwiss = format === 'uclNew'

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
      {title && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            {title}
          </h3>
          {isSwiss && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                ۱ تا ۸ (صعود مستقیم)
              </span>
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                ۹ تا ۲۴ (پلی‌آف)
              </span>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-4">تیم</th>
              <th className="py-3 px-3 text-center">بازی</th>
              <th className="py-3 px-3 text-center">برد</th>
              <th className="py-3 px-3 text-center">مساوی</th>
              <th className="py-3 px-3 text-center">باخت</th>
              <th className="py-3 px-3 text-center">زده</th>
              <th className="py-3 px-3 text-center">خورده</th>
              <th className="py-3 px-3 text-center">تفاضل</th>
              <th className="py-3 px-4 text-center font-bold text-slate-200">امتیاز</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {standings.map((row, index) => {
              const teamName = typeof row.team === 'string' ? row.team : row.team?.name || 'تیم ناشناس'

              // منطق تشخیص رتبه و رنگ‌بندی سهمیه‌ها
              let rankBadgeClass = 'text-slate-400'
              let rowBgClass = 'hover:bg-slate-800/40'

              if (isSwiss) {
                if (index < 8) {
                  // رتبه‌های ۱ تا ۸: صعود مستقیم
                  rankBadgeClass = 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                  rowBgClass = 'bg-emerald-950/10 hover:bg-emerald-900/20'
                } else if (index >= 8 && index < 24) {
                  // رتبه‌های ۹ تا ۲۴: پلی‌آف
                  rankBadgeClass = 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                  rowBgClass = 'bg-sky-950/10 hover:bg-sky-900/20'
                }
              } else {
                // لیگ معمولی: رتبه‌های ۱ تا ۴
                if (index === 0) {
                  rankBadgeClass = 'bg-amber-500 text-slate-950 font-bold'
                } else if (index < 4) {
                  rankBadgeClass = 'bg-slate-800 text-slate-200 font-bold'
                }
              }

              return (
                <tr key={index} className={`transition-colors duration-150 ${rowBgClass}`}>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${rankBadgeClass}`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                    {teamName}
                  </td>
                  <td className="py-3.5 px-3 text-center text-slate-400">{row.played ?? 0}</td>
                  <td className="py-3.5 px-3 text-center text-slate-300">{row.won ?? 0}</td>
                  <td className="py-3.5 px-3 text-center text-slate-400">{row.drawn ?? 0}</td>
                  <td className="py-3.5 px-3 text-center text-slate-400">{row.lost ?? 0}</td>
                  <td className="py-3.5 px-3 text-center text-slate-400">{row.goalsFor ?? 0}</td>
                  <td className="py-3.5 px-3 text-center text-slate-400">{row.goalsAgainst ?? 0}</td>
                  <td
                    className={`py-3.5 px-3 text-center font-medium ${
                      (row.goalDifference ?? 0) > 0
                        ? 'text-emerald-400'
                        : (row.goalDifference ?? 0) < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference ?? 0}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-base text-indigo-400">
                    {row.points ?? 0}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
