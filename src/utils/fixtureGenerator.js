/**
 * شافل تصادفی آرایه
 */
function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * ایجاد مسابقات لیگ دوره‌ای
 */
export function generateRoundRobinFixtures(teams, doubleRound = false) {
  let list = [...teams]
  if (list.length % 2 !== 0) {
    list.push('استراحت')
  }

  const n = list.length
  const totalRounds = n - 1
  const matchesPerRound = n / 2
  const fixtures = []

  let currentList = [...list]

  for (let r = 0; r < totalRounds; r++) {
    const roundMatches = []
    for (let m = 0; m < matchesPerRound; m++) {
      const home = currentList[m]
      const away = currentList[n - 1 - m]

      if (home !== 'استراحت' && away !== 'استراحت') {
        roundMatches.push({
          id: `m_${r + 1}_${m + 1}`,
          homeTeam: home,
          awayTeam: away,
          homeScore: null,
          awayScore: null,
        })
      }
    }

    fixtures.push({
      id: `round_${r + 1}`,
      title: `هفته ${r + 1}`,
      matches: roundMatches,
    })

    const fixed = currentList[0]
    const rest = currentList.slice(1)
    rest.unshift(rest.pop())
    currentList = [fixed, ...rest]
  }

  if (doubleRound) {
    const returnFixtures = fixtures.map((round, idx) => {
      const roundNum = totalRounds + idx + 1
      return {
        id: `round_${roundNum}`,
        title: `هفته ${roundNum} (دور برگشت)`,
        matches: round.matches.map((m, mIdx) => ({
          id: `m_${roundNum}_${mIdx + 1}`,
          homeTeam: m.awayTeam,
          awayTeam: m.homeTeam,
          homeScore: null,
          awayScore: null,
        })),
      }
    })
    return [...fixtures, ...returnFixtures]
  }

  return fixtures
}

/**
 * نام‌گذاری مراحل حذفی
 */
function getRoundTitle(numMatches) {
  switch (numMatches) {
    case 1:
      return 'فینال'
    case 2:
      return 'نیمه‌نهایی'
    case 4:
      return 'یک‌چهارم نهایی'
    case 8:
      return 'یک‌هشتم نهایی'
    case 16:
      return 'یک‌شانزدهم نهایی'
    default:
      return `مرحله ${numMatches * 2} تیمی`
  }
}

/**
 * ایجاد جام حذفی خالص (با پشتیبانی از رفت و برگشت)
 */
export function generateKnockoutFixtures(teams, twoLegged = false) {
  let count = 1
  while (count < teams.length) {
    count *= 2
  }

  const shuffled = shuffleArray(teams)
  while (shuffled.length < count) {
    shuffled.push('استراحت')
  }

  const rounds = []
  let currentMatchesCount = count / 2
  let roundIdx = 1

  const firstRoundMatches = []
  for (let i = 0; i < currentMatchesCount; i++) {
    const home = shuffled[i * 2]
    const away = shuffled[i * 2 + 1]
    const isBye = home === 'استراحت' || away === 'استراحت'

    firstRoundMatches.push({
      id: `ko_1_${i + 1}`,
      homeTeam: home,
      awayTeam: away,
      isTwoLegged: twoLegged && currentMatchesCount > 1 && !isBye,
      homeScore: isBye ? (home !== 'استراحت' ? 1 : 0) : null,
      awayScore: isBye ? (away !== 'استراحت' ? 1 : 0) : null,
      homeScoreLeg2: null,
      awayScoreLeg2: null,
      homePenalty: null,
      awayPenalty: null,
      winner: isBye ? (home !== 'استراحت' ? home : away) : null,
    })
  }

  rounds.push({
    id: `round_${roundIdx}`,
    title: getRoundTitle(currentMatchesCount),
    matches: firstRoundMatches,
  })

  while (currentMatchesCount > 1) {
    roundIdx++
    currentMatchesCount /= 2
    const nextMatches = []
    const isFinal = currentMatchesCount === 1

    for (let i = 0; i < currentMatchesCount; i++) {
      nextMatches.push({
        id: `ko_${roundIdx}_${i + 1}`,
        homeTeam: 'نامشخص',
        awayTeam: 'نامشخص',
        isTwoLegged: twoLegged && !isFinal,
        homeScore: null,
        awayScore: null,
        homeScoreLeg2: null,
        awayScoreLeg2: null,
        homePenalty: null,
        awayPenalty: null,
        winner: null,
      })
    }

    rounds.push({
      id: `round_${roundIdx}`,
      title: getRoundTitle(currentMatchesCount),
      matches: nextMatches,
    })
  }

  return updateKnockoutProgress(rounds)
}

