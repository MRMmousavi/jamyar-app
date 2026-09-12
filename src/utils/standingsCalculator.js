/**
 * تابع محاسبه خودکار و زنده جدول رده‌بندی
 * @param {Array} teams - لیست تمام نام تیم‌ها
 * @param {Array} matches - لیست تمام مسابقات انجام‌شده یا در حال برگزاری
 */
export function calculateStandings(teams, matches = []) {
  // مقداردهی اولیه آمار هر تیم
  const table = {}

  teams.forEach((team) => {
    table[team] = {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0, // گل زده
      ga: 0, // گل خورده
      gd: 0, // تفاضل گل
      pts: 0, // امتیاز
    }
  })

  // پیمایش بازی‌ها و محاسبه نتایج ثبت‌شده
  matches.forEach((match) => {
    const { homeTeam, awayTeam, homeScore, awayScore } = match

    // شرط اینکه نتیجه معتبر و ثبت شده باشه
    if (
      homeScore !== null &&
      awayScore !== null &&
      homeScore !== '' &&
      awayScore !== '' &&
      !isNaN(homeScore) &&
      !isNaN(awayScore) &&
      table[homeTeam] &&
      table[awayTeam]
    ) {
      const hScore = parseInt(homeScore, 10)
      const aScore = parseInt(awayScore, 10)

      // آمار میزبان
      table[homeTeam].played += 1
      table[homeTeam].gf += hScore
      table[homeTeam].ga += aScore
      table[homeTeam].gd = table[homeTeam].gf - table[homeTeam].ga

      // آمار میهمان
      table[awayTeam].played += 1
      table[awayTeam].gf += aScore
      table[awayTeam].ga += hScore
      table[awayTeam].gd = table[awayTeam].gf - table[awayTeam].ga

      // بررسی برنده / مساوی
      if (hScore > aScore) {
        table[homeTeam].won += 1
        table[homeTeam].pts += 3
        table[awayTeam].lost += 1
      } else if (hScore < aScore) {
        table[awayTeam].won += 1
        table[awayTeam].pts += 3
        table[homeTeam].lost += 1
      } else {
        table[homeTeam].drawn += 1
        table[homeTeam].pts += 1
        table[awayTeam].drawn += 1
        table[awayTeam].pts += 1
      }
    }
  })

  // تبدیل شیء به آرایه و رتبه‌بندی استاندارد فوتبالی:
  // ۱. بیشترین امتیاز -> ۲. بهترین تفاضل گل -> ۳. بیشترین گل زده -> ۴. الفبایی
  return Object.values(table).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.gd !== a.gd) return b.gd - a.gd
    if (b.gf !== a.gf) return b.gf - a.gf
    return a.team.localeCompare(b.team)
  })
}
