import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        expense: {
          select: {
            id: true,
            description: true,
            amount: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer le fichier physique
    try {
      const filePath = path.join(process.cwd(), 'public', document.fileUrl)
      await unlink(filePath)
    } catch (fileError) {
      console.error('Error deleting file:', fileError)
      // Continue même si la suppression du fichier échoue
    }

    // Supprimer l'entrée dans la base de données
    await prisma.document.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Document supprimé avec succès',
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du document' },
      { status: 500 }
    )
  }
}
