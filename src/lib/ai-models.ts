// AI 모델 설정 및 관리

export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'gemini'
  version: string
  description: string
  maxTokens: number
  costPerToken: number
  capabilities: string[]
  isAvailable: boolean
}

export const AI_MODELS: AIModel[] = [
  // OpenAI GPT 모델들
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    version: '4.0',
    description: '최신 멀티모달 GPT-4 모델로 텍스트, 이미지, 오디오를 모두 처리할 수 있습니다',
    maxTokens: 128000,
    costPerToken: 0.00003,
    capabilities: ['text', 'image', 'audio', 'function_calling'],
    isAvailable: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    version: '4.0',
    description: 'GPT-4o의 경량화 버전으로 빠르고 경제적인 텍스트 생성이 가능합니다',
    maxTokens: 128000,
    costPerToken: 0.000015,
    capabilities: ['text', 'function_calling'],
    isAvailable: true
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    version: '4.0',
    description: '고성능 GPT-4 모델로 복잡한 작업에 최적화되어 있습니다',
    maxTokens: 128000,
    costPerToken: 0.00001,
    capabilities: ['text', 'function_calling'],
    isAvailable: true
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    version: '5.0',
    description: '차세대 GPT 모델로 향상된 추론 능력과 창의성을 제공합니다',
    maxTokens: 200000,
    costPerToken: 0.00005,
    capabilities: ['text', 'image', 'audio', 'video', 'function_calling'],
    isAvailable: true // Context7 정보에 따르면 사용 가능
  },
  {
    id: 'gpt-5-turbo',
    name: 'GPT-5 Turbo',
    provider: 'openai',
    version: '5.0',
    description: 'GPT-5의 고성능 버전으로 빠른 응답과 높은 처리량을 제공합니다',
    maxTokens: 200000,
    costPerToken: 0.00008,
    capabilities: ['text', 'image', 'audio', 'video', 'function_calling'],
    isAvailable: true
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    version: '5.0',
    description: 'GPT-5의 경량화 버전으로 빠르고 경제적인 텍스트 생성이 가능합니다',
    maxTokens: 128000,
    costPerToken: 0.000025,
    capabilities: ['text', 'image', 'function_calling'],
    isAvailable: true
  },
  {
    id: 'gpt-5-pro',
    name: 'GPT-5 Pro',
    provider: 'openai',
    version: '5.0',
    description: 'GPT-5의 전문가 버전으로 복잡한 작업과 고급 추론에 특화되어 있습니다',
    maxTokens: 500000,
    costPerToken: 0.00012,
    capabilities: ['text', 'image', 'audio', 'video', 'function_calling'],
    isAvailable: true
  },
  
  // Google Gemini 모델들
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    version: '2.0',
    description: 'Google의 최신 Gemini 모델로 빠른 응답과 높은 품질을 제공합니다',
    maxTokens: 1000000,
    costPerToken: 0.0000075,
    capabilities: ['text', 'image', 'audio', 'video', 'function_calling'],
    isAvailable: true
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    version: '1.5',
    description: '고성능 Gemini 모델로 복잡한 추론과 창의적 작업에 특화되어 있습니다',
    maxTokens: 2000000,
    costPerToken: 0.0000035,
    capabilities: ['text', 'image', 'audio', 'function_calling'],
    isAvailable: true
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    version: '1.5',
    description: '빠른 응답이 필요한 작업에 최적화된 Gemini 모델입니다',
    maxTokens: 1000000,
    costPerToken: 0.00000075,
    capabilities: ['text', 'image', 'function_calling'],
    isAvailable: true
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    version: '2.5',
    description: '차세대 Gemini Pro 모델로 향상된 성능과 정확도를 제공합니다',
    maxTokens: 2000000,
    costPerToken: 0.00001,
    capabilities: ['text', 'image', 'audio', 'video', 'function_calling'],
    isAvailable: true // Context7 정보에 따르면 사용 가능
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    version: '2.5',
    description: 'Gemini 2.5의 빠른 버전으로 빠른 응답과 효율적인 처리를 제공합니다',
    maxTokens: 1000000,
    costPerToken: 0.000005,
    capabilities: ['text', 'image', 'audio', 'function_calling'],
    isAvailable: true // Context7 정보에 따르면 사용 가능
  },
  {
    id: 'gemini-2.0-pro',
    name: 'Gemini 2.0 Pro',
    provider: 'gemini',
    version: '2.0',
    description: 'Gemini 2.0 Pro 모델로 고급 추론 능력과 멀티모달 처리를 제공합니다',
    maxTokens: 2000000,
    costPerToken: 0.000008,
    capabilities: ['text', 'image', 'audio', 'video', 'function_calling'],
    isAvailable: true // Context7 정보에 따르면 사용 가능
  }
]

export const getAvailableModels = (): AIModel[] => {
  return AI_MODELS.filter(model => model.isAvailable)
}

export const getModelById = (id: string): AIModel | undefined => {
  return AI_MODELS.find(model => model.id === id)
}

export const getModelsByProvider = (provider: 'openai' | 'gemini'): AIModel[] => {
  return AI_MODELS.filter(model => model.provider === provider && model.isAvailable)
}

export const getRecommendedModel = (): AIModel => {
  // 기본 추천 모델 (GPT-4o Mini)
  return AI_MODELS.find(model => model.id === 'gpt-4o-mini') || AI_MODELS[0]
}

export const getModelCost = (modelId: string, tokenCount: number): number => {
  const model = getModelById(modelId)
  if (!model) return 0
  return model.costPerToken * tokenCount
}

export const formatModelName = (model: AIModel): string => {
  return `${model.name} (${model.provider.toUpperCase()})`
}

export const getModelCapabilities = (modelId: string): string[] => {
  const model = getModelById(modelId)
  return model?.capabilities || []
}
