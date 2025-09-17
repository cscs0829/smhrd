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
    // 기본 도시들
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
    DANA: 'DaNang',
    DANANG: 'DaNang',
    BEPP: 'BeppuYufuin',
    KOBE: 'Kobe',
    HONGKONG: 'HongKong',
    HONG_KONG: 'HongKong',
    SYD: 'Sydney',
    
    // 실제 데이터에서 발견된 도시 코드들
    OCL: 'Auckland',
    BALI: 'Bali',
    BORAC: 'Boracay',
    BRISBANE: 'Brisbane',
    CG: 'Calgary',
    CHIAM: 'ChiangMai',
    CLOC: 'Clark',
    ENGLAND: 'UnitedKingdom',
    FRANCE: 'France',
    FUKYO: 'Fukuoka',
    GC: 'GrandCanyon',
    GERMAN: 'Germany',
    GOLDCOST: 'GoldCoast',
    GONM: 'Kunming',
    GUILIN: 'Guilin',
    HACO: 'Hakone',
    HIN: 'Hainan',
    HL: 'Honolulu',
    ITALY: 'Italy',
    KOTAKI: 'KotaKinabalu',
    KYOT: 'Kyoto',
    LA: 'LosAngeles',
    LTL: 'Rotorua',
    LV: 'LasVegas',
    MANIL: 'Manila',
    MONGO: 'Ulaanbaatar',
    NG: 'NiagaraFalls',
    NHATR: 'NhaTrang',
    NORTHEUROPE: 'Norway',
    NY: 'NewYork',
    PATT: 'Pattaya',
    PHUQU: 'PhuQuoc',
    QB: 'Quebec',
    QZT: 'Queenstown',
    SF: 'SanFrancisco',
    SIEMR: 'SiemReap',
    SINGAP: 'Singapore',
    SPAINPORTU: 'Portugal',
    SWISS: 'Switzerland',
    TOKY: 'Tokyo',
    TR: 'Toronto',
    VANGV: 'VangVieng',
    VC: 'Vancouver',
    WT: 'Washington',
    ZHANG: 'Zhangjiajie',
    
    // 언더스코어가 포함된 코드들
    _AFRICA: 'SouthAfrica',
    _AUSTRIA: 'Austria',
    _ENGLAND: 'UnitedKingdom',
    _FRANCE: 'France',
    _GERMAN: 'Germany',
    _GONM: 'Kunming',
    _GUILIN: 'Guilin',
    _HIN: 'Hainan',
    _HONGKONG: 'HongKong',
    _ITALY: 'Italy',
    _MAKAO: 'Macau',
    _MONGO: 'Ulaanbaatar',
    _NORTHEUROPE: 'Norway',
    _SPAINPORTU: 'Portugal',
    _SWISS: 'Switzerland',
    _ZHANG: 'Zhangjiajie',
    
    // 기타 도시들
    BMOUNTAIN: 'BaekduMountain',
    BF: 'Banff',
    BORACAY: 'Boracay',
    BUSAN: 'Busan',
    CHIANGMAI: 'ChiangMai',
    CHIANG_MAI: 'ChiangMai',
    DAEGU: 'Daegu',
    DAJEON: 'Daejeon',
    INCHEON: 'Incheon',
    JEJU: 'Jeju',
    KUALA_LUMPUR: 'Kuala Lumpur',
    KUALALUMPUR: 'Kuala Lumpur',
    SEOUL: 'Seoul',
    SINGAPORE: 'Singapore',
    TAIPEI: 'Taipei',
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
export function findMatchingCityImages(cityImages: Array<{ city: string; [key: string]: unknown }>, targetCity: string): Array<{ city: string; [key: string]: unknown }> {
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
