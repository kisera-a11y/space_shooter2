// Local high-score table, persisted in the browser via localStorage —
// no backend, consistent with the rest of the project. Scores are
// per-device/per-browser, not a shared/global leaderboard.
const STORAGE_KEY = 'starDefenderHighScores';
const MAX_ENTRIES = 10;

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(scores) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Private browsing, storage disabled, quota exceeded, etc. — the
    // table just won't persist across sessions; nothing else depends on it.
  }
}

export function getHighScores() {
  return loadStored();
}

// Records a completed run and reports where it landed. rank is 1-based
// among the stored table plus this run; when it doesn't make the top
// MAX_ENTRIES, rank still reflects that (e.g. 11) even though only the
// top list is actually persisted.
export function recordScore(score, wave) {
  const existing = loadStored();
  const entry = { score, wave };
  const combined = [...existing, entry].sort((a, b) => b.score - a.score);
  const rank = combined.indexOf(entry) + 1;
  const topScores = combined.slice(0, MAX_ENTRIES);

  persist(topScores);

  return { rank, madeTopList: rank <= MAX_ENTRIES, topScores };
}
