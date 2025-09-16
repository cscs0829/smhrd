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
import { Key, Plus, Edit, Trash2, Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
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
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [open, setOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [showKeys, setShowKeys] = useState<{ [key: number]: boolean }>({})
  const [loading, setLoading] = useState(false)

  // 폼 상태
  const [formData, setFormData] = useState({
    provider: 'openai' as 'openai' | 'gemini',
    name: '',
    description: '',
    apiKey: ''
  })

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      setLoading(true)
      // 실제로는 API 호출
      // const response = await fetch('/api/api-keys')
      // const data = await response.json()
      
      // 임시 데이터
      const mockData: ApiKey[] = [
        {
          id: 1,
          provider: 'openai',
          name: 'OpenAI Production Key',
          description: '프로덕션용 OpenAI API 키',
          apiKey: 'sk-********************************',
          isActive: true,
          createdAt: '2024-09-16T00:00:00Z',
          lastUsedAt: '2024-09-16T10:30:00Z',
          usageCount: 1250
        },
        {
          id: 2,
          provider: 'gemini',
          name: 'Gemini Development Key',
          description: '개발용 Gemini API 키',
          apiKey: 'AI**********************************',
          isActive: true,
          createdAt: '2024-09-15T00:00:00Z',
          lastUsedAt: '2024-09-16T09:15:00Z',
          usageCount: 890
        }
      ]
      
      setApiKeys(mockData)
    } catch (error) {
      console.error('API 키 로드 오류:', error)
      toast.error('API 키를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.apiKey.trim()) {
      toast.error('이름과 API 키를 입력해주세요')
      return
    }

    try {
      if (editingKey) {
        // 수정
        const updatedKey = { ...editingKey, ...formData }
        setApiKeys(prev => prev.map(key => key.id === editingKey.id ? updatedKey : key))
        toast.success('API 키가 수정되었습니다')
      } else {
        // 추가
        const newKey: ApiKey = {
          id: Date.now(),
          provider: formData.provider,
          name: formData.name,
          description: formData.description,
          apiKey: formData.apiKey,
          isActive: true,
          createdAt: new Date().toISOString(),
          usageCount: 0
        }
        setApiKeys(prev => [...prev, newKey])
        toast.success('API 키가 추가되었습니다')
      }

      setFormData({ provider: 'openai', name: '', description: '', apiKey: '' })
      setEditingKey(null)
      setOpen(false)
    } catch (error) {
      console.error('API 키 저장 오류:', error)
      toast.error('API 키 저장에 실패했습니다')
    }
  }

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

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 API 키를 삭제하시겠습니까?')) return

    try {
      setApiKeys(prev => prev.filter(key => key.id !== id))
      toast.success('API 키가 삭제되었습니다')
    } catch (error) {
      console.error('API 키 삭제 오류:', error)
      toast.error('API 키 삭제에 실패했습니다')
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, isActive: !key.isActive } : key
      ))
      toast.success('API 키 상태가 변경되었습니다')
    } catch (error) {
      console.error('API 키 상태 변경 오류:', error)
      toast.error('API 키 상태 변경에 실패했습니다')
    }
  }

  const toggleKeyVisibility = (id: number) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••'
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4)
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return '🤖'
      case 'gemini':
        return '🔮'
      default:
        return '🔑'
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'gemini':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API 키 관리
              </CardTitle>
              <CardDescription>
                AI 서비스 사용을 위한 API 키를 관리하세요
              </CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingKey(null)
                  setFormData({ provider: 'openai', name: '', description: '', apiKey: '' })
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  API 키 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingKey ? 'API 키 수정' : '새 API 키 추가'}
                  </DialogTitle>
                  <DialogDescription>
                    AI 서비스 사용을 위한 API 키 정보를 입력하세요
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>제공업체</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={formData.provider === 'openai' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, provider: 'openai' }))}
                      >
                        🤖 OpenAI
                      </Button>
                      <Button
                        variant={formData.provider === 'gemini' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, provider: 'gemini' }))}
                      >
                        🔮 Gemini
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      placeholder="API 키 이름을 입력하세요"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">설명 (선택사항)</Label>
                    <Textarea
                      id="description"
                      placeholder="API 키에 대한 설명을 입력하세요"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-key">API 키</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder={formData.provider === 'openai' ? 'sk-...' : 'AI...'}
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                    <div className="text-xs text-gray-500">
                      {formData.provider === 'openai' 
                        ? 'OpenAI API 키는 sk-로 시작합니다'
                        : 'Google AI Studio API 키를 입력하세요'
                      }
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      API 키는 안전하게 암호화되어 저장됩니다. 
                      다른 사람과 공유하지 마세요.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSave}>
                      {editingKey ? '수정' : '추가'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">API 키를 불러오는 중...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">등록된 API 키가 없습니다</p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                첫 번째 API 키 추가
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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
                          <code className="text-sm font-mono">
                            {showKeys[key.id] ? key.apiKey : maskApiKey(key.apiKey)}
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
                          <p>{key.usageCount.toLocaleString()}회</p>
                          {key.lastUsedAt && (
                            <p className="text-gray-500">
                              {new Date(key.lastUsedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {key.isActive ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              활성
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              비활성
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(key)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(key.id)}
                          >
                            {key.isActive ? '비활성화' : '활성화'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(key.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
