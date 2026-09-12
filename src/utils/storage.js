const STORAGE_KEY = 'TOURNAMENT_APP_DATA_V1'

// دریافت همه تورنمنت‌ها
export function getAllTournaments() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error('خطا در خواندن داده‌ها از حافظه:', err)
    return []
  }
}

// ذخیره یا به‌روزرسانی یک تورنمنت
export function saveTournamentToStorage(tournament) {
  try {
    const all = getAllTournaments()
    const index = all.findIndex((t) => t.id === tournament.id)

    let updated
    if (index >= 0) {
      updated = [...all]
      updated[index] = { ...tournament, updatedAt: new Date().toISOString() }
    } else {
      updated = [
        {
          ...tournament,
          id: tournament.id || `tr_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...all,
      ]
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch (err) {
    console.error('خطا در ذخیره تورنمنت:', err)
    return []
  }
}

// حذف یک تورنمنت
export function deleteTournamentFromStorage(id) {
  try {
    const all = getAllTournaments()
    const filtered = all.filter((t) => t.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return filtered
  } catch (err) {
    console.error('خطا در حذف تورنمنت:', err)
    return []
  }
}
