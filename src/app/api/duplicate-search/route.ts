import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

interface EpDataItem {
  id: string
  title: string
}

interface DeleteDataItem {
  product_id: string
  title: string
}

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbetujraqbeegqtjghpl.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZXR1anJhcWJlZWdxdGpnaHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTA0OTgsImV4cCI6MjA3MzU4NjQ5OH0.CqgOMrgEN4xyE5CZKHy7uuKuEQQcUoHrU-_6L1Dh-Tw'
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// 페이지네이션으로 모든 데이터를 가져오는 함수
async function fetchAllData(supabase: SupabaseClient, tableName: string, selectColumns: string, searchTitle: string) {
  const allData: unknown[] = []
  const pageSize = 1000 // Supabase 기본 제한
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select(selectColumns)
      .ilike('title', `%${searchTitle}%`)
      .range(from, from + pageSize - 1)
      .order('id', { ascending: true })

    if (error) {
      if (error.code !== 'PGRST116') { // 데이터가 없을 때는 에러가 아님
        console.error(`${tableName} 검색 오류:`, error)
      }
      break
    }

    if (!data || data.length === 0) {
      hasMore = false
    } else {
      allData.push(...data)
      from += pageSize
      
      // 실제로 가져온 데이터가 페이지 크기보다 적으면 마지막 페이지
      if (data.length < pageSize) {
        hasMore = false
      }
    }
  }

  return allData
}

export async function POST(request: NextRequest) {
  try {
    const { titles } = await request.json()

    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json(
        { error: '검사할 제목 목록을 제공해주세요' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const duplicates = []

    // 각 제목에 대해 중복 검사
    for (const titleData of titles) {
      const title = titleData.title || titleData
      
      if (!title || typeof title !== 'string') {
        continue
      }

      // 페이지네이션으로 모든 EP 데이터 검색
      const epData = await fetchAllData(supabase, 'ep_data', 'id, title', title) as EpDataItem[]

      // 페이지네이션으로 모든 삭제 테이블 데이터 검색
      const deleteData = await fetchAllData(supabase, 'delete', 'product_id, title', title) as DeleteDataItem[]

      // 중복이 발견된 경우
      if (epData.length > 0 || deleteData.length > 0) {
        const duplicateItems: Array<{
          id: string
          title: string
          source: 'ep_data' | 'delete'
        }> = []
        
        // EP 데이터에서 발견된 중복들
        if (epData.length > 0) {
          epData.forEach((item) => {
            const epItem = item as EpDataItem
            duplicateItems.push({
              id: epItem.id,
              title: epItem.title,
              source: 'ep_data'
            })
          })
        }

        // 삭제 테이블에서 발견된 중복들
        if (deleteData.length > 0) {
          deleteData.forEach((item) => {
            const deleteItem = item as DeleteDataItem
            duplicateItems.push({
              id: deleteItem.product_id,
              title: deleteItem.title,
              source: 'delete'
            })
          })
        }

        duplicates.push({
          title,
          count: duplicateItems.length,
          items: duplicateItems
        })
      }
    }

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
