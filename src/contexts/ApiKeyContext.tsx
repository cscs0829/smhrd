'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

interface ApiKey {
  id: number
  provider: 'openai' | 'gemini'
  name: string
  description?: string
  apiKey: string
  isActive: boolean
  createdAt: string
  lastUsedAt?: string
  usageCount: number
}

interface ApiKeyContextType {
  apiKeys: ApiKey[]
  loading: boolean
  error: string | null
  loadApiKeys: (forceRefresh?: boolean) => Promise<void>
  addApiKey: (key: ApiKey) => void
  updateApiKey: (key: ApiKey) => void
  deleteApiKey: (id: number) => void
  toggleApiKeyActive: (id: number, isActive: boolean) => void
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined)

export function useApiKeys() {
  const context = useContext(ApiKeyContext)
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider')
  }
  return context
}

interface ApiKeyProviderProps {
  children: ReactNode
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // localStorage에서 API 키 상태 복원
  const loadApiKeysFromStorage = (): ApiKey[] => {
    try {
      const stored = localStorage.getItem('api-keys')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (error) {
      console.warn('localStorage에서 API 키 로드 실패:', error)
    }
    return []
  }

  // localStorage에 API 키 상태 저장
  const saveApiKeysToStorage = (keys: ApiKey[]) => {
    try {
      localStorage.setItem('api-keys', JSON.stringify(keys))
    } catch (error) {
      console.warn('localStorage에 API 키 저장 실패:', error)
    }
  }

  // DB에서 데이터 로드하는 별도 함수
  const loadFromDatabase = async (): Promise<ApiKey[]> => {
    const response = await fetch('/api/api-keys')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: API 키를 불러오는데 실패했습니다`)
    }
    
    const result = await response.json()
    
    // 응답 데이터 검증
    if (result && Array.isArray(result.data)) {
      return result.data
    } else {
      console.warn('API 응답 데이터가 예상 형식이 아닙니다:', result)
      return []
    }
  }

  // API 키 로드 함수 - DB 우선, localStorage 백업
  const loadApiKeys = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // 강제 새로고침이 아니고 localStorage에 데이터가 있으면 먼저 표시 (빠른 로딩)
      if (!forceRefresh) {
        const cachedKeys = loadApiKeysFromStorage()
        if (cachedKeys.length > 0) {
          setApiKeys(cachedKeys)
          // 백그라운드에서 DB에서 최신 데이터 가져오기
          try {
            const dbKeys = await loadFromDatabase()
            setApiKeys(dbKeys)
            saveApiKeysToStorage(dbKeys)
          } catch (dbError) {
            console.warn('DB 동기화 실패, 캐시된 데이터 사용:', dbError)
          }
          setLoading(false)
          return
        }
      }
      
      // DB에서 데이터 로드
      const dbKeys = await loadFromDatabase()
      setApiKeys(dbKeys)
      saveApiKeysToStorage(dbKeys)
      
    } catch (error) {
      console.error('API 키 로드 오류:', error)
      const errorMessage = error instanceof Error ? error.message : 'API 키를 불러오는데 실패했습니다'
      setError(errorMessage)
      
      // API 오류 시 localStorage에서 복원 시도
      const cachedKeys = loadApiKeysFromStorage()
      if (cachedKeys.length > 0) {
        setApiKeys(cachedKeys)
        setError(null) // 캐시된 데이터가 있으면 에러 해제
        toast.warning('네트워크 오류로 캐시된 데이터를 표시합니다')
      } else {
        setApiKeys([])
      }
    } finally {
      setLoading(false)
    }
  }

  // API 키 추가
  const addApiKey = (key: ApiKey) => {
    setApiKeys(prev => {
      const updated = [...prev, key]
      saveApiKeysToStorage(updated)
      return updated
    })
  }

  // API 키 수정
  const updateApiKey = (key: ApiKey) => {
    setApiKeys(prev => {
      const updated = prev.map(k => k.id === key.id ? key : k)
      saveApiKeysToStorage(updated)
      return updated
    })
  }

  // API 키 삭제
  const deleteApiKey = (id: number) => {
    setApiKeys(prev => {
      const updated = prev.filter(k => k.id !== id)
      saveApiKeysToStorage(updated)
      return updated
    })
  }

  // API 키 활성화/비활성화 - Context7 updater function 패턴 사용
  const toggleApiKeyActive = (id: number, isActive: boolean) => {
    setApiKeys(prev => {
      const updated = prev.map(k => 
        k.id === id ? { ...k, isActive } : k
      )
      // 즉시 localStorage에 저장하여 지속성 보장
      saveApiKeysToStorage(updated)
      return updated
    })
  }

  // 컴포넌트 마운트 시 API 키 로드
  useEffect(() => {
    loadApiKeys(false)
  }, [])

  // Context7 패턴: 상태 변경 시 즉시 localStorage에 저장
  useEffect(() => {
    if (apiKeys.length > 0) {
      saveApiKeysToStorage(apiKeys)
    }
  }, [apiKeys])

  // 페이지 새로고침 전에 현재 상태를 localStorage에 저장 (추가 보장)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (apiKeys.length > 0) {
        saveApiKeysToStorage(apiKeys)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [apiKeys])

  const value: ApiKeyContextType = {
    apiKeys,
    loading,
    error,
    loadApiKeys,
    addApiKey,
    updateApiKey,
    deleteApiKey,
    toggleApiKeyActive
  }

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  )
}
