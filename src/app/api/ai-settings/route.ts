import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

// AI 모델 설정 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const isDefault = searchParams.get('isDefault') === 'true'

    const supabase = getSupabase()
    let query = supabase.from('ai_model_settings').select('*')
    
    if (isDefault) {
      // 기본 설정만 조회
      query = query.eq('is_default', true)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = isDefault 
      ? await query.single()
      : await query.order('created_at', { ascending: false })

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    console.error('AI 모델 설정 조회 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// AI 모델 설정 생성/수정
export async function POST(req: NextRequest) {
  try {
    const { userId, modelId, provider, apiKeyId, temperature, maxTokens, isDefault } = await req.json()

    if (!modelId || !provider) {
      return NextResponse.json({ error: '모델 ID와 제공업체는 필수입니다.' }, { status: 400 })
    }

    const supabase = getSupabase()

    // 기존 설정이 있는지 확인
    const { data: existingSettings } = await supabase
      .from('ai_model_settings')
      .select('id')
      .eq('user_id', userId || 'default')
      .eq('model_id', modelId)
      .single()

    if (existingSettings) {
      // 기존 설정 업데이트
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('ai_model_settings')
        .update({
          provider,
          api_key_id: apiKeyId,
          temperature: temperature || 0.7,
          max_tokens: maxTokens || 100,
          is_default: isDefault || false
        })
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ data })
    } else {
      // 새 설정 생성
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('ai_model_settings')
        .insert({
          user_id: userId || 'default',
          model_id: modelId,
          provider,
          api_key_id: apiKeyId,
          temperature: temperature || 0.7,
          max_tokens: maxTokens || 100,
          is_default: isDefault || false
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ data })
    }
  } catch (error: unknown) {
    console.error('AI 모델 설정 저장 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

