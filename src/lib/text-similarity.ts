/**
 * 텍스트 유사도 검사 유틸리티 함수들
 * Levenshtein 거리와 다양한 유사도 알고리즘을 사용
 */

/**
 * Levenshtein 거리 계산 함수
 * 두 문자열 간의 최소 편집 거리를 계산합니다.
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  
  if (len1 === 0) return len2
  if (len2 === 0) return len1
  
  // 2차원 배열 생성
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0))
  
  // 초기값 설정
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }
  
  // 동적 프로그래밍으로 거리 계산
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // 삭제
        matrix[i][j - 1] + 1,      // 삽입
        matrix[i - 1][j - 1] + cost // 대체
      )
    }
  }
  
  return matrix[len1][len2]
}

/**
 * 문자열 정규화 함수
 * 유사도 검사 전에 문자열을 정규화합니다.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
}

/**
 * Levenshtein 거리 기반 유사도 계산
 * 0과 1 사이의 값으로 반환 (1이 완전히 동일)
 */
export function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeText(str1)
  const normalized2 = normalizeText(str2)
  
  const distance = levenshteinDistance(normalized1, normalized2)
  const maxLength = Math.max(normalized1.length, normalized2.length)
  
  if (maxLength === 0) return 1
  
  return 1 - (distance / maxLength)
}

/**
 * Jaccard 유사도 계산
 * 집합 기반 유사도 계산 (단어 단위)
 */
export function calculateJaccardSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeText(str1)
  const normalized2 = normalizeText(str2)
  
  const set1 = new Set(normalized1.split(' ').filter(word => word.length > 0))
  const set2 = new Set(normalized2.split(' ').filter(word => word.length > 0))
  
  const intersection = new Set([...set1].filter(word => set2.has(word)))
  const union = new Set([...set1, ...set2])
  
  if (union.size === 0) return 1
  
  return intersection.size / union.size
}

/**
 * 코사인 유사도 계산 (간단한 버전)
 * 단어 빈도 기반 유사도 계산
 */
export function calculateCosineSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeText(str1)
  const normalized2 = normalizeText(str2)
  
  const words1 = normalized1.split(' ').filter(word => word.length > 0)
  const words2 = normalized2.split(' ').filter(word => word.length > 0)
  
  // 모든 고유 단어 수집
  const allWords = new Set([...words1, ...words2])
  
  // 단어 빈도 벡터 생성
  const vector1 = Array.from(allWords).map(word => words1.filter(w => w === word).length)
  const vector2 = Array.from(allWords).map(word => words2.filter(w => w === word).length)
  
  // 내적 계산
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0)
  
  // 벡터 크기 계산
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0))
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0))
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0
  
  return dotProduct / (magnitude1 * magnitude2)
}

/**
 * 종합 유사도 점수 계산
 * 여러 알고리즘의 가중 평균을 사용
 */
export function calculateOverallSimilarity(str1: string, str2: string): number {
  const levenshtein = calculateLevenshteinSimilarity(str1, str2)
  const jaccard = calculateJaccardSimilarity(str1, str2)
  const cosine = calculateCosineSimilarity(str1, str2)
  
  // 가중치: Levenshtein 40%, Jaccard 35%, Cosine 25%
  return (levenshtein * 0.4) + (jaccard * 0.35) + (cosine * 0.25)
}

/**
 * 중복 검사 결과 인터페이스
 */
export interface DuplicateCheckResult {
  title: string
  similarity: number
  matchedTitle: string
  matchedId: string | number
  matchType: 'active' | 'deleted'
  matchDate: string
  algorithm: 'levenshtein' | 'jaccard' | 'cosine' | 'overall'
}

/**
 * 제목 중복 검사 함수
 */
export function checkTitleDuplicates(
  newTitle: string,
  existingTitles: Array<{
    title: string
    id: string | number
    type: 'active' | 'deleted'
    date: string
  }>,
  threshold: number = 0.8
): DuplicateCheckResult[] {
  const results: DuplicateCheckResult[] = []
  
  for (const existingTitle of existingTitles) {
    const similarity = calculateOverallSimilarity(newTitle, existingTitle.title)
    
    if (similarity >= threshold) {
      results.push({
        title: newTitle,
        similarity,
        matchedTitle: existingTitle.title,
        matchedId: existingTitle.id,
        matchType: existingTitle.type,
        matchDate: existingTitle.date,
        algorithm: 'overall'
      })
    }
  }
  
  // 유사도 순으로 정렬 (높은 순)
  return results.sort((a, b) => b.similarity - a.similarity)
}

/**
 * 여러 제목에 대한 일괄 중복 검사
 */
export function checkMultipleTitleDuplicates(
  newTitles: string[],
  existingTitles: Array<{
    title: string
    id: string | number
    type: 'active' | 'deleted'
    date: string
  }>,
  threshold: number = 0.8
): Map<string, DuplicateCheckResult[]> {
  const results = new Map<string, DuplicateCheckResult[]>()
  
  for (const newTitle of newTitles) {
    const duplicates = checkTitleDuplicates(newTitle, existingTitles, threshold)
    if (duplicates.length > 0) {
      results.set(newTitle, duplicates)
    }
  }
  
  return results
}

/**
 * 유사도 임계값별 분류
 */
export function categorizeBySimilarity(results: DuplicateCheckResult[]): {
  exact: DuplicateCheckResult[]      // 95% 이상
  high: DuplicateCheckResult[]       // 85-95%
  medium: DuplicateCheckResult[]     // 70-85%
  low: DuplicateCheckResult[]        // 70% 미만
} {
  return {
    exact: results.filter(r => r.similarity >= 0.95),
    high: results.filter(r => r.similarity >= 0.85 && r.similarity < 0.95),
    medium: results.filter(r => r.similarity >= 0.70 && r.similarity < 0.85),
    low: results.filter(r => r.similarity < 0.70)
  }
}
