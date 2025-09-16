import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import iconv from 'iconv-lite'
import { AIService } from '@/lib/ai-service'

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

    for (const productId of zeroClickProductIds) {
      const productIndex = updatedEpData.findIndex((p: { id: string }) => String(p.id) === productId)

      if (productIndex !== -1) {
        const deletedProduct = updatedEpData[productIndex]
        deletedProductTitles.push(deletedProduct.title)

        // 4-1. deleted_items 테이블에 백업
        const { error: backupError } = await supabase.from('deleted_items').insert({
          original_id: deletedProduct.id,
          original_data: deletedProduct,
          reason: '클릭수 0'
        })
        if (backupError) console.error(`백업 실패 (ID: ${deletedProduct.id}):`, backupError)

        // 4-2. ep_data 테이블에서 삭제
        const { error: deleteError } = await supabase.from('ep_data').delete().eq('id', deletedProduct.id)
        if (deleteError) console.error(`삭제 실패 (ID: ${deletedProduct.id}):`, deleteError)

        // 4-3. 새로운 상품 데이터 생성
        const originalIdParts = productId.split('_')
        const code = originalIdParts[1]
        const city = originalIdParts[2]
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

        // 메인 이미지 및 추가 이미지 링크 생성
        const citySpecificImages = cityImages?.filter((img: { city: string }) => img.city === city)
        let mainImageLink = ''
        let addImageLinks: string[] = []

        if (citySpecificImages && citySpecificImages.length > 0) {
          const mainImages = citySpecificImages.filter((img: { is_main_image: number }) => img.is_main_image === 1)
          if (mainImages.length > 0) {
            mainImageLink = mainImages[Math.floor(Math.random() * mainImages.length)].image_link
          }

          const otherImages = citySpecificImages.filter((img: { image_link: string }) => img.image_link !== mainImageLink)
          const shuffledOtherImages = otherImages.sort(() => 0.5 - Math.random())
          addImageLinks = shuffledOtherImages.slice(0, 10).map((img: { image_link: string }) => img.image_link)
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

        // titles 테이블에 새 제목 추가
        const { error: newTitleError } = await supabase.from('titles').insert({ id: newId, title: newTitle })
        if (newTitleError) console.error(`새 제목 추가 실패 (ID: ${newId}):`, newTitleError)

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

        // 4-4. ep_data 테이블에 새로운 상품 추가
        const { error: insertError } = await supabase.from('ep_data').insert(newProduct)
        if (insertError) console.error(`새 상품 추가 실패 (ID: ${newProduct.id}):`, insertError)
      }
    }

    // 5. 최종 Excel 파일 생성
    const finalEpData = await supabase.from('ep_data').select('*')
    if (finalEpData.error) throw finalEpData.error

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(finalEpData.data)

    // 제목 중복 여부 확인 및 셀 색상 지정 (새로 생성된 상품과 기존 삭제된 상품의 제목 비교)
    // const allTitles = new Set(finalEpData.data.map(row => row.title.toLowerCase()))
    const deletedTitlesSet = new Set(deletedProductTitles.map(title => title.toLowerCase()))

    for (let i = 0; i < finalEpData.data.length; i++) {
      const row = finalEpData.data[i]
      const cellRef = XLSX.utils.encode_cell({ r: i + 1, c: 0 }) // 데이터는 1행부터 시작 (헤더 제외)

      // 새로 생성된 상품은 노란색 배경
      if (newProducts.some(p => p.id === row.id)) {
        if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: row.id }
        worksheet[cellRef].s = { fill: { fgColor: { rgb: 'FFFF00' } } } // Yellow
      }

      // 새로 생성된 제목이 기존 삭제된 상품의 제목과 중복되면 빨간색 배경
      if (deletedTitlesSet.has(row.title.toLowerCase()) && !newProducts.some(p => p.id === row.id)) {
        if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: row.id }
        worksheet[cellRef].s = { fill: { fgColor: { rgb: 'FF0000' } } } // Red
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Processed_EP_Data')
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(excelBuffer, {
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