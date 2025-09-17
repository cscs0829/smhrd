'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Key, Plus, Edit, Trash2, Eye, EyeOff, Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
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

export function ApiKeyManager() {
  // 상태 초기화 - 더 안전한 방식
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [open, setOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({})

  // 폼 상태
  const [formData, setFormData] = useState({
    provider: 'openai' as 'openai' | 'gemini',
    name: '',
    description: '',
    apiKey: ''
  })

  // 컴포넌트 마운트 시 API 키 로드
  useEffect(() => {
    loadApiKeys()
  }, [])

  // localStorage에서 API 키 상태 복원
  const loadApiKeysFromStorage = () => {
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

  // API 키 로드 함수
  const loadApiKeys = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // 강제 새로고침이 아니고 localStorage에 데이터가 있으면 먼저 표시
      if (!forceRefresh) {
        const cachedKeys = loadApiKeysFromStorage()
        if (cachedKeys.length > 0) {
          setApiKeys(cachedKeys)
          setLoading(false)
        }
      }
      
      const response = await fetch('/api/api-keys')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: API 키를 불러오는데 실패했습니다`)
      }
      
      const result = await response.json()
      
      // 응답 데이터 검증
      if (result && Array.isArray(result.data)) {
        setApiKeys(result.data)
        saveApiKeysToStorage(result.data) // localStorage에 저장
      } else {
        console.warn('API 응답 데이터가 예상 형식이 아닙니다:', result)
        setApiKeys([])
        saveApiKeysToStorage([])
      }
    } catch (error) {
      console.error('API 키 로드 오류:', error)
      const errorMessage = error instanceof Error ? error.message : 'API 키를 불러오는데 실패했습니다'
      setError(errorMessage)
      
      // API 오류 시 localStorage에서 복원 시도
      const cachedKeys = loadApiKeysFromStorage()
      if (cachedKeys.length > 0) {
        setApiKeys(cachedKeys)
        setError(null) // 캐시된 데이터가 있으면 에러 해제
      } else {
        setApiKeys([])
      }
    } finally {
      setLoading(false)
    }
  }

  // API 키 저장/수정 함수
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.apiKey.trim()) {
      toast.error('이름과 API 키를 입력해주세요')
      return
    }

    try {
      if (editingKey) {
        // 수정
        const response = await fetch('/api/api-keys', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingKey.id,
            name: formData.name,
            description: formData.description,
            apiKey: formData.apiKey,
            isActive: editingKey.isActive
          })
        })
        
        if (!response.ok) {
          throw new Error('API 키 수정에 실패했습니다')
        }
        
        const result = await response.json()
        
        // 서버에서 반환된 데이터로 상태 업데이트
        const updatedKeys = apiKeys.map(key => 
          key.id === editingKey.id ? { ...key, ...result.data } : key
        )
        setApiKeys(updatedKeys)
        saveApiKeysToStorage(updatedKeys) // localStorage에 저장
        toast.success('API 키가 수정되었습니다')
      } else {
        // 추가
        const response = await fetch('/api/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: formData.provider,
            name: formData.name,
            description: formData.description,
            apiKey: formData.apiKey
          })
        })
        
        if (!response.ok) {
          throw new Error('API 키 추가에 실패했습니다')
        }
        
        const result = await response.json()
        
        // 서버에서 반환된 데이터로 상태 업데이트
        const updatedKeys = [...apiKeys, result.data]
        setApiKeys(updatedKeys)
        saveApiKeysToStorage(updatedKeys) // localStorage에 저장
        toast.success('API 키가 추가되었습니다')
      }

      setFormData({ provider: 'openai', name: '', description: '', apiKey: '' })
      setEditingKey(null)
      setOpen(false)
    } catch (error) {
      console.error('API 키 저장 오류:', error)
      const message = error instanceof Error ? error.message : 'API 키 저장에 실패했습니다'
      toast.error(message)
    }
  }

  // API 키 삭제 함수
  const handleDelete = async (id: number) => {
    if (actionLoading[id]) return // 이미 처리 중이면 무시
    if (!confirm('정말로 이 API 키를 삭제하시겠습니까?')) return

    try {
      setActionLoading(prev => ({ ...prev, [id]: true }))
      
      const response = await fetch(`/api/api-keys?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'API 키 삭제에 실패했습니다')
      }
      
      // 삭제 성공 시 상태에서 제거
      const updatedKeys = apiKeys.filter(key => key.id !== id)
      setApiKeys(updatedKeys)
      saveApiKeysToStorage(updatedKeys) // localStorage에 저장
      toast.success('API 키가 삭제되었습니다')
    } catch (error) {
      console.error('API 키 삭제 오류:', error)
      const message = error instanceof Error ? error.message : 'API 키 삭제에 실패했습니다'
      toast.error(message)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  // API 키 활성화/비활성화 함수
  const handleToggleActive = async (id: number) => {
    if (actionLoading[id]) return // 이미 처리 중이면 무시
    
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }))
      
      const key = apiKeys.find(k => k.id === id)
      if (!key) {
        toast.error('API 키를 찾을 수 없습니다')
        return
      }
      
      const newActiveState = !key.isActive
      
      const response = await fetch('/api/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          isActive: newActiveState
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'API 키 상태 변경에 실패했습니다')
      }
      
      const result = await response.json()
      
      // 서버에서 반환된 데이터로 상태 업데이트
      const updatedKeys = apiKeys.map(k => 
        k.id === id ? { ...k, isActive: result.data.is_active } : k
      )
      setApiKeys(updatedKeys)
      saveApiKeysToStorage(updatedKeys) // localStorage에 저장
      
      toast.success(`API 키가 ${newActiveState ? '활성화' : '비활성화'}되었습니다`)
    } catch (error) {
      console.error('API 키 상태 변경 오류:', error)
      const message = error instanceof Error ? error.message : 'API 키 상태 변경에 실패했습니다'
      toast.error(message)
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  // 편집 모드 시작
  const handleEdit = (key: ApiKey) => {
    setEditingKey(key)
    setFormData({
      provider: key.provider,
      name: key.name,
      description: key.description || '',
      apiKey: '••••••••••••••••' // 마스킹된 키
    })
    setOpen(true)
  }

  // API 키 표시/숨김 토글
  const toggleKeyVisibility = (id: number) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // 제공업체 아이콘 반환
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return '🤖'
      case 'gemini':
        return '🧠'
      default:
        return '🔑'
    }
  }

  // 제공업체 색상 반환
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800'
      case 'gemini':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ko-KR')
    } catch {
      return dateString
    }
  }

  // 로딩 상태 렌더링
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">API 키를 불러오는 중...</p>
      </div>
    )
  }

  // 오류 상태 렌더링
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => loadApiKeys()} variant="outline">
          다시 시도
        </Button>
      </div>
    )
  }

  // 빈 상태 렌더링
  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-8">
        <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">등록된 API 키가 없습니다</p>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          첫 번째 API 키 추가
        </Button>
      </div>
    )
  }

  // 메인 렌더링
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">API 키 목록</h3>
          <p className="text-sm text-gray-500">총 {apiKeys.length}개의 API 키가 등록되어 있습니다</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => { loadApiKeys(true) }} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            API 키 추가
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제공업체</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>API 키</TableHead>
            <TableHead>사용량</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((key) => (
            <TableRow key={key.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getProviderIcon(key.provider)}</span>
                  <Badge className={getProviderColor(key.provider)}>
                    {key.provider.toUpperCase()}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{key.name}</p>
                  {key.description && (
                    <p className="text-sm text-gray-500">{key.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {showKeys[key.id] ? key.apiKey : '••••••••••••••••'}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleKeyVisibility(key.id)}
                  >
                    {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>{key.usageCount}회 사용</p>
                  {key.lastUsedAt && (
                    <p className="text-gray-500">마지막 사용: {formatDate(key.lastUsedAt)}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {key.isActive ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      활성
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Shield className="mr-1 h-3 w-3" />
                      비활성
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(key)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={key.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggleActive(key.id)}
                    disabled={actionLoading[key.id]}
                    className={key.isActive ? "hover:bg-red-100" : "hover:bg-green-100"}
                  >
                    {actionLoading[key.id] ? (
                      <>
                        <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        처리중...
                      </>
                    ) : key.isActive ? (
                      <>
                        <Shield className="mr-1 h-3 w-3" />
                        비활성화
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        활성화
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(key.id)}
                    disabled={actionLoading[key.id]}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {actionLoading[key.id] ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* API 키 추가/수정 다이얼로그 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingKey ? 'API 키 수정' : 'API 키 추가'}
            </DialogTitle>
            <DialogDescription>
              {editingKey ? 'API 키 정보를 수정하세요.' : '새로운 API 키를 추가하세요.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="provider" className="text-right">
                제공업체
              </Label>
              <select
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value as 'openai' | 'gemini' }))}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!editingKey}
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="API 키 이름을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                설명
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="API 키에 대한 설명을 입력하세요 (선택사항)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right">
                API 키
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                className="col-span-3"
                placeholder="API 키를 입력하세요"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              {editingKey ? '수정' : '추가'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}