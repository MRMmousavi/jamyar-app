import React from 'react'
import { Trophy } from 'lucide-react'

export function KnockoutBracket({ rounds, onScoreChange }) {
  if (!rounds || rounds.length === 0) return null

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
      {rounds.map((round) => (
        <div key={round.id} className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              {round.title}
            </h3>
            <span className="text-[11px] text-slate-500">{round.matches.length} مسابقه</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {round.matches.map((match) => {
              const isTwoLegged = !!match.isTwoLegged
              const leg1Home = match.homeScore
              const leg1Away = match.awayScore
              const leg2Home = match.homeScoreLeg2 // گل awayTeam در برگشت
              const leg2Away = match.awayScoreLeg2 // گل homeTeam در برگشت

              // مجموع
              const aggHome = leg1Home !== null && leg2Away !== null ? leg1Home + leg2Away : null
              const aggAway = leg1Away !== null && leg2Home !== null ? leg1Away + leg2Home : null
              const isAggTied = aggHome !== null && aggAway !== null && aggHome === aggAway
              const isSingleTied = !isTwoLegged && leg1Home !== null && leg1Away !== null && leg1Home === leg1Away

              return (
                <div
                  key={match.id}
                  className={`bg-slate-900 border rounded-xl p-3 text-xs space-y-2 transition ${
                    match.winner ? 'border-amber-500/30' : 'border-slate-800'
                  }`}
                >
                  {/* بازی رفت (یا تک بازی) */}
                  <div className="flex items-center justify-between">
                    <span className="w-1/3 truncate text-right font-medium text-slate-200">
                      {match.homeTeam}
                    </span>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        placeholder={isTwoLegged ? 'رفت' : '-'}
                        value={match.homeScore ?? ''}
                        onChange={(e) =>
                          onScoreChange(round.id, match.id, 'homeScore', e.target.value)
                        }
                        className="w-10 h-7 bg-slate-950 border border-slate-700 rounded text-center text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                      />
                      <span className="text-slate-500 font-bold">:</span>
                      <input
                        type="number"
                        min="0"
                        placeholder={isTwoLegged ? 'رفت' : '-'}
                        value={match.awayScore ?? ''}
                        onChange={(e) =>
                          onScoreChange(round.id, match.id, 'awayScore', e.target.value)
                        }
                        className="w-10 h-7 bg-slate-950 border border-slate-700 rounded text-center text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <span className="w-1/3 truncate text-left font-medium text-slate-200">
                      {match.awayTeam}
                    </span>
                  </div>

                  {/* بازی برگشت (در صورت ۲ مرحله‌ای بودن) */}
                  {isTwoLegged && (
                    <div className="flex items-center justify-between border-t border-slate-800/40 pt-2">
                      <span className="w-1/3 truncate text-right text-[11px] text-slate-400">
                        {match.awayTeam} (میزبان)
                      </span>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          placeholder="برگشت"
                          value={match.homeScoreLeg2 ?? ''}
                          onChange={(e) =>
                            onScoreChange(round.id, match.id, 'homeScoreLeg2', e.target.value)
                          }
                          className="w-10 h-7 bg-slate-950 border border-slate-700 rounded text-center text-cyan-400 font-bold font-mono focus:border-cyan-500 focus:outline-none"
                        />
                        <span className="text-slate-500 font-bold">:</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="برگشت"
                          value={match.awayScoreLeg2 ?? ''}
                          onChange={(e) =>
                            onScoreChange(round.id, match.id, 'awayScoreLeg2', e.target.value)
                          }
                          className="w-10 h-7 bg-slate-950 border border-slate-700 rounded text-center text-cyan-400 font-bold font-mono focus:border-cyan-500 focus:outline-none"
                        />
                      </div>

                      <span className="w-1/3 truncate text-left text-[11px] text-slate-400">
                        {match.homeTeam} (میهمان)
                      </span>
                    </div>
                  )}

                  {/* نمایش مجموع نتایج */}
                  {isTwoLegged && aggHome !== null && aggAway !== null && (
                    <div className="flex items-center justify-between bg-slate-950/80 px-2.5 py-1 rounded-lg text-[11px]">
                      <span className="text-slate-400">مجموع دو بازی:</span>
                      <span className="font-mono font-bold text-amber-300">
                        {match.homeTeam} {aggHome} - {aggAway} {match.awayTeam}
                      </span>
                    </div>
                  )}

                  {/* پنالتی در صورت تساوی */}
                  {(isAggTied || isSingleTied) && (
                    <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg mt-1">
                      <span className="text-[11px] text-rose-400 font-semibold">ضربات پنالتی:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          placeholder="پنالتی"
                          value={match.homePenalty ?? ''}
                          onChange={(e) =>
                            onScoreChange(round.id, match.id, 'homePenalty', e.target.value)
                          }
                          className="w-10 h-6 bg-slate-950 border border-rose-500/40 rounded text-center text-rose-400 font-bold font-mono text-xs focus:outline-none"
                        />
                        <span className="text-rose-400 font-bold">:</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="پنالتی"
                          value={match.awayPenalty ?? ''}
                          onChange={(e) =>
                            onScoreChange(round.id, match.id, 'awayPenalty', e.target.value)
                          }
                          className="w-10 h-6 bg-slate-950 border border-rose-500/40 rounded text-center text-rose-400 font-bold font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* برنده نهایی */}
                  {match.winner && (
                    <div className="text-center pt-1 border-t border-slate-800/50">
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        صعودکننده: {match.winner}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
