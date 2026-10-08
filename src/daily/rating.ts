// Elo-like rating: K = 32, scale 400.
export function ratingDelta(rating: number, puzzleRating: number, score: number): number {
  const E = 1 / (1 + Math.pow(10, (puzzleRating - rating) / 400));
  return Math.round(32 * (score - E));
}
