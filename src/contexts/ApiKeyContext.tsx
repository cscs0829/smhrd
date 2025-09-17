'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
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

  // Context7 persistent storage 패턴: 더 구체적인 localStorage 키 사용
  const STORAGE_KEY = 'ep-api-keys-persistent'
  
  const loadApiKeysFromStorage = (): ApiKey[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          console.log('localStorage에서 API 키 로드:', parsed.length, '개')
          return parsed
        }
      }
    } catch (error) {
      console.warn('localStorage에서 API 키 로드 실패:', error)
    }
    return []
  }

  const saveApiKeysToStorage = (keys: ApiKey[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
      console.log('localStorage에 API 키 저장:', keys.length, '개')
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

  // Context7 persistent storage 패턴: localStorage 우선, DB는 데이터만 동기화
  const loadApiKeys = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // 1. localStorage에서 활성화 상태 포함한 데이터 로드 (Context7 패턴)
      const cachedKeys = loadApiKeysFromStorage()
      if (cachedKeys.length > 0) {
        setApiKeys(cachedKeys)
        setLoading(false)
        
        // 2. 백그라운드에서 DB 데이터와 병합 (활성화 상태는 localStorage 우선)
        if (!forceRefresh) {
          try {
            const dbKeys = await loadFromDatabase()
            // DB 데이터와 localStorage 데이터를 병합 (활성화 상태는 localStorage 우선)
            const mergedKeys = dbKeys.map(dbKey => {
              const cachedKey = cachedKeys.find(cached => cached.id === dbKey.id)
              return cachedKey ? { ...dbKey, isActive: cachedKey.isActive } : dbKey
            })
            
            // 새로 추가된 키들만 추가
            const newKeys = dbKeys.filter(dbKey => !cachedKeys.find(cached => cached.id === dbKey.id))
            const finalKeys = [...mergedKeys, ...newKeys]
            
            setApiKeys(finalKeys)
            saveApiKeysToStorage(finalKeys)
          } catch (dbError) {
            console.warn('DB 동기화 실패, 캐시된 데이터 사용:', dbError)
          }
        }
        return
      }
      
      // 3. localStorage에 데이터가 없으면 DB에서 로드
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
  }, [loadApiKeysFromStorage, loadFromDatabase, saveApiKeysToStorage])

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

  // API 키 활성화/비활성화 - Context7 단일 활성화 패턴 사용
  const toggleApiKeyActive = (id: number, isActive: boolean) => {
    setApiKeys(prev => {
      const targetKey = prev.find(k => k.id === id)
      if (!targetKey) return prev
      
      const updated = prev.map(k => {
        if (k.id === id) {
          // 선택된 키의 상태 변경
          return { ...k, isActive }
        } else if (isActive && k.provider === targetKey.provider) {
          // 같은 제공업체의 다른 키들은 비활성화 (단일 활성화)
          return { ...k, isActive: false }
        }
        return k
      })
      
      // 즉시 localStorage에 저장하여 지속성 보장
      saveApiKeysToStorage(updated)
      return updated
    })
  }

  // 컴포넌트 마운트 시 API 키 로드
  useEffect(() => {
    loadApiKeys(false)
  }, [loadApiKeys])

  // Context7 persistent storage 패턴: 상태 변경 시 즉시 localStorage에 저장
  useEffect(() => {
    if (apiKeys.length > 0) {
      saveApiKeysToStorage(apiKeys)
    }
  }, [apiKeys])

  // Context7 패턴: 페이지 새로고침 전에 현재 상태를 localStorage에 저장 (추가 보장)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (apiKeys.length > 0) {
        saveApiKeysToStorage(apiKeys)
        console.log('페이지 새로고침 전 상태 저장 완료')
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && apiKeys.length > 0) {
        saveApiKeysToStorage(apiKeys)
        console.log('페이지 숨김 시 상태 저장 완료')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
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
