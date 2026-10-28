// 每項 1~5 分，權重加總 100，總分 = Σ(分數 × 權重) / 5（需與 firestore.rules 公式一致）
export const TEACHER_CRITERIA = [
  { id: 'technical', label: '技術能力', weight: 30 },
  { id: 'creativity', label: '創意與設計', weight: 25 },
  { id: 'completion', label: '完成度', weight: 20 },
  { id: 'presentation', label: '展示與表達', weight: 15 },
  { id: 'collaboration', label: '團隊合作', weight: 10 },
];

export const PEER_CRITERIA = [
  { id: 'quality', label: '作品品質', weight: 40 },
  { id: 'innovation', label: '創新性', weight: 30 },
  { id: 'teamwork', label: '合作態度', weight: 30 },
];

export function calcTotal(criteria, scores) {
  return criteria.reduce((sum, c) => sum + (Number(scores[c.id]) * c.weight) / 5, 0);
}

export const average = (stat) => (stat && stat.count > 0 ? Math.round((stat.sum / stat.count) * 10) / 10 : null);
