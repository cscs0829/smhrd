import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'ep_data') {
      await initializeEpData()
    } else if (action === 'city_images') {
      await initializeCityImages()
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '잘못된 액션입니다.' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: '데이터 초기화가 완료되었습니다.' 
    })

  } catch (error) {
    console.error('초기화 오류:', error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    })
  }
}

async function initializeEpData() {
  // ep데이터.xlsx 파일 읽기
  const filePath = path.join(process.cwd(), 'public', 'ep데이터.xlsx')
  
  if (!fs.existsSync(filePath)) {
    throw new Error('ep데이터.xlsx 파일을 찾을 수 없습니다.')
  }

  const workbook = XLSX.readFile(filePath)
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(worksheet)

  // 데이터베이스에 삽입
  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin
    .from('ep_data')
    .upsert(data, { onConflict: 'id' })

  if (error) {
    throw new Error(`EP 데이터 삽입 오류: ${error.message}`)
  }
}

async function initializeCityImages() {
  // city별 대표이미지인지 아닌지 및 비디오.xlsx 파일 읽기
  const filePath = path.join(process.cwd(), 'public', 'city별 대표이미지인지 아닌지 및 비디오.xlsx')
  
  if (!fs.existsSync(filePath)) {
    throw new Error('city별 대표이미지인지 아닌지 및 비디오.xlsx 파일을 찾을 수 없습니다.')
  }

  const workbook = XLSX.readFile(filePath)
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(worksheet)

  // 데이터 변환
  type CityRow = {
    city?: string
    image_link?: string
    ['메인이미지인지아닌지']?: number | boolean
    video_url?: string
  }

  const transformedData = (data as CityRow[]).map((row) => ({
    city: row.city ?? '',
    image_link: row.image_link ?? '',
    is_main_image: typeof row['메인이미지인지아닌지'] === 'boolean'
      ? (row['메인이미지인지아닌지'] ? 1 : 0)
      : (row['메인이미지인지아닌지'] ?? 0),
    video_url: row.video_url ?? ''
  }))

  // 데이터베이스에 삽입
  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin
    .from('city_images')
    .upsert(transformedData, { onConflict: 'id' })

  if (error) {
    throw new Error(`도시 이미지 데이터 삽입 오류: ${error.message}`)
  }
}

