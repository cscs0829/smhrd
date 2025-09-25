import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, name, model_id, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('API 키 조회 오류:', error);
      return NextResponse.json(
        { error: 'API 키 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ apiKeys: apiKeys || [] });
  } catch (error) {
    console.error('API 키 조회 오류:', error);
    return NextResponse.json(
      { error: 'API 키 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
