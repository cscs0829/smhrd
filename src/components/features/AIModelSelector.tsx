'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Textarea는 이 컴포넌트에서 사용되지 않음
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Cpu, Settings, Key, DollarSign, Zap, Shield, Info } from 'lucide-react'
import { getAvailableModels } from '@/lib/ai-models'
import { toast } from 'sonner'
import { useApiKeys } from '@/contexts/ApiKeyContext'
import { useSpring, animated } from '@react-spring/web' // Context7 React Spring 패턴

interface AIModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  selectedApiKeyId?: string
  onApiKeyChange?: (apiKeyId: string) => void
  temperature?: number
  onTemperatureChange?: (temperature: number) => void
  maxTokens?: number
  onMaxTokensChange?: (maxTokens: number) => void
}

export function AIModelSelector({
  selectedModel,
  onModelChange,
  selectedApiKeyId,
  onApiKeyChange,
  temperature = 0.7,
  onTemperatureChange,
  maxTokens = 100,
  onMaxTokensChange
}: AIModelSelectorProps) {
  const { apiKeys } = useApiKeys() // 전역 상태에서 API 키 가져오기
  const [open, setOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai')
  const [tempApiKeyId, setTempApiKeyId] = useState(selectedApiKeyId || '')
  const [tempTemperature, setTempTemperature] = useState(temperature)
  const [tempMaxTokens, setTempMaxTokens] = useState(maxTokens)

  // Context7 React Spring 패턴: 모델 선택 애니메이션
  const [modelSprings, modelApi] = useSpring(() => ({
    scale: 1,
    opacity: 1,
    config: { tension: 400, friction: 25 }
  }))

  // Context7 React Spring 패턴: API 키 선택 애니메이션
  const [apiKeySprings, apiKeyApi] = useSpring(() => ({
    scale: 1,
    opacity: 1,
    config: { tension: 300, friction: 20 }
  }))

  const availableModels = getAvailableModels()
  const selectedModelInfo = availableModels.find(model => model.id === selectedModel)
  const selectedApiKey = apiKeys.find(key => key.id === selectedApiKeyId)

  useEffect(() => {
    if (selectedModelInfo) {
      setSelectedProvider(selectedModelInfo.provider)
    }
  }, [selectedModelInfo])

  // 활성 상태인 API 키를 자동으로 선택 (기본값 우선)
  useEffect(() => {
    if (apiKeys.length > 0 && (!tempApiKeyId || tempApiKeyId === '')) {
      // 기본값으로 설정된 API 키를 먼저 찾기
      const defaultApiKey = apiKeys.find(key => key.isActive && key.isDefault)
      if (defaultApiKey) {
        setTempApiKeyId(defaultApiKey.id)
      } else {
        // 기본값이 없으면 활성 상태인 API 키 중에서 첫 번째 선택
        const activeApiKey = apiKeys.find(key => key.isActive)
        if (activeApiKey) {
          setTempApiKeyId(activeApiKey.id)
        } else {
          // 활성 상태인 키가 없으면 첫 번째 키 선택
          setTempApiKeyId(apiKeys[0].id)
        }
      }
    }
  }, [apiKeys, tempApiKeyId])

  const handleSave = () => {
    if (!tempApiKeyId) {
      toast.error('API 키를 선택해주세요')
      return
    }

    onApiKeyChange?.(tempApiKeyId)
    onTemperatureChange?.(tempTemperature)
    onMaxTokensChange?.(tempMaxTokens)
    setOpen(false)
    toast.success('AI 모델 설정이 저장되었습니다')
  }

  const handleModelSelect = (modelId: string) => {
    // Context7 React Spring 패턴: 모델 선택 애니메이션
    modelApi.start({
      from: { scale: 1, opacity: 1 },
      to: [
        { scale: 0.95, opacity: 0.8 },
        { scale: 1, opacity: 1 }
      ]
    })

    onModelChange(modelId)
    const model = availableModels.find(m => m.id === modelId)
    if (model) {
      setSelectedProvider(model.provider)
      // 해당 제공업체의 활성화된 API 키가 있으면 첫 번째로 선택
      const availableKeys = apiKeys.filter(key => key.provider === model.provider && key.isActive)
      if (availableKeys.length > 0) {
        const selectedKeyId = availableKeys[0].id
        setTempApiKeyId(selectedKeyId)
        // 부모 컴포넌트에도 즉시 반영
        onApiKeyChange?.(selectedKeyId)
        
        // Context7 React Spring 패턴: API 키 선택 애니메이션
        apiKeyApi.start({
          from: { scale: 1, opacity: 1 },
          to: [
            { scale: 1.05, opacity: 0.9 },
            { scale: 1, opacity: 1 }
          ]
        })
        
        toast.success(`${model.provider.toUpperCase()} 활성화된 API 키가 자동 선택되었습니다`)
      } else {
        setTempApiKeyId('')
        onApiKeyChange?.('')
        toast.warning(`${model.provider.toUpperCase()} 활성화된 API 키가 없습니다`)
      }
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return '🤖'
      case 'gemini':
        return '🔮'
      default:
        return '🤖'
    }
  }

  const getCapabilityIcon = (capability: string) => {
    switch (capability) {
      case 'text':
        return '📝'
      case 'image':
        return '🖼️'
      case 'audio':
        return '🎵'
      case 'video':
        return '🎬'
      case 'function_calling':
        return '⚙️'
      default:
        return '📝'
    }
  }

  return (
    <div className="space-y-4">
      {/* 현재 선택된 모델 표시 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            AI 모델 설정
          </CardTitle>
          <CardDescription>
            제목 생성을 위한 AI 모델을 선택하고 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedModelInfo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getProviderIcon(selectedModelInfo.provider)}</span>
                  <div>
                    <h3 className="font-semibold">{selectedModelInfo.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedModelInfo.description}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {selectedModelInfo.provider.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>토큰당 ${selectedModelInfo.costPerToken.toFixed(6)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span>최대 {selectedModelInfo.maxTokens.toLocaleString()} 토큰</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {selectedModelInfo.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary" className="text-xs">
                    {getCapabilityIcon(capability)} {capability}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="h-4 w-4" />
                <span>API 키: {selectedApiKey ? selectedApiKey.name : '설정 필요'}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">AI 모델을 선택해주세요</p>
            </div>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4">
                <Settings className="mr-2 h-4 w-4" />
                모델 설정 변경
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI 모델 설정</DialogTitle>
                <DialogDescription>
                  제목 생성을 위한 AI 모델과 설정을 구성하세요
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* 모델 선택 */}
                <div className="space-y-2">
                  <Label>AI 모델 선택</Label>
                  <animated.div
                    style={{
                      ...modelSprings
                    }}
                  >
                    <Select value={selectedModel} onValueChange={handleModelSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="모델을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{getProviderIcon(model.provider)}</span>
                              <span>{model.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {model.provider.toUpperCase()}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </animated.div>
                </div>

                {/* API 키 선택 */}
                <div className="space-y-2">
                  <Label>API 키 선택</Label>
                  <animated.div
                    style={{
                      ...apiKeySprings
                    }}
                  >
                    <Select value={tempApiKeyId} onValueChange={(value) => setTempApiKeyId(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="API 키를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {apiKeys
                          .filter(key => key.provider === selectedProvider && key.isActive)
                          .map((key) => (
                            <SelectItem key={key.id} value={key.id}>
                              <div className="flex items-center gap-2">
                                <span>{key.name}</span>
                                {key.description && (
                                  <span className="text-xs text-gray-500">- {key.description}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </animated.div>
                  {apiKeys.filter(key => key.provider === selectedProvider && key.isActive).length === 0 && (
                    <div className="text-xs text-red-500">
                      {selectedProvider === 'openai' 
                        ? '활성화된 OpenAI API 키가 없습니다. 설정 탭에서 API 키를 추가해주세요.'
                        : '활성화된 Gemini API 키가 없습니다. 설정 탭에서 API 키를 추가해주세요.'
                      }
                    </div>
                  )}
                </div>

                {/* 고급 설정 */}
                <div className="space-y-4">
                  <h4 className="font-medium">고급 설정</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={tempTemperature}
                        onChange={(e) => setTempTemperature(parseFloat(e.target.value))}
                      />
                      <div className="text-xs text-gray-500">
                        0.0 (일관성) ~ 2.0 (창의성)
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-tokens">최대 토큰</Label>
                      <Input
                        id="max-tokens"
                        type="number"
                        min="1"
                        max={selectedModelInfo?.maxTokens || 1000}
                        value={tempMaxTokens}
                        onChange={(e) => setTempMaxTokens(parseInt(e.target.value))}
                      />
                      <div className="text-xs text-gray-500">
                        생성할 최대 토큰 수
                      </div>
                    </div>
                  </div>
                </div>

                {/* 모델 정보 */}
                {selectedModelInfo && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p><strong>{selectedModelInfo.name}</strong> - {selectedModelInfo.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedModelInfo.capabilities.map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {getCapabilityIcon(capability)} {capability}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm">
                          예상 비용: 토큰당 ${selectedModelInfo.costPerToken.toFixed(6)}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* 저장 버튼 */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleSave}>
                    <Key className="mr-2 h-4 w-4" />
                    설정 저장
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
