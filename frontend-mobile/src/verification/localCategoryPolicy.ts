export const LOCAL_CATEGORY_MODEL_VERSION = 'clip-vit-b32-int8-d15189d-category-v1';
export const FIXTURE_CATEGORIES = ['TOILET', 'SINK', 'MIRROR', 'BIN', 'FLOOR'] as const;
export type FixtureCategory = typeof FIXTURE_CATEGORIES[number];
export type CategoryOutcome = 'MATCH' | 'CLEAR_MISMATCH' | 'UNCERTAIN';
export type CategoryScore = { category: string; score: number; promptScores: number[] };
export type LocalCategoryResult = {
  outcome: CategoryOutcome; expectedCategory: string; predictedCategory: string | null;
  score: number | null; margin: number | null; durationMs: number; modelVersion: string; reason: string;
};
// Cosine similarities are NOT calibrated probabilities. Keep disagreements/close-ups uncertain.
export const CATEGORY_THRESHOLDS = Object.freeze({
  matchScore: .23, matchMargin: .025,
  mismatchScore: .30, mismatchExpectedGap: .09, mismatchRunnerUpGap: .05,
  mismatchPromptGap: .07, mismatchPromptVotes: 2,
});
export function uncertainCategory(expected: string, reason: string, durationMs = 0): LocalCategoryResult {
  return { outcome: 'UNCERTAIN', expectedCategory: expected.toUpperCase(), predictedCategory: null,
    score: null, margin: null, durationMs, modelVersion: LOCAL_CATEGORY_MODEL_VERSION, reason };
}
export function classifyCategoryScores(expected: string, scores: CategoryScore[], durationMs = 0): LocalCategoryResult {
  const base = uncertainCategory(expected, 'LOW_CONFIDENCE', durationMs);
  if (!FIXTURE_CATEGORIES.includes(base.expectedCategory as FixtureCategory)) return { ...base, reason: 'UNSUPPORTED_CATEGORY' };
  if (scores.length < 2 || scores.some(s => !Number.isFinite(s.score) || !s.promptScores.length || s.promptScores.some(v => !Number.isFinite(v)))) {
    return { ...base, reason: 'INVALID_MODEL_OUTPUT' };
  }
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const top = sorted[0], runnerUp = sorted[1], wanted = scores.find(s => s.category === base.expectedCategory);
  if (!wanted || ![...FIXTURE_CATEGORIES, 'OTHER'].every(category => scores.some(score => score.category === category))) {
    return { ...base, reason: 'INVALID_MODEL_OUTPUT' };
  }
  const result = { ...base, predictedCategory: top.category, score: top.score, margin: top.score - wanted.score };
  if (top.category === base.expectedCategory && top.score >= CATEGORY_THRESHOLDS.matchScore && top.score - runnerUp.score >= CATEGORY_THRESHOLDS.matchMargin) {
    return { ...result, outcome: 'MATCH', reason: 'EXPECTED_CATEGORY_VISIBLE' };
  }
  const promptVotes = top.promptScores.filter(score => score - wanted.score >= CATEGORY_THRESHOLDS.mismatchPromptGap).length;
  if (FIXTURE_CATEGORIES.includes(top.category as FixtureCategory) && top.category !== base.expectedCategory &&
    top.score >= CATEGORY_THRESHOLDS.mismatchScore && top.score - wanted.score >= CATEGORY_THRESHOLDS.mismatchExpectedGap &&
    top.score - runnerUp.score >= CATEGORY_THRESHOLDS.mismatchRunnerUpGap && promptVotes >= CATEGORY_THRESHOLDS.mismatchPromptVotes) {
    return { ...result, outcome: 'CLEAR_MISMATCH', reason: 'DIFFERENT_FIXTURE_CATEGORY_VISIBLE' };
  }
  return result;
}
export function cosineSimilarity(a: ArrayLike<number>, b: ArrayLike<number>): number {
  if (a.length !== 512 || b.length !== 512) throw new Error('Invalid CLIP embedding dimensions');
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
  if (!Number.isFinite(dot) || aa === 0 || bb === 0) throw new Error('Invalid CLIP embedding');
  return dot / Math.sqrt(aa * bb);
}
export function scoreCategoryEmbedding(image: ArrayLike<number>, prompts: Array<{category: string; embedding: number[]}>): CategoryScore[] {
  const grouped = new Map<string, number[]>();
  for (const prompt of prompts) {
    const values = grouped.get(prompt.category) ?? [];
    values.push(cosineSimilarity(image, prompt.embedding)); grouped.set(prompt.category, values);
  }
  return [...grouped].map(([category, promptScores]) => ({ category, promptScores,
    score: promptScores.reduce((sum, value) => sum + value, 0) / promptScores.length }));
}
