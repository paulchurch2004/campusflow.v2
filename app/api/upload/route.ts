import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
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
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      // Validation de la taille
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Le fichier ${file.name} dépasse la taille maximale de 10MB` },
          { status: 400 }
        )
      }

      // Validation du type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Le type de fichier ${file.type} n'est pas autorisé` },
          { status: 400 }
        )
      }

      // Créer un nom de fichier unique
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = path.extname(file.name)
      const fileName = `${timestamp}-${randomString}${extension}`

      // Chemin de destination
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')

      // Créer le dossier s'il n'existe pas
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      const filePath = path.join(uploadDir, fileName)

      // Convertir le fichier en buffer et l'écrire
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      uploadedFiles.push({
        name: file.name,
        fileName: fileName,
        fileUrl: `/uploads/${fileName}`,
        mimeType: file.type,
        fileSize: file.size,
      })
    }

    return NextResponse.json({
      message: 'Fichiers uploadés avec succès',
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload des fichiers' },
      { status: 500 }
    )
  }
}
