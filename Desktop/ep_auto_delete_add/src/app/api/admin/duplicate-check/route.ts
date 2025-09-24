import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import Fuse from 'fuse.js'

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json()

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // ep_data와 delect 테이블에서 모든 제목 조회
    const [epDataResult, delectResult] = await Promise.all([
      supabase.from('ep_data').select('id, title'),
      supabase.from('delect').select('id, title')
    ])

    if (epDataResult.error) {
      console.error('ep_data 조회 오류:', epDataResult.error)
      return NextResponse.json({ error: 'ep_data 조회 중 오류가 발생했습니다.' }, { status: 500 })
    }

    if (delectResult.error) {
      console.error('delect 조회 오류:', delectResult.error)
      return NextResponse.json({ error: 'delect 조회 중 오류가 발생했습니다.' }, { status: 500 })
    }

    // 모든 제목을 하나의 배열로 합치기
    const allTitles = [
      ...(epDataResult.data || []).map(item => ({ ...item, source: 'ep_data' })),
      ...(delectResult.data || []).map(item => ({ ...item, source: 'delect' }))
    ]

    if (allTitles.length === 0) {
      return NextResponse.json({
        success: true,
        exactMatch: false,
        similarMatches: [],
        message: '데이터베이스에 제목이 없습니다.'
      })
    }

    // 정확한 일치 확인
    const exactMatch = allTitles.find(item => 
      item.title.toLowerCase().trim() === title.toLowerCase().trim()
    )

    if (exactMatch) {
      return NextResponse.json({
        success: true,
        exactMatch: true,
        match: {
          id: exactMatch.id,
          title: exactMatch.title,
          source: exactMatch.source
        },
        similarMatches: [],
        message: '정확히 일치하는 제목을 찾았습니다.'
      })
    }

    // Fuse.js를 사용한 유사도 검색
    const fuse = new Fuse(allTitles, {
      keys: ['title'],
      threshold: 0.6, // 0.6 이하의 점수만 유사한 것으로 간주
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    })

    const searchResults = fuse.search(title)
    const similarMatches = searchResults.slice(0, 5).map(result => ({
      id: result.item.id,
      title: result.item.title,
      source: result.item.source,
      similarity: Math.round((1 - result.score!) * 100), // 점수를 퍼센트로 변환
      score: result.score
    }))

    return NextResponse.json({
      success: true,
      exactMatch: false,
      similarMatches,
      message: similarMatches.length > 0 
        ? `${similarMatches.length}개의 유사한 제목을 찾았습니다.`
        : '유사한 제목을 찾지 못했습니다.'
    })

  } catch (error) {
    console.error('중복 검사 오류:', error)
    return NextResponse.json({ 
      error: '중복 검사 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}
