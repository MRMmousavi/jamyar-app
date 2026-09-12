import React, { useState, useEffect } from 'react'
import { TournamentForm } from './components/TournamentForm'
import { StandingsTable } from './components/StandingsTable'
import { SavedTournamentsList } from './components/SavedTournamentsList'
import { KnockoutBracket } from './components/KnockoutBracket'
import {
  generateRoundRobinFixtures,
  generateKnockoutFixtures,
  generateGroupStageFixtures,
  generateSwissFixtures,
  updateKnockoutProgress,
  generateGroupPlayoffs,
  generateSwissPlayoffs,
} from './utils/fixtureGenerator'
import { calculateStandings } from './utils/standingsCalculator'
import {
  getAllTournaments,
  saveTournamentToStorage,
  deleteTournamentFromStorage,
} from './utils/storage'
import {
  Trophy,
  ArrowRight,
  TableProperties,
  CalendarDays,
  CheckCircle2,
  Swords,
  Sparkles,
} from 'lucide-react'

function App() {
  const [tournamentsList, setTournamentsList] = useState([])
  const [tournament, setTournament] = useState(null)
  const [activeTab, setActiveTab] = useState('fixtures')

  useEffect(() => {
    setTournamentsList(getAllTournaments())
  }, [])

  const handleCreateTournament = ({
  title,
  type,
  doubleRound,
  twoLeggedKnockout,
  teams,
}) => {
    let fixtures = null
    let groups = null
    let playoffs = null

    if (type === 'roundRobin') {
      fixtures = generateRoundRobinFixtures(teams, doubleRound)
} else if (type === 'knockout') {
  fixtures = generateKnockoutFixtures(teams, twoLeggedKnockout)
    } else if (type === 'uclClassic') {
      groups = generateGroupStageFixtures(teams)
    } else if (type === 'uclNew') {
      fixtures = generateSwissFixtures(teams, 8)
    }

const newTournament = {
  id: `tr_${Date.now()}`,
  title,
  type,
  doubleRound,
  twoLeggedKnockout,
  teams,
  fixtures,
  groups,
  playoffs,
}


    const updatedList = saveTournamentToStorage(newTournament)
    setTournamentsList(updatedList)
    setTournament(newTournament)
    setActiveTab('fixtures')
  }

  // ثبت نتیجه در مسابقات حذفی و آپدیت خودکار دورهای بعد
  const handleKnockoutScoreChange = (roundId, matchId, field, value) => {
    setTournament((prev) => {
      const isPlayoff = !!prev.playoffs
      const targetRounds = isPlayoff ? prev.playoffs : prev.fixtures

      const updatedRounds = targetRounds.map((round) => {
        if (round.id !== roundId) return round
        return {
          ...round,
          matches: round.matches.map((m) => {
            if (m.id !== matchId) return m
            return {
              ...m,
              [field]: value === '' ? null : Math.max(0, parseInt(value, 10) || 0),
            }
          }),
        }
      })

      // محاسبه خودکار پیشروی برندگان به مراحل بعد
      const progressedRounds = updateKnockoutProgress(updatedRounds)
      const updated = isPlayoff
        ? { ...prev, playoffs: progressedRounds }
        : { ...prev, fixtures: progressedRounds }

      const newSavedList = saveTournamentToStorage(updated)
      setTournamentsList(newSavedList)
      return updated
    })
  }

  // ثبت نتیجه در لیگ و سوئیسی
  const handleScoreChange = (roundId, matchId, field, value) => {
    setTournament((prev) => {
      const updatedFixtures = prev.fixtures.map((round) => {
        if (round.id !== roundId) return round
        return {
          ...round,
          matches: round.matches.map((m) => {
            if (m.id !== matchId) return m
            return {
              ...m,
              [field]: value === '' ? null : Math.max(0, parseInt(value, 10) || 0),
            }
          }),
        }
      })
      const updated = { ...prev, fixtures: updatedFixtures }
      const newSavedList = saveTournamentToStorage(updated)
      setTournamentsList(newSavedList)
      return updated
    })
  }

  // ثبت نتیجه در گروه‌ها
  const handleGroupScoreChange = (groupId, roundId, matchId, field, value) => {
    setTournament((prev) => {
      const updatedGroups = prev.groups.map((group) => {
        if (group.id !== groupId) return group
        return {
          ...group,
          rounds: group.rounds.map((round) => {
            if (round.id !== roundId) return round
            return {
              ...round,
              matches: round.matches.map((m) => {
                if (m.id !== matchId) return m
                return {
                  ...m,
                  [field]: value === '' ? null : Math.max(0, parseInt(value, 10) || 0),
                }
              }),
            }
          }),
        }
      })
      const updated = { ...prev, groups: updatedGroups }
      const newSavedList = saveTournamentToStorage(updated)
      setTournamentsList(newSavedList)
      return updated
    })
  }

  // تولید مرحله حذفی برای فرمت‌های گروهی و سوئیسی
  const handleStartPlayoffs = () => {
    if (!tournament) return
    let playoffRounds = null

    if (tournament.type === 'uclClassic') {
      const standingsMap = {}
      tournament.groups.forEach((g) => {
        const matches = g.rounds.flatMap((r) => r.matches)
        standingsMap[g.id] = calculateStandings(g.teams, matches)
      })
      playoffRounds = generateGroupPlayoffs(tournament.groups, standingsMap)
    } else if (tournament.type === 'uclNew') {
      const allMatches = tournament.fixtures.flatMap((r) => r.matches)
      const standings = calculateStandings(tournament.teams, allMatches)
      playoffRounds = generateSwissPlayoffs(standings, 8)
    }

    if (playoffRounds) {
      const updated = { ...tournament, playoffs: playoffRounds }
      const newSavedList = saveTournamentToStorage(updated)
      setTournamentsList(newSavedList)
      setTournament(updated)
      setActiveTab('playoffs')
    }
  }

  const handleDeleteTournament = (id) => {
    if (window.confirm('آیا از حذف این تورنمنت اطمینان دارید؟')) {
      const updatedList = deleteTournamentFromStorage(id)
      setTournamentsList(updatedList)
      if (tournament?.id === id) setTournament(null)
    }
  }

  const getAllMatches = () => {
    if (!tournament?.fixtures) return []
    return tournament.fixtures.flatMap((round) => round.matches)
  }

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      {!tournament ? (
        <div className="w-full">
          <TournamentForm onCreateTournament={handleCreateTournament} />
          <SavedTournamentsList
            tournaments={tournamentsList}
            onSelectTournament={(t) => {
              setTournament(t)
              setActiveTab('fixtures')
            }}
            onDeleteTournament={handleDeleteTournament}
          />
        </div>
      ) : (
        <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* نوار بالا */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-400" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white">{tournament.title}</h1>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    ذخیره‌شده
                  </span>
                </div>
                <p className="text-xs text-slate-400">تعداد تیم‌ها: {tournament.teams.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(tournament.type === 'uclClassic' || tournament.type === 'uclNew') && !tournament.playoffs && (
                <button
                  onClick={handleStartPlayoffs}
                  className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-3 py-2 rounded-xl transition cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  شروع مرحله حذفی
                </button>
              )}
              <button
                onClick={() => setTournament(null)}
                className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                منو
              </button>
            </div>
          </div>

          {/* تب‌ها */}
          <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('fixtures')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'fixtures'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              {tournament.type === 'knockout' ? 'مراحل جام حذفی' : 'برنامه و نتایج'}
            </button>

            {tournament.type !== 'knockout' && (
              <button
                onClick={() => setActiveTab('standings')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'standings'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TableProperties className="w-4 h-4" />
                جدول رده‌بندی
              </button>
            )}

            {tournament.playoffs && (
              <button
                onClick={() => setActiveTab('playoffs')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'playoffs'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Swords className="w-4 h-4" />
                مرحله حذفی (پلی‌آف)
              </button>
            )}
          </div>

          {/* ۱. تب جدول رده‌بندی */}
          {activeTab === 'standings' && tournament.type !== 'knockout' && (
            <div className="space-y-6">
              {tournament.type === 'uclClassic' ? (
                <div className="space-y-4">
                  {tournament.groups.map((group) => {
                    const groupMatches = group.rounds.flatMap((r) => r.matches)
                    const standings = calculateStandings(group.teams, groupMatches)
                    return (
                      <StandingsTable
                        key={group.id}
                        title={`جدول ${group.name}`}
                        standings={standings}
                      />
                    )
                  })}
                </div>
              ) : (
  <StandingsTable
    title={`جدول کلی ${tournament.title}`}
    standings={calculateStandings(tournament.teams, getAllMatches())}
    format={tournament.type}
  />
)}
            </div>
          )}

          {/* ۲. تب پلی‌آف حذفی (برای چمپ قدیم و جدید) */}
          {activeTab === 'playoffs' && tournament.playoffs && (
            <KnockoutBracket
              rounds={tournament.playoffs}
              onScoreChange={handleKnockoutScoreChange}
            />
          )}

          {/* ۳. تب بازی‌ها / جام حذفی خالص */}
          {activeTab === 'fixtures' && (
            <>
              {tournament.type === 'knockout' ? (
                <KnockoutBracket
                  rounds={tournament.fixtures}
                  onScoreChange={handleKnockoutScoreChange}
                />
              ) : tournament.groups ? (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                  {tournament.groups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-bold text-amber-400">{group.name}</h3>
                        <span className="text-[11px] text-slate-500">
                          {group.teams.join('، ')}
                        </span>
                      </div>
                      {group.rounds.map((round) => (
                        <div key={round.id} className="space-y-2">
                          <div className="text-xs text-slate-400 font-medium">{round.title}:</div>
                          {round.matches.map((match) => (
                            <div
                              key={match.id}
                              className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800/40 text-xs"
                            >
                              <span className="w-1/3 truncate text-right font-medium text-slate-200">
                                {match.homeTeam}
                              </span>

                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={match.homeScore ?? ''}
                                  onChange={(e) =>
                                    handleGroupScoreChange(
                                      group.id,
                                      round.id,
                                      match.id,
                                      'homeScore',
                                      e.target.value
                                    )
                                  }
                                  className="w-10 h-8 bg-slate-950 border border-slate-700 rounded text-center text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                                />
                                <span className="text-slate-500 font-bold px-1">:</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={match.awayScore ?? ''}
                                  onChange={(e) =>
                                    handleGroupScoreChange(
                                      group.id,
                                      round.id,
                                      match.id,
                                      'awayScore',
                                      e.target.value
                                    )
                                  }
                                  className="w-10 h-8 bg-slate-950 border border-slate-700 rounded text-center text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                                />
                              </div>

                              <span className="w-1/3 truncate text-left font-medium text-slate-200">
                                {match.awayTeam}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {tournament.fixtures?.map((round) => (
                    <div
                      key={round.id}
                      className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3"
                    >
                      <h3 className="text-sm font-semibold text-amber-400">{round.title}</h3>
                      <div className="space-y-2">
                        {round.matches.map((match) => (
                          <div
                            key={match.id}
                            className="flex items-center justify-between bg-slate-900 px-4 py-2.5 rounded-lg border border-slate-800/50 text-sm"
                          >
                            <span className="w-1/3 truncate text-right font-medium text-slate-200">
                              {match.homeTeam}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={match.homeScore ?? ''}
                                onChange={(e) =>
                                  handleScoreChange(
                                    round.id,
                                    match.id,
                                    'homeScore',
                                    e.target.value
                                  )
                                }
                                className="w-11 h-8 bg-slate-950 border border-slate-700 rounded-md text-center text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                              />
                              <span className="text-slate-500 font-bold px-1">:</span>
                              <input
                                type="number"
                                min="0"
                                value={match.awayScore ?? ''}
                                onChange={(e) =>
                                  handleScoreChange(
                                    round.id,
                                    match.id,
                                    'awayScore',
                                    e.target.value
                                  )
                                }
                                className="w-11 h-8 bg-slate-950 border border-slate-700 rounded-md text-center text-amber-400 font-bold font-mono focus:border-amber-500 focus:outline-none"
                              />
                            </div>

                            <span className="w-1/3 truncate text-left font-medium text-slate-200">
                              {match.awayTeam}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  )
}

export default App
