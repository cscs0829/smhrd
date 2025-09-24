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

// API 키 목록 조회
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    console.error('API 키 조회 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// API 키 생성
export async function POST(req: NextRequest) {
  try {
    const { provider, name, description, apiKey } = await req.json()

    if (!provider || !name || !apiKey) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 })
    }

    // API 키 유효성 검사
    if (provider === 'openai' && !apiKey.startsWith('sk-')) {
      return NextResponse.json({ error: 'OpenAI API 키는 sk-로 시작해야 합니다.' }, { status: 400 })
    }

    if (provider === 'gemini' && !apiKey.startsWith('AI')) {
      return NextResponse.json({ error: 'Gemini API 키는 AI로 시작해야 합니다.' }, { status: 400 })
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        provider,
        name,
        description,
        api_key: apiKey, // 실제 환경에서는 암호화 필요
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    console.error('API 키 생성 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// API 키 수정
export async function PUT(req: NextRequest) {
  try {
    const { id, name, description, apiKey, isActive } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'API 키 ID가 필요합니다.' }, { status: 400 })
    }

    const updateData: Partial<{
      name: string
      description?: string
      api_key: string
      is_active: boolean
    }> = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (apiKey) updateData.api_key = apiKey
    if (isActive !== undefined) updateData.is_active = isActive

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    console.error('API 키 수정 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// API 키 삭제
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'API 키 ID가 필요합니다.' }, { status: 400 })
    }

    const supabase = getSupabase()
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'API 키가 삭제되었습니다.' })
  } catch (error: unknown) {
    console.error('API 키 삭제 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

