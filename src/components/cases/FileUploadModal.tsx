'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  TrashIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline'

interface ExistingFile {
  file_name: string
  file_size: number
  file_type: string
  file_url: string
}

interface PendingUpload {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  caseId: string
  evidenceLabel?: string
  existingFiles: ExistingFile[]
  onUploadComplete?: (result: { file_name: string; file_path: string; file_type: string; file_size: number }) => void
  onFileDelete?: (fileUrl: string) => void
}

function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return <PhotoIcon className="h-4 w-4 shrink-0" />
  if (mime.startsWith('video/')) return <VideoCameraIcon className="h-4 w-4 shrink-0" />
  if (mime.startsWith('audio/')) return <MusicalNoteIcon className="h-4 w-4 shrink-0" />
  return <DocumentTextIcon className="h-4 w-4 shrink-0" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploadModal({
  isOpen,
  onClose,
  caseId,
  evidenceLabel,
  existingFiles,
  onUploadComplete,
  onFileDelete,
}: FileUploadModalProps) {
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files || []))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFiles = async (files: File[]) => {
    const newItems: PendingUpload[] = files.map(f => ({ file: f, progress: 0, status: 'pending' }))
    const startIdx = pendingUploads.length
    setPendingUploads(prev => [...prev, ...newItems])

    for (let i = 0; i < files.length; i++) {
      await uploadFile(startIdx + i, files[i])
    }
  }

  const uploadFile = async (index: number, file: File) => {
    setPendingUploads(prev => {
      const u = [...prev]
      if (u[index]) u[index] = { ...u[index], status: 'uploading', progress: 10 }
      return u
    })

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('case_id', caseId)
      if (evidenceLabel) fd.append('title', evidenceLabel)

      const res = await fetch('/api/cases/upload-evidence', { method: 'POST', body: fd })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Upload failed')

      setPendingUploads(prev => {
        const u = [...prev]
        if (u[index]) u[index] = { ...u[index], status: 'complete', progress: 100 }
        return u
      })

      onUploadComplete?.({
        file_name: result.file_name,
        file_path: result.file_path,
        file_type: result.file_type,
        file_size: result.file_size,
      })
    } catch (error) {
      setPendingUploads(prev => {
        const u = [...prev]
        if (u[index]) u[index] = { ...u[index], status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
        return u
      })
    }
  }

  const handleClose = () => {
    setPendingUploads([])
    onClose()
  }

  const totalFiles = existingFiles.length + pendingUploads.filter(p => p.status === 'complete').length

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {evidenceLabel ? `Files for: ${evidenceLabel}` : 'Upload Evidence Files'}
          </DialogTitle>
          <DialogDescription>
            {totalFiles > 0
              ? `${totalFiles} file${totalFiles !== 1 ? 's' : ''} attached. Drag more files or click browse to add.`
              : 'Drag and drop files or click browse. All file types supported.'}
          </DialogDescription>
        </DialogHeader>

        {/* Existing files */}
        {existingFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Attached Files</h3>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {existingFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-muted-foreground/10">
                  {fileIcon(f.file_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.file_name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(f.file_size)}</p>
                  </div>
                  <button
                    onClick={() => onFileDelete?.(f.file_url)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-1"
                    title="Remove file"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drag and Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed transition-colors p-8 text-center ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
            accept="*/*"
          />
          <div className="flex flex-col items-center gap-2">
            <ArrowUpTrayIcon className="h-10 w-10 text-primary/60" />
            <p className="text-sm font-semibold text-foreground">
              Drag files here or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline font-semibold"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-muted-foreground">Any file format, up to 50 MB each</p>
          </div>
        </div>

        {/* Upload progress for new files */}
        {pendingUploads.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Uploading</h3>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {pendingUploads.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-muted-foreground/10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{item.file.name}</p>
                      {item.status === 'complete' && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                    </div>
                    {item.status !== 'complete' && (
                      <div className="flex items-center gap-2">
                        <Progress value={item.progress} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.status === 'error' ? 'Failed' : `${item.progress}%`}
                        </span>
                      </div>
                    )}
                    {item.error && (
                      <p className="text-xs text-destructive mt-1">{item.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end mt-2">
          <Button variant="outline" onClick={handleClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
