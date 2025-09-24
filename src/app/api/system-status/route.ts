import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    // 데이터베이스 연결 상태 확인
    let dbStatus = false
    let dbError = null
    try {
      const { error } = await supabase
        .from('ep_data')
        .select('count')
        .limit(1)
      dbStatus = !error
      dbError = error?.message
    } catch (err) {
      dbError = err instanceof Error ? err.message : 'Unknown error'
    }

    // AI 서비스 상태 확인 (API 키 존재 여부)
    let aiServiceStatus = false
    let aiServiceError = null
    try {
      const { data: apiKeys, error } = await supabase
        .from('api')
        .select('id, is_active')
        .eq('is_active', true)
      
      if (error) {
        aiServiceError = error.message
      } else {
        aiServiceStatus = apiKeys && apiKeys.length > 0
      }
    } catch (err) {
      aiServiceError = err instanceof Error ? err.message : 'Unknown error'
    }

    // 파일 처리 준비 상태 (기본적으로 항상 준비됨)
    const fileProcessingStatus = true

    return NextResponse.json({
      success: true,
      system: {
        database: {
          status: dbStatus,
          error: dbError,
          message: dbStatus ? '연결 정상' : '연결 실패'
        },
        aiService: {
          status: aiServiceStatus,
          error: aiServiceError,
          message: aiServiceStatus ? '활성화됨' : '비활성화됨'
        },
        fileProcessing: {
          status: fileProcessingStatus,
          message: '준비 완료'
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
