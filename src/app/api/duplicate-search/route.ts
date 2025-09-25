import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { distance } from 'fastest-levenshtein'

interface EpDataItem {
  id: string
  title: string
}

interface DeleteDataItem {
  id: string
  title: string
}

interface SimilarityResult {
  id: string
  title: string
  source: 'ep_data' | 'delect'
  similarity: number
  distance: number
}

// 문자열 유사도 계산 함수 (0-100% 범위)
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 100
  
  const dist = distance(str1, str2)
  const similarity = ((maxLength - dist) / maxLength) * 100
  return Math.round(similarity * 100) / 100 // 소수점 2자리까지
}

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbetujraqbeegqtjghpl.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZXR1anJhcWJlZWdxdGpnaHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTA0OTgsImV4cCI6MjA3MzU4NjQ5OH0.CqgOMrgEN4xyE5CZKHy7uuKuEQQcUoHrU-_6L1Dh-Tw'
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// 페이지네이션으로 모든 데이터를 가져오는 함수 (Supabase 1000개 제한 우회)
async function fetchAllData(supabase: SupabaseClient, tableName: string, selectColumns: string, searchTitle: string) {
  const allData: unknown[] = []
  const pageSize = 1000 // Supabase 기본 제한
  let from = 0
  let hasMore = true
  let pageCount = 0
  const maxPages = 50 // 최대 50페이지 (50,000개) 제한으로 무한 루프 방지

  console.log(`${tableName} 테이블에서 데이터 로딩 시작 (페이지 크기: ${pageSize})`)

  while (hasMore && pageCount < maxPages) {
    try {
      let query = supabase
        .from(tableName)
        .select(selectColumns)
        .range(from, from + pageSize - 1)
        .order('id', { ascending: true })

      // 검색어가 있으면 ilike 조건 추가
      if (searchTitle) {
        query = query.ilike('title', `%${searchTitle}%`)
      }

      const { data, error } = await query

      if (error) {
        if (error.code === 'PGRST116') { // 데이터가 없을 때
          console.log(`${tableName} 테이블에 데이터가 없음`)
        } else {
          console.error(`${tableName} 페이지 ${pageCount + 1} 검색 오류:`, error)
        }
        break
      }

      if (!data || data.length === 0) {
        console.log(`${tableName} 테이블 검색 완료: ${allData.length}개 데이터 발견`)
        hasMore = false
      } else {
        allData.push(...data)
        from += pageSize
        pageCount++
        console.log(`${tableName} 페이지 ${pageCount}: ${data.length}개 데이터 추가 (총 ${allData.length}개)`)
        
        // 실제로 가져온 데이터가 페이지 크기보다 적으면 마지막 페이지
        if (data.length < pageSize) {
          hasMore = false
        }
      }
    } catch (error) {
      console.error(`${tableName} 페이지 ${pageCount + 1} 처리 중 오류:`, error)
      break
    }
  }

  if (pageCount >= maxPages) {
    console.warn(`${tableName} 테이블: 최대 페이지 수(${maxPages})에 도달하여 중단됨. ${allData.length}개 데이터만 로딩됨`)
  }

  console.log(`${tableName} 테이블 최종 로딩 완료: ${allData.length}개 데이터 (${pageCount}페이지)`)
  return allData
}

