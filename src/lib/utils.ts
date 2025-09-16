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