/**
 * تعیین برنده بازی (بر اساس تک‌بازی یا رفت و برگشت)
 */
function determineMatchWinner(m) {
  if (m.winner && (m.homeTeam === 'استراحت' || m.awayTeam === 'استراحت')) {
    return m.winner
  }
  if (!m.homeTeam || !m.awayTeam || m.homeTeam === 'نامشخص' || m.awayTeam === 'نامشخص') {
    return null
  }

  if (m.isTwoLegged) {
    // بازی رفت و برگشت
    const hasLeg1 = m.homeScore !== null && m.awayScore !== null
    const hasLeg2 = m.homeScoreLeg2 !== null && m.awayScoreLeg2 !== null

    if (!hasLeg1 || !hasLeg2) return null

    // در دور رفت: home میزبان بود. در دور برگشت: away میزبان بود (homeScoreLeg2 گل away، awayScoreLeg2 گل home)
    const team1Total = m.homeScore + (m.awayScoreLeg2 ?? 0)
    const team2Total = m.awayScore + (m.homeScoreLeg2 ?? 0)

    if (team1Total > team2Total) return m.homeTeam
    if (team2Total > team1Total) return m.awayTeam

    // در صورت تساوی در مجموع، ضربات پنالتی
    if (m.homePenalty !== null && m.awayPenalty !== null) {
      if (m.homePenalty > m.awayPenalty) return m.homeTeam
      if (m.awayPenalty > m.homePenalty) return m.awayTeam
    }
    return null
  } else {
    // تک بازی
    if (m.homeScore === null || m.awayScore === null) return null
    if (m.homeScore > m.awayScore) return m.homeTeam
    if (m.awayScore > m.homeScore) return m.awayTeam
    if (m.homePenalty !== null && m.awayPenalty !== null) {
      if (m.homePenalty > m.awayPenalty) return m.homeTeam
      if (m.awayPenalty > m.homePenalty) return m.awayTeam
    }
    return null
  }
}

/**
 * انتقال برندگان به دور بعد
 */
export function updateKnockoutProgress(rounds) {
  const updatedRounds = rounds.map((r) => ({
    ...r,
    matches: r.matches.map((m) => ({ ...m })),
  }))

  for (let r = 0; r < updatedRounds.length - 1; r++) {
    const currentRound = updatedRounds[r]
    const nextRound = updatedRounds[r + 1]

    for (let m = 0; m < currentRound.matches.length; m++) {
      const match = currentRound.matches[m]
      const winner = determineMatchWinner(match)
      match.winner = winner

      const nextMatchIdx = Math.floor(m / 2)
      const isHomeTeam = m % 2 === 0

      if (nextRound.matches[nextMatchIdx]) {
        if (isHomeTeam) {
          nextRound.matches[nextMatchIdx].homeTeam = winner || 'نامشخص'
        } else {
          nextRound.matches[nextMatchIdx].awayTeam = winner || 'نامشخص'
        }
      }
    }
  }

  // چک کردن برنده فینال
  const finalRound = updatedRounds[updatedRounds.length - 1]
  if (finalRound && finalRound.matches[0]) {
    finalRound.matches[0].winner = determineMatchWinner(finalRound.matches[0])
  }

  return updatedRounds
}

/**
 * چمپیونزلیگ کلاسیک
 */
export function generateGroupStageFixtures(teams) {
  const shuffled = shuffleArray(teams)
  const groupCount = Math.max(1, Math.floor(teams.length / 4))
  const groups = []

  for (let i = 0; i < groupCount; i++) {
    const groupName = `گروه ${String.fromCharCode(65 + i)}`
    const groupTeams = []

    for (let j = i; j < shuffled.length; j += groupCount) {
      groupTeams.push(shuffled[j])
    }

    const rounds = generateRoundRobinFixtures(groupTeams, true)
    groups.push({
      id: `group_${i + 1}`,
      name: groupName,
      teams: groupTeams,
      rounds,
    })
  }

  return groups
}

/**
 * ساخت پلی‌آف برای چمپیونزلیگ گروهی
 */
export function generateGroupPlayoffs(groups, standingsMap, twoLegged = true) {
  const qualifiers = []
  groups.forEach((g) => {
    const standing = standingsMap[g.id] || []
    if (standing[0]) qualifiers.push(standing[0].team)
    if (standing[1]) qualifiers.push(standing[1].team)
  })

  return generateKnockoutFixtures(qualifiers, twoLegged)
}

/**
 * تولید قرعه‌کشی لیگ سوئیسی
 */
