import { test } from 'node:test';
import assert from 'node:assert/strict';
import vectors from '../../assets/models/clip-text-vectors.json';
import { CATEGORY_THRESHOLDS, classifyCategoryScores, cosineSimilarity, FIXTURE_CATEGORIES, scoreCategoryEmbedding, uncertainCategory } from './localCategoryPolicy';
const scores = (values: Partial<Record<string, number>>) => [...FIXTURE_CATEGORIES, 'OTHER'].map(category => ({ category,
  score: values[category] ?? .1, promptScores: [values[category] ?? .1, values[category] ?? .1, values[category] ?? .1] }));
test('MATCH is expected visible category with a distinct lead', () => {
  assert.equal(classifyCategoryScores('SINK', scores({SINK:.32,TOILET:.20})).outcome, 'MATCH');
});
test('CLEAR_MISMATCH requires strong other fixture with gap and multiple prompt votes', () => {
  const result = classifyCategoryScores('SINK', scores({TOILET:.38,SINK:.17}));
  assert.equal(result.outcome, 'CLEAR_MISMATCH'); assert.equal(result.predictedCategory, 'TOILET');
  const disagree = scores({TOILET:.38,SINK:.17}); disagree[0].promptScores = [.39,.12,.16];
  assert.equal(classifyCategoryScores('SINK', disagree).outcome, 'UNCERTAIN');
});
test('close categories, poor confidence, distractors and unsupported inventory remain UNCERTAIN', () => {
  assert.equal(classifyCategoryScores('SINK', scores({SINK:.30,TOILET:.29})).outcome, 'UNCERTAIN');
  assert.equal(classifyCategoryScores('SINK', scores({SINK:.16})).outcome, 'UNCERTAIN');
  assert.equal(classifyCategoryScores('SINK', scores({OTHER:.5})).outcome, 'UNCERTAIN');
  assert.equal(classifyCategoryScores('URINAL', scores({TOILET:.45})).reason, 'UNSUPPORTED_CATEGORY');
});
test('missing categories, invalid scores and runtime errors never become MATCH', () => {
  assert.equal(classifyCategoryScores('SINK', [{category:'SINK',score:.9,promptScores:[.9]}]).outcome, 'UNCERTAIN');
  assert.equal(classifyCategoryScores('SINK', scores({SINK:NaN})).reason, 'INVALID_MODEL_OUTPUT');
  assert.equal(uncertainCategory('SINK','LOCAL_CHECK_TIMEOUT',25000).outcome,'UNCERTAIN');
  assert.throws(() => cosineSimilarity([1],[1]),/dimensions/);
  assert.throws(() => cosineSimilarity(new Array(512).fill(0),new Array(512).fill(0)),/embedding/);
});
test('pinned real text embeddings have complete inventory, distractors and unit norms', () => {
  assert.equal(vectors.revision,'d15189d7028b43f1d3e65039190477f6af591c2a');
  assert.equal(vectors.visionSha256,'583fd1110a514667812fee7d684952aaf82a99b959760c8d7dca7e0ab9839299');
  for (const category of [...FIXTURE_CATEGORIES,'OTHER']) assert.ok(vectors.prompts.filter(p=>p.category===category).length>=3);
  for(const prompt of vectors.prompts) { assert.equal(prompt.embedding.length,512);
    assert.ok(Math.abs(prompt.embedding.reduce((s,v)=>s+v*v,0)-1)<1e-5); }
  const ranked=scoreCategoryEmbedding(vectors.prompts[3].embedding,vectors.prompts);
  assert.equal([...ranked].sort((a,b)=>b.score-a.score)[0].category,'SINK');
  assert.ok(CATEGORY_THRESHOLDS.mismatchExpectedGap > CATEGORY_THRESHOLDS.matchMargin);
});
