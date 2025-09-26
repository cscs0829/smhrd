'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Download,
  FileImage
} from 'lucide-react'

interface ConversionResult {
  success: boolean
  convertedFile?: Blob
  filename?: string
  originalSize?: number
  convertedSize?: number
  error?: string
}

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState<string>('')
  const [isConverting, setIsConverting] = useState(false)
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supportedFormats = [
    { value: 'jpeg', label: 'JPEG', description: '고품질 압축 이미지' },
    { value: 'png', label: 'PNG', description: '투명도 지원 무손실 이미지' },
    { value: 'webp', label: 'WebP', description: '최신 웹 최적화 이미지' },
    { value: 'avif', label: 'AVIF', description: '차세대 고효율 이미지' },
    { value: 'tiff', label: 'TIFF', description: '고품질 무손실 이미지' },
    { value: 'gif', label: 'GIF', description: '애니메이션 지원 이미지' },
    { value: 'bmp', label: 'BMP', description: '비트맵 이미지' },
    { value: 'heic', label: 'HEIC', description: 'Apple 고효율 이미지' },
    { value: 'heif', label: 'HEIF', description: '고효율 이미지 포맷' }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // 이미지 파일인지 확인
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile)
        setError(null)
        setConversionResult(null)
        
        // 파일 확장자에 따라 기본 변환 포맷 설정
        const extension = selectedFile.name.split('.').pop()?.toLowerCase()
        if (extension === 'png') {
          setTargetFormat('jpeg')
        } else if (extension === 'jpeg' || extension === 'jpg') {
          setTargetFormat('png')
        } else {
          setTargetFormat('webp')
        }
      } else {
        setError('이미지 파일만 업로드 가능합니다.')
        setFile(null)
      }
    }
  }

  const handleConvert = async () => {
    if (!file || !targetFormat) {
      setError('파일과 변환 포맷을 모두 선택해주세요.')
      return
    }

    setIsConverting(true)
    setError(null)
    setConversionResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('targetFormat', targetFormat)

      const response = await fetch('/api/image-convert', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Uint8Array를 Blob으로 변환
        const uint8Array = new Uint8Array(result.convertedFile)
        const blob = new Blob([uint8Array], { 
          type: `image/${targetFormat.toLowerCase()}` 
        })
        
        setConversionResult({
          success: true,
          convertedFile: blob,
          filename: result.filename,
          originalSize: result.originalSize,
          convertedSize: result.convertedSize
        })
      } else {
        setError(result.error || '이미지 변환 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('이미지 변환 오류:', error)
      setError('이미지 변환 중 오류가 발생했습니다.')
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (conversionResult?.convertedFile && conversionResult?.filename) {
      const url = URL.createObjectURL(conversionResult.convertedFile)
      const a = document.createElement('a')
      a.href = url
      a.download = conversionResult.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderConversionResult = () => {
    if (!conversionResult) return null

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium">변환 완료</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-700 mb-1">원본 파일</div>
            <div className="text-lg font-bold text-blue-600">
              {formatFileSize(conversionResult.originalSize || 0)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-700 mb-1">변환된 파일</div>
            <div className="text-lg font-bold text-green-600">
              {formatFileSize(conversionResult.convertedSize || 0)}
            </div>
          </div>
        </div>

        {conversionResult.originalSize && conversionResult.convertedSize && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileImage className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-700">압축률</span>
            </div>
            <div className="text-sm text-gray-600">
              {Math.round(((conversionResult.originalSize - conversionResult.convertedSize) / conversionResult.originalSize) * 100)}% 크기 감소
            </div>
          </div>
        )}

        <Button 
          onClick={handleDownload}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          변환된 이미지 다운로드
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          이미지 변환기
        </CardTitle>
        <CardDescription>
          다양한 이미지 포맷으로 변환하고 최적화할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-file">이미지 파일 선택</Label>
          <Input
            id="image-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isConverting}
          />
          <p className="text-sm text-gray-500">
            JPEG, PNG, WebP, AVIF, TIFF, GIF, BMP, HEIC, HEIF 등 모든 이미지 포맷을 지원합니다.
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <ImageIcon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">{file.name}</span>
            <span className="text-sm text-gray-500">
              ({formatFileSize(file.size)})
            </span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="target-format">변환할 포맷 선택</Label>
          <Select value={targetFormat} onValueChange={setTargetFormat} disabled={isConverting}>
            <SelectTrigger>
              <SelectValue placeholder="변환할 이미지 포맷을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {supportedFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{format.label}</span>
                    <span className="text-xs text-gray-500">{format.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleConvert}
          disabled={!file || !targetFormat || isConverting}
          className="w-full"
        >
          {isConverting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              변환 중...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              이미지 변환하기
            </>
          )}
        </Button>

        {isConverting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>이미지 변환 중...</span>
              <span>잠시만 기다려주세요</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {conversionResult && renderConversionResult()}
      </CardContent>
    </Card>
  )
}
