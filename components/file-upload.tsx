'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  X,
  File,
  FileImage,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface FileWithPreview extends File {
  preview?: string
}

interface UploadedFile {
  name: string
  fileName: string
  fileUrl: string
  mimeType: string
  fileSize: number
}

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSize?: number
  accept?: string[]
  className?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType.includes('pdf')) return FileText
  return File
}

export function FileUpload({
  onUploadComplete,
  maxFiles = 5,
  maxSize = MAX_FILE_SIZE,
  accept = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Le fichier ${file.name} dépasse la taille maximale de ${formatFileSize(maxSize)}`
    }
    if (!accept.includes(file.type)) {
      return `Le type de fichier ${file.type} n'est pas autorisé`
    }
    return null
  }

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null)
      const fileArray = Array.from(newFiles)

      if (files.length + fileArray.length > maxFiles) {
        setError(`Vous ne pouvez uploader que ${maxFiles} fichiers maximum`)
        return
      }

      const validFiles: FileWithPreview[] = []
      for (const file of fileArray) {
        const error = validateFile(file)
        if (error) {
          setError(error)
          return
        }

        const fileWithPreview = file as FileWithPreview
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file)
        }
        validFiles.push(fileWithPreview)
      }

      setFiles((prev) => [...prev, ...validFiles])
    },
    [files.length, maxFiles, accept, maxSize]
  )

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'upload')
      }

      const data = await response.json()
      setUploadProgress(100)
      setUploadedFiles(data.files)

      // Nettoyer les previews
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })

      setFiles([])

      if (onUploadComplete) {
        onUploadComplete(data.files)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-border bg-muted/20 hover:border-blue-400 hover:bg-muted/40'
        )}
      >
        <div className="p-8 text-center">
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
          >
            <Upload className="h-8 w-8 text-white" />
          </motion.div>

          <h3 className="mb-2 text-lg font-semibold">
            Glissez-déposez vos fichiers ici
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            ou cliquez pour parcourir vos fichiers
          </p>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Formats acceptés: Images, PDF, Word, Excel, CSV</p>
            <p>Taille maximale: {formatFileSize(maxSize)} par fichier</p>
            <p>Maximum: {maxFiles} fichiers</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => {
              const Icon = getFileIcon(file.type)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )
            })}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Upload en cours... {uploadProgress}%</span>
                </div>
              </div>
            )}

            {/* Upload Button */}
            {!uploading && (
              <Button
                onClick={uploadFiles}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Uploader {files.length} fichier{files.length > 1 ? 's' : ''}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <p>
              {uploadedFiles.length} fichier{uploadedFiles.length > 1 ? 's' : ''}{' '}
              uploadé{uploadedFiles.length > 1 ? 's' : ''} avec succès
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