export async function POST(request: NextRequest) {
  try {
    const { titles } = await request.json()
    console.log('중복 검색 요청:', { titlesCount: titles?.length, titles: titles?.slice(0, 3) })

    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json(
        { error: '검사할 제목 목록을 제공해주세요' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    
    // 데이터베이스 샘플 데이터 확인
    const { data: sampleData, error: sampleError } = await supabase
      .from('ep_data')
      .select('id, title')
      .limit(3)
    
    console.log('데이터베이스 샘플 데이터:', { 
      error: sampleError, 
      count: sampleData?.length,
      samples: sampleData?.map(item => item.title)
    })
    
    const duplicates = []

    // 각 테이블의 데이터 존재 여부 확인
    console.log('테이블 데이터 존재 여부 확인 중...')
    
    const { count: epDataCount } = await supabase
      .from('ep_data')
      .select('*', { count: 'exact', head: true })
    
    const { count: delectDataCount } = await supabase
      .from('delect')
      .select('*', { count: 'exact', head: true })
    
    console.log(`테이블 데이터 수: EP 데이터 ${epDataCount}개, Delect 테이블 ${delectDataCount}개`)
    
    // 데이터가 있는 테이블만 로딩 (대용량 데이터 고려)
    let allEpData: EpDataItem[] = []
    let allDeleteData: DeleteDataItem[] = []
    
    if (epDataCount && epDataCount > 0) {
      console.log(`EP 데이터 로딩 중... (총 ${epDataCount}개 예상)`)
      if (epDataCount <= 5000) {
        // 5000개 이하면 한 번에 로딩
        allEpData = await fetchAllData(supabase, 'ep_data', 'id, title', '') as EpDataItem[]
        console.log(`EP 데이터 로딩 완료: ${allEpData.length}개`)
      } else {
        console.log(`EP 데이터가 많아서(${epDataCount}개) 배치 처리로 진행합니다`)
        allEpData = await fetchAllData(supabase, 'ep_data', 'id, title', '') as EpDataItem[]
        console.log(`EP 데이터 로딩 완료: ${allEpData.length}개 (일부만 로딩됨)`)
      }
    } else {
      console.log('EP 데이터 테이블이 비어있어 건너뜀')
    }
    
    if (delectDataCount && delectDataCount > 0) {
      console.log(`Delect 데이터 로딩 중... (총 ${delectDataCount}개 예상)`)
      allDeleteData = await fetchAllData(supabase, 'delect', 'id, title', '') as DeleteDataItem[]
      console.log(`Delect 데이터 로딩 완료: ${allDeleteData.length}개`)
    } else {
      console.log('Delect 데이터 테이블이 비어있어 건너뜀')
    }

    // 각 제목에 대해 중복 검사
    for (const titleData of titles) {
      const title = titleData.title || titleData
      
      if (!title || typeof title !== 'string') {
        console.log('유효하지 않은 제목:', titleData)
        continue
      }

      console.log(`제목 검색 중: "${title}"`)

      // 유사도 계산 (50% 이상 유사한 것만)
      const similarResults: SimilarityResult[] = []
      
      // EP 데이터와 유사도 계산 (데이터가 있는 경우만)
      if (allEpData.length > 0) {
        console.log(`EP 데이터 ${allEpData.length}개와 유사도 계산 중...`)
        let epProcessed = 0
        allEpData.forEach((item) => {
          epProcessed++
          if (epProcessed % 1000 === 0) {
            console.log(`EP 데이터 처리 진행률: ${epProcessed}/${allEpData.length}`)
          }
          
          const similarity = calculateSimilarity(title, item.title)
          if (similarity >= 50) { // 50% 이상 유사한 것만
            similarResults.push({
              id: item.id,
              title: item.title,
              source: 'ep_data',
              similarity,
              distance: distance(title, item.title)
            })
          }
        })
        console.log(`EP 데이터 유사도 계산 완료: ${similarResults.filter(r => r.source === 'ep_data').length}개 유사 항목 발견`)
      }

      // Delect 테이블과 유사도 계산 (데이터가 있는 경우만)
      if (allDeleteData.length > 0) {
        console.log(`Delect 데이터 ${allDeleteData.length}개와 유사도 계산 중...`)
        let delectProcessed = 0
        allDeleteData.forEach((item) => {
          delectProcessed++
          if (delectProcessed % 1000 === 0) {
            console.log(`Delect 데이터 처리 진행률: ${delectProcessed}/${allDeleteData.length}`)
          }
          
          const similarity = calculateSimilarity(title, item.title)
          if (similarity >= 50) { // 50% 이상 유사한 것만
            similarResults.push({
              id: item.id,
              title: item.title,
              source: 'delect',
              similarity,
              distance: distance(title, item.title)
            })
          }
        })
        console.log(`Delect 데이터 유사도 계산 완료: ${similarResults.filter(r => r.source === 'delect').length}개 유사 항목 발견`)
      }

      // 유사도 순으로 정렬 (높은 순)
      similarResults.sort((a, b) => b.similarity - a.similarity)

      console.log(`유사한 제목 발견: ${similarResults.length}개`)

      if (similarResults.length > 0) {
        // 정확한 일치 (100% 유사도) 찾기
        const exactMatches = similarResults.filter(item => item.similarity === 100)
        
        // 가장 유사한 제목 (정확한 일치가 있으면 그것, 없으면 가장 유사한 것)
        const mostSimilar = exactMatches.length > 0 ? exactMatches[0] : similarResults[0]

        duplicates.push({
          title,
          count: similarResults.length,
          exactMatches: exactMatches.length,
          mostSimilar: {
            title: mostSimilar.title,
            similarity: mostSimilar.similarity,
            source: mostSimilar.source
          },
          items: similarResults.slice(0, 10) // 상위 10개만 표시
        })
      }
    }

    console.log('최종 중복 검색 결과:', { 
      totalChecked: titles.length, 
      duplicatesFound: duplicates.length,
      tablesUsed: {
        epData: allEpData.length > 0 ? `${allEpData.length}개` : '비어있음',
        delectData: allDeleteData.length > 0 ? `${allDeleteData.length}개` : '비어있음'
      },
      duplicates: duplicates.map(d => ({ title: d.title, count: d.count }))
    })

    return NextResponse.json({
      duplicates,
      totalChecked: titles.length,
      duplicatesFound: duplicates.length
    })

  } catch (error) {
    console.error('중복 검색 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
