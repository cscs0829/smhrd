import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 도시명 정규화: 코드/대문자/언더스코어 등을 일반 영문 표기로 근사 매핑
export function normalizeCityName(input: string): string {
  if (!input) return ''
  const raw = String(input).trim()
  const upper = raw.toUpperCase()

  const map: Record<string, string> = {
    GUAM: 'Guam',
    SYDNEY: 'Sydney',
    SAIPAN: 'Saipan',
    OSAKA: 'Osaka',
    TOKYO: 'Tokyo',
    BANGK: 'Bangkok',
    BANGKOK: 'Bangkok',
    PHUKET: 'Phuket',
    CEBU: 'Cebu',
    HANOI: 'Hanoi',
    DANA: 'Da Nang',
    DANANG: 'Da Nang',
    BEPP: 'Beppu',
    KOBE: 'Kobe',
    HONGKONG: 'Hong Kong',
    HONG_KONG: 'Hong Kong',
    SYD: 'Sydney',
    AUCKLAND: 'Auckland',
    BALI: 'Bali',
    BANGKOK: 'Bangkok',
    BORACAY: 'Boracay',
    BUSAN: 'Busan',
    CEBU: 'Cebu',
    CHIANGMAI: 'Chiang Mai',
    CHIANG_MAI: 'Chiang Mai',
    DAEGU: 'Daegu',
    DAJEON: 'Daejeon',
    DANANG: 'Da Nang',
    DANA: 'Da Nang',
    GUAM: 'Guam',
    HANOI: 'Hanoi',
    HONGKONG: 'Hong Kong',
    HONG_KONG: 'Hong Kong',
    INCHEON: 'Incheon',
    JEJU: 'Jeju',
    KOBE: 'Kobe',
    KUALA_LUMPUR: 'Kuala Lumpur',
    KUALALUMPUR: 'Kuala Lumpur',
    OSAKA: 'Osaka',
    PHUKET: 'Phuket',
    SAIPAN: 'Saipan',
    SEOUL: 'Seoul',
    SINGAPORE: 'Singapore',
    SYDNEY: 'Sydney',
    SYD: 'Sydney',
    TAIPEI: 'Taipei',
    TOKYO: 'Tokyo',
    YANGON: 'Yangon',
  }

  if (map[upper]) return map[upper]

  // 언더스코어/숫자 제거 후 Title Case 근사
  const lettersOnly = raw.replace(/[^a-zA-Z]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!lettersOnly) return raw
  return lettersOnly
    .split(' ')
    .map(w => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ')
}

// 도시 매칭을 위한 유연한 검색 함수
export function findMatchingCityImages(cityImages: Array<{ city: string; [key: string]: any }>, targetCity: string): Array<{ city: string; [key: string]: any }> {
  if (!cityImages || cityImages.length === 0) return []
  
  const normalizedTarget = normalizeCityName(targetCity).toLowerCase()
  
  // 1. 정확한 매칭
  let matches = cityImages.filter(img => 
    normalizeCityName(img.city).toLowerCase() === normalizedTarget
  )
  
  if (matches.length > 0) return matches
  
  // 2. 부분 매칭 (포함 관계)
  matches = cityImages.filter(img => {
    const normalizedImgCity = normalizeCityName(img.city).toLowerCase()
    return normalizedImgCity.includes(normalizedTarget) || normalizedTarget.includes(normalizedImgCity)
  })
  
  if (matches.length > 0) return matches
  
  // 3. 단어별 매칭 (공백으로 분리된 단어들)
  const targetWords = normalizedTarget.split(' ').filter(w => w.length > 2)
  if (targetWords.length > 0) {
    matches = cityImages.filter(img => {
      const normalizedImgCity = normalizeCityName(img.city).toLowerCase()
      const imgWords = normalizedImgCity.split(' ').filter(w => w.length > 2)
      return targetWords.some(word => imgWords.some(imgWord => 
        imgWord.includes(word) || word.includes(imgWord)
      ))
    })
  }
  
  return matches
}
