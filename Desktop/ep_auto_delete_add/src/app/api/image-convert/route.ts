import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const targetFormat = formData.get('targetFormat') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      )
    }

    if (!targetFormat) {
      return NextResponse.json(
        { success: false, error: '변환할 포맷이 지정되지 않았습니다.' },
        { status: 400 }
      )
    }

    // 파일을 Buffer로 변환
    const buffer = Buffer.from(await file.arrayBuffer())
    const originalSize = buffer.length

    // Supabase 클라이언트 생성
    const supabase = createServerSupabaseClient()

    // 변환 기록을 데이터베이스에 저장
    const { data: conversionRecord, error: insertError } = await supabase
      .from('image_conversions')
      .insert({
        original_filename: file.name,
        original_format: file.type.split('/')[1] || 'unknown',
        target_format: targetFormat,
        file_size: originalSize,
        conversion_status: 'processing'
      })
      .select()
      .single()

    if (insertError) {
      console.error('변환 기록 저장 오류:', insertError)
    }

    let convertedBuffer: Buffer
    let convertedSize: number

    try {
      // Sharp를 사용하여 이미지 변환
      const sharpInstance = sharp(buffer)

      // 포맷별 변환 옵션 설정
      switch (targetFormat.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          convertedBuffer = await sharpInstance
            .jpeg({ quality: 90, mozjpeg: true })
            .toBuffer()
          break
        case 'png':
          convertedBuffer = await sharpInstance
            .png({ compressionLevel: 9, adaptiveFiltering: true })
            .toBuffer()
          break
        case 'webp':
          convertedBuffer = await sharpInstance
            .webp({ quality: 90, effort: 6 })
            .toBuffer()
          break
        case 'avif':
          convertedBuffer = await sharpInstance
            .avif({ quality: 80, effort: 4 })
            .toBuffer()
          break
        case 'tiff':
          convertedBuffer = await sharpInstance
            .tiff({ compression: 'lzw', quality: 90 })
            .toBuffer()
          break
        case 'gif':
          convertedBuffer = await sharpInstance
            .gif({ effort: 6 })
            .toBuffer()
          break
        case 'bmp':
          // BMP는 PNG로 변환 후 확장자만 변경
          convertedBuffer = await sharpInstance
            .png()
            .toBuffer()
          break
        case 'heic':
          // HEIC는 JPEG로 변환 후 확장자만 변경
          convertedBuffer = await sharpInstance
            .jpeg({ quality: 90 })
            .toBuffer()
          break
        case 'heif':
          // HEIF는 JPEG로 변환 후 확장자만 변경
          convertedBuffer = await sharpInstance
            .jpeg({ quality: 90 })
            .toBuffer()
          break
        default:
          throw new Error(`지원하지 않는 포맷: ${targetFormat}`)
      }

      convertedSize = convertedBuffer.length

      // 변환된 파일명 생성
      const originalName = file.name.split('.')[0]
      const newFilename = `${originalName}.${targetFormat.toLowerCase()}`

      // 변환 기록 업데이트
      if (conversionRecord) {
        await supabase
          .from('image_conversions')
          .update({
            converted_size: convertedSize,
            conversion_status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', conversionRecord.id)
      }

      return NextResponse.json({
        success: true,
        convertedFile: Array.from(new Uint8Array(convertedBuffer)),
        filename: newFilename,
        originalSize,
        convertedSize,
        compressionRatio: Math.round(((originalSize - convertedSize) / originalSize) * 100)
      })

    } catch (conversionError) {
      console.error('이미지 변환 오류:', conversionError)
      
      // 변환 실패 기록 업데이트
      if (conversionRecord) {
        await supabase
          .from('image_conversions')
          .update({
            conversion_status: 'failed',
            error_message: conversionError instanceof Error ? conversionError.message : '알 수 없는 오류',
            updated_at: new Date().toISOString()
          })
          .eq('id', conversionRecord.id)
      }

      return NextResponse.json(
        { 
          success: false, 
          error: conversionError instanceof Error ? conversionError.message : '이미지 변환 중 오류가 발생했습니다.' 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '서버 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}
