import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  // 환경 변수 우선, 없으면 기본값 사용
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbetujraqbeegqtjghpl.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZXR1anJhcWJlZWdxdGpnaHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTA0OTgsImV4cCI6MjA3MzU4NjQ5OH0.CqgOMrgEN4xyE5CZKHy7uuKuEQQcUoHrU-_6L1Dh-Tw'
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// API 키 목록 조회
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('api')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // 기존 api_keys 테이블 형식으로 
    const transformedData = data?.map(item => ({
      id: item.id,
      provider: item.provider,
      name: item.name,
      description: item.description,
      apiKey: item.api_key,
      isActive: item.is_active,
      createdAt: item.created_at,
      lastUsedAt: item.last_used_at,
      usageCount: item.usage_count || 0
    })) || []

    return NextResponse.json({ data: transformedData })
  } catch (error: unknown) {
    console.error('API 키 조회 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// API 키 생성
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('API 키 생성 요청 데이터:', body)
    
    const { provider, name, description, apiKey } = body

    if (!provider || !name || !apiKey) {
      console.log('필수 필드 누락:', { provider: !!provider, name: !!name, apiKey: !!apiKey })
      return NextResponse.json({ 
        error: '필수 필드가 누락되었습니다.',
        details: { provider: !!provider, name: !!name, apiKey: !!apiKey }
      }, { status: 400 })
    }

    // API 키 유효성 검사 (임시로 비활성화)
    // if (provider === 'openai' && !apiKey.startsWith('sk-') && !apiKey.startsWith('test-')) {
    //   console.log('OpenAI API 키 형식 오류:', apiKey.substring(0, 10) + '...')
    //   return NextResponse.json({ 
    //     error: 'OpenAI API 키는 sk-로 시작해야 합니다.',
    //     details: { received: apiKey.substring(0, 10) + '...' }
    //   }, { status: 400 })
    // }

    // if (provider === 'gemini' && !apiKey.startsWith('AI') && !apiKey.startsWith('test-')) {
    //   console.log('Gemini API 키 형식 오류:', apiKey.substring(0, 10) + '...')
    //   return NextResponse.json({ 
    //     error: 'Gemini API 키는 AI로 시작해야 합니다.',
    //     details: { received: apiKey.substring(0, 10) + '...' }
    //   }, { status: 400 })
    // }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('api')
      .insert({
        provider,
        name,
        description: description || null,
        api_key: apiKey,
        is_active: true,
        is_default: false
      })
      .select()
      .single()

    if (error) {
      console.error('API 키 생성 오류:', error)
      throw error
    }

    // 기존 api_keys 테이블 형식으로 변환
    const transformedData = {
      id: data.id,
      provider: data.provider,
      name: data.name,
      description: data.description,
      apiKey: data.api_key,
      isActive: data.is_active,
      createdAt: data.created_at,
      lastUsedAt: data.last_used_at,
      usageCount: data.usage_count || 0
    }

    return NextResponse.json({ data: transformedData })
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
      .from('api')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 기존 api_keys 테이블 형식으로 변환
    const transformedData = {
      id: data.id,
      provider: data.provider,
      name: data.name,
      description: data.description,
      apiKey: data.api_key,
      isActive: data.is_active,
      createdAt: data.created_at,
      lastUsedAt: data.last_used_at,
      usageCount: data.usage_count || 0
    }

    return NextResponse.json({ data: transformedData })
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
      .from('api')
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

