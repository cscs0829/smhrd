'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/features/FileUpload'
import { Upload } from 'lucide-react'

interface AttachModalProps {
  onFileSelect: (file: File) => void
  isProcessing?: boolean
}

export function AttachModal({ onFileSelect, isProcessing = false }: AttachModalProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (file: File) => {
    onFileSelect(file)
    // 파일 선택 즉시 닫기
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" disabled={isProcessing}>
          <Upload className="mr-2 h-4 w-4" />
          파일 첨부
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>CSV 파일 첨부</DialogTitle>
          <DialogDescription>
            상품별 CSV 파일을 업로드하여 클릭수 0인 상품을 자동으로 처리합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <FileUpload onFileSelect={handleSelect} isProcessing={isProcessing} />
        </div>
      </DialogContent>
    </Dialog>
  )
}


