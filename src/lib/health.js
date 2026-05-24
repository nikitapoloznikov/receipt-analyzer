export const RATINGS = ['healthy', 'neutral', 'unhealthy'];

export function nextRating(r) {
  const i = RATINGS.indexOf(r);
  return RATINGS[(i + 1) % RATINGS.length];
}

export function ratingEmoji(r) {
  return r === 'healthy' ? '🟢' : r === 'unhealthy' ? '🔴' : '🟡';
}

export function healthSummary(items) {
  const counts = { healthy: 0, neutral: 0, unhealthy: 0 };
  for (const it of items || []) counts[it.health_rating] = (counts[it.health_rating] || 0) + 1;
  return counts;
}
