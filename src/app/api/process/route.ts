import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import iconv from 'iconv-lite'
import ExcelJS from 'exceljs'
import { AIService } from '@/lib/ai-service'
import { normalizeCityName, findMatchingCityImages } from '@/lib/utils'

// Supabase 클라이언트 지연 생성
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const csvFile = formData.get('file') as Blob | null
    const modelId = formData.get('modelId') as string || 'gpt-4o-mini'
    const apiKey = formData.get('apiKey') as string || process.env.OPENAI_API_KEY!
    const temperature = parseFloat(formData.get('temperature') as string) || 0.7
    const maxTokens = parseInt(formData.get('maxTokens') as string) || 100

    if (!csvFile) {
      return NextResponse.json({ error: 'CSV 파일을 업로드해주세요.' }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'AI 모델 사용을 위해 API 키를 설정해주세요.' }, { status: 400 })
    }

    // 1. CSV 파일 읽기 및 클릭수 0인 상품 ID 추출
    const csvBuffer = Buffer.from(await csvFile.arrayBuffer())
    const csvText = iconv.decode(csvBuffer, 'cp949') // CP949 인코딩으로 읽기
    const csvWorkbook = XLSX.read(csvText, { type: 'string' })
    const csvSheetName = csvWorkbook.SheetNames[0]
    const csvData = XLSX.utils.sheet_to_json<Record<string, unknown>>(csvWorkbook.Sheets[csvSheetName])

    const zeroClickProductIds: string[] = csvData
      .filter((row) => Number((row as Record<string, unknown>)['클릭수']) === 0)
      .map((row) => String((row as Record<string, unknown>)['상품ID']))

    if (zeroClickProductIds.length === 0) {
      return NextResponse.json({ message: '클릭수가 0인 상품이 없습니다.' }, { status: 200 })
    }

    // 2. ep_data 및 city_images 데이터베이스에서 데이터 가져오기
    const supabase = getSupabase()
    const { data: epData, error: epError } = await supabase.from('ep_data').select('*')
    if (epError) throw epError

    const { data: cityImages, error: cityImagesError } = await supabase.from('city_images').select('*')
    if (cityImagesError) throw cityImagesError

    const { data: existingTitles, error: titlesError } = await supabase.from('titles').select('title')
    if (titlesError) throw titlesError
    const existingTitleSet = new Set(existingTitles?.map(t => t.title.toLowerCase()))

    // 3. AI 서비스 초기화
    const aiService = new AIService({
      modelId,
      apiKey,
      temperature,
      maxTokens
    })

    // 4. 클릭수 0인 상품 처리
    const newProducts: Array<Record<string, unknown>> = []
    const updatedEpData = epData ? [...epData] : []
    const deletedProductTitles: string[] = []
    const backupRows: Array<Record<string, unknown>> = []
    const deleteIds: string[] = []
    const titleRows: Array<{ id: string, title: string }> = []
    const newProductRows: Array<Record<string, unknown>> = []

    for (const productId of zeroClickProductIds) {
      const productIndex = updatedEpData.findIndex((p: { id: string }) => String(p.id) === productId)

      if (productIndex !== -1) {
        const deletedProduct = updatedEpData[productIndex]
        deletedProductTitles.push(deletedProduct.title)

        // 4-1. deleted_items 테이블에 백업 (배치용으로 모음)
        backupRows.push({
          original_id: deletedProduct.id,
          original_data: deletedProduct,
          reason: '클릭수 0'
        })

        // 4-2. ep_data 테이블에서 삭제 (배치 삭제 예정)
        deleteIds.push(deletedProduct.id)

        // 4-3. 새로운 상품 데이터 생성
        const originalIdParts = productId.split('_')
        const code = originalIdParts[1]
        const cityCodeOrName = originalIdParts[2]
        const city = normalizeCityName(cityCodeOrName)
        const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD

        // 새로운 ID 생성 (날짜_코드_city_세부번호)
        let detailNumber = 1
        let newId = ''
        let isIdUnique = false
        while (!isIdUnique) {
          newId = `${currentDate}_${code}_${city}_${String(detailNumber).padStart(4, '0')}`
          const { data: existingProduct, error: checkError } = await supabase.from('ep_data').select('id').eq('id', newId).single()
          if (checkError && checkError.code === 'PGRST116') { // No rows found
            isIdUnique = true
          } else if (existingProduct) {
            detailNumber++
          } else if (checkError) {
            throw checkError
          }
        }

        // 메인 이미지 및 추가 이미지 링크 생성 - 개선된 도시 매칭
        let citySpecificImages = findMatchingCityImages(cityImages || [], city)
        
        // 디버깅을 위한 로그 추가
        console.log(`도시 매칭 결과 - ID: ${productId}, 추출된 도시: ${city}, 매칭된 이미지 수: ${citySpecificImages.length}`)
        if (citySpecificImages.length === 0) {
          console.log(`도시 이미지를 찾을 수 없음 - 사용 가능한 도시들:`, cityImages?.map(img => img.city).slice(0, 10))
        }
        let mainImageLink = ''
        let addImageLinks: string[] = []

        if (citySpecificImages && citySpecificImages.length > 0) {
          const mainImages = citySpecificImages.filter((img: { is_main_image: number }) => img.is_main_image === 1)
          
          if (mainImages.length > 0) {
            // 메인 이미지가 있는 경우: 선택된 메인 이미지만 제외하고 나머지 모든 이미지를 랜덤으로 10개 선택
            mainImageLink = mainImages[Math.floor(Math.random() * mainImages.length)].image_link
            
            // 선택된 메인 이미지만 제외하고, 나머지 모든 이미지(다른 메인 이미지 포함)를 추가 이미지로 사용
            const otherImages = citySpecificImages.filter((img: { image_link: string }) => img.image_link !== mainImageLink)
            const shuffledOtherImages = otherImages.sort(() => 0.5 - Math.random())
            
            // 정확히 10장이 되도록 반복해서 채우기
            addImageLinks = []
            for (let i = 0; i < 10; i++) {
              if (shuffledOtherImages.length > 0) {
                addImageLinks.push(shuffledOtherImages[i % shuffledOtherImages.length].image_link)
              } else {
                // 다른 이미지가 없는 경우 메인 이미지도 사용
                addImageLinks.push(mainImageLink)
              }
            }
          } else {
            // 메인 이미지가 없는 경우: 모든 이미지를 랜덤으로 10개 선택
            const shuffledAllImages = citySpecificImages.sort(() => 0.5 - Math.random())
            
            // 정확히 10장이 되도록 반복해서 채우기
            addImageLinks = []
            for (let i = 0; i < 10; i++) {
              if (shuffledAllImages.length > 0) {
                addImageLinks.push(shuffledAllImages[i % shuffledAllImages.length].image_link)
              } else {
                // 이미지가 없는 경우 빈 문자열로 채우기
                addImageLinks.push('')
              }
            }
          }
        }

        // AI를 이용한 제목 생성
        let newTitle = ''
        try {
          newTitle = await aiService.generateTitle(city)
        } catch (error) {
          console.error('AI 제목 생성 오류:', error)
          newTitle = `${city} 특별 여행 상품`
        }

        // 제목 중복 체크 및 수정
        let titleCounter = 1
        const originalNewTitle = newTitle
        while (existingTitleSet.has(newTitle.toLowerCase())) {
          newTitle = `${originalNewTitle} (ver.${titleCounter})`
          titleCounter++
        }
        existingTitleSet.add(newTitle.toLowerCase()) // 새로 생성된 제목을 Set에 추가

        // titles 테이블에 새 제목 추가 (배치용)
        titleRows.push({ id: newId, title: newTitle })

        const newProduct = {
          ...deletedProduct,
          id: newId,
          title: newTitle,
          image_link: mainImageLink,
          add_image_link: addImageLinks.join('|'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        newProducts.push(newProduct)

        // 4-4. ep_data 테이블에 새로운 상품 추가 (배치용)
        newProductRows.push(newProduct)
      }
    }

    // 4-x. 배치 DB 반영
    if (backupRows.length > 0) {
      const { error: backupErr } = await supabase.from('deleted_items').insert(backupRows)
      if (backupErr) console.error('배치 백업 실패:', backupErr)
    }
    if (deleteIds.length > 0) {
      const { error: deleteErr } = await supabase.from('ep_data').delete().in('id', deleteIds)
      if (deleteErr) console.error('배치 삭제 실패:', deleteErr)
    }
    if (titleRows.length > 0) {
      const { error: titleErr } = await supabase.from('titles').insert(titleRows)
      if (titleErr) console.error('배치 제목 추가 실패:', titleErr)
    }
    if (newProductRows.length > 0) {
      const { error: insertErr } = await supabase.from('ep_data').insert(newProductRows)
      if (insertErr) console.error('배치 신규상품 추가 실패:', insertErr)
    }

    // 5. 최종 Excel 파일 생성 (exceljs로 스타일 확정 적용)
    const finalEpData = await supabase.from('ep_data').select('*')
    if (finalEpData.error) throw finalEpData.error

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Processed_EP_Data')

    // 헤더 추가
    if (finalEpData.data.length > 0) {
      worksheet.columns = Object.keys(finalEpData.data[0]).map((key) => ({ header: key, key }))
    }

    // 데이터 추가
    finalEpData.data.forEach((row) => {
      worksheet.addRow(row)
    })

    // 스타일 적용 기준 준비
    const deletedTitlesSet = new Set(deletedProductTitles.map((title) => title.toLowerCase()))
    const newIdSet = new Set(newProducts.map((p) => p.id))

    // 첫 번째 컬럼(id) 셀에만 색상 적용 (요구사항 기준)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // 헤더 제외
      const idCell = row.getCell(1)
      const idValue = String(idCell.value ?? '')
      const titleCell = row.getCell(2)
      const titleValue = String(titleCell.value ?? '')

      // 새로 생성된 상품은 노란색
      if (newIdSet.has(idValue)) {
        idCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
        }
      }

      // 새 제목이 삭제된 상품의 제목과 중복이면 빨간색 (단, 새로 생성된 행은 제외)
      if (!newIdSet.has(idValue) && deletedTitlesSet.has(titleValue.toLowerCase())) {
        idCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' },
        }
      }
    })

    const excelBuffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(Buffer.from(excelBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="processed_ep_data.xlsx"',
      },
    })
  } catch (error: unknown) {
    console.error('API 처리 중 오류 발생:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}