export function generateSwissFixtures(teams, totalRounds = 8) {
  const fixtures = []
  const matchupsCount = {}

  teams.forEach((t) => {
    matchupsCount[t] = new Set()
  })

  for (let r = 1; r <= totalRounds; r++) {
    const roundMatches = []
    const available = shuffleArray(teams)

    while (available.length >= 2) {
      const home = available.pop()
      let awayIdx = -1

      for (let i = 0; i < available.length; i++) {
        if (!matchupsCount[home].has(available[i])) {
          awayIdx = i
          break
        }
      }

      if (awayIdx === -1) awayIdx = 0

      const away = available.splice(awayIdx, 1)[0]
      matchupsCount[home].add(away)
      matchupsCount[away].add(home)

      roundMatches.push({
        id: `sw_${r}_${roundMatches.length + 1}`,
        homeTeam: home,
        awayTeam: away,
        homeScore: null,
        awayScore: null,
      })
    }

    fixtures.push({
      id: `round_${r}`,
      title: `هفته ${r}`,
      matches: roundMatches,
    })
  }

  return fixtures
}

/**
 * پلی‌آف فرمت سوئیسی (رتبه ۱-۸ مستقیم، ۹-۲۴ حذفی)
 */
export function generateSwissPlayoffs(standings, directQualifiersCount = 8, twoLegged = true) {
  const sorted = [...standings].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.gd !== a.gd) return b.gd - a.gd
    return b.gf - a.gf
  })

  const top8 = sorted.slice(0, 8).map((s) => s.team)
  const rank9to24 = sorted.slice(8, 24).map((s) => s.team)

  const playoffMatches = []
  for (let i = 0; i < 8; i++) {
    const seeded = rank9to24[i] || 'نامشخص'
    const unseeded = rank9to24[15 - i] || 'نامشخص'

    playoffMatches.push({
      id: `ko_po_${i + 1}`,
      homeTeam: seeded,
      awayTeam: unseeded,
      isTwoLegged: twoLegged,
      homeScore: null,
      awayScore: null,
      homeScoreLeg2: null,
      awayScoreLeg2: null,
      homePenalty: null,
      awayPenalty: null,
      winner: null,
    })
  }

  const round16Matches = []
  for (let i = 0; i < 8; i++) {
    round16Matches.push({
      id: `ko_r16_${i + 1}`,
      homeTeam: top8[i] || 'نامشخص',
      awayTeam: 'نامشخص (برنده پلی‌آف)',
      isTwoLegged: twoLegged,
      homeScore: null,
      awayScore: null,
      homeScoreLeg2: null,
      awayScoreLeg2: null,
      homePenalty: null,
      awayPenalty: null,
      winner: null,
    })
  }

  const qfMatches = []
  for (let i = 0; i < 4; i++) {
    qfMatches.push({
      id: `ko_qf_${i + 1}`,
      homeTeam: 'نامشخص',
      awayTeam: 'نامشخص',
      isTwoLegged: twoLegged,
      homeScore: null,
      awayScore: null,
      homeScoreLeg2: null,
      awayScoreLeg2: null,
      homePenalty: null,
      awayPenalty: null,
      winner: null,
    })
  }

  const sfMatches = []
  for (let i = 0; i < 2; i++) {
    sfMatches.push({
      id: `ko_sf_${i + 1}`,
      homeTeam: 'نامشخص',
      awayTeam: 'نامشخص',
      isTwoLegged: twoLegged,
      homeScore: null,
      awayScore: null,
      homeScoreLeg2: null,
      awayScoreLeg2: null,
      homePenalty: null,
      awayPenalty: null,
      winner: null,
    })
  }

  const finalMatch = [
    {
      id: `ko_fin_1`,
      homeTeam: 'نامشخص',
      awayTeam: 'نامشخص',
      isTwoLegged: false, // فینال همیشه تک‌بازی
      homeScore: null,
      awayScore: null,
      homeScoreLeg2: null,
      awayScoreLeg2: null,
      homePenalty: null,
      awayPenalty: null,
      winner: null,
    },
  ]

  const rounds = [
    { id: 'round_playoff', title: 'پلی‌آف صعود به یک‌هشتم', matches: playoffMatches },
    { id: 'round_16', title: 'یک‌هشتم نهایی', matches: round16Matches },
    { id: 'round_qf', title: 'یک‌چهارم نهایی', matches: qfMatches },
    { id: 'round_sf', title: 'نیمه‌نهایی', matches: sfMatches },
    { id: 'round_final', title: 'فینال', matches: finalMatch },
  ]

  return updateKnockoutProgress(rounds)
}
