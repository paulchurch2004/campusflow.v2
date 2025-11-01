import { prisma } from '@/lib/prisma'

export interface CreateNotificationParams {
  type: string
  title: string
  message: string
  userId: string
  relatedId?: string
  relatedType?: string
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: params,
    })
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

export async function createExpenseNotification(
  expense: any,
  action: 'created' | 'approved' | 'rejected' | 'paid',
  targetUserId: string
) {
  const notifications = {
    created: {
      type: 'expense',
      title: 'Nouvelle dépense',
      message: `Une nouvelle dépense de ${expense.amount}€ a été créée par ${expense.user.name}`,
    },
    approved: {
      type: 'success',
      title: 'Dépense approuvée',
      message: `Votre dépense de ${expense.amount}€ a été approuvée`,
    },
    rejected: {
      type: 'warning',
      title: 'Dépense rejetée',
      message: `Votre dépense de ${expense.amount}€ a été rejetée`,
    },
    paid: {
      type: 'success',
      title: 'Dépense payée',
      message: `Votre dépense de ${expense.amount}€ a été payée`,
    },
  }

  const notificationData = notifications[action]

  return createNotification({
    ...notificationData,
    userId: targetUserId,
    relatedId: expense.id,
    relatedType: 'expense',
  })
}

export async function createEventNotification(
  event: any,
  action: 'created' | 'updated' | 'cancelled',
  userIds: string[]
) {
  const notifications = {
    created: {
      type: 'event',
      title: 'Nouvel événement',
      message: `L'événement "${event.name}" a été créé`,
    },
    updated: {
      type: 'event',
      title: 'Événement modifié',
      message: `L'événement "${event.name}" a été modifié`,
    },
    cancelled: {
      type: 'warning',
      title: 'Événement annulé',
      message: `L'événement "${event.name}" a été annulé`,
    },
  }

  const notificationData = notifications[action]

  const promises = userIds.map((userId) =>
    createNotification({
      ...notificationData,
      userId,
      relatedId: event.id,
      relatedType: 'event',
    })
  )

  return Promise.all(promises)
}

export async function createCommentNotification(
  comment: any,
  targetUserId: string
) {
  return createNotification({
    type: 'comment',
    title: 'Nouveau commentaire',
    message: `${comment.user.name} a commenté: ${comment.content.substring(0, 50)}...`,
    userId: targetUserId,
    relatedId: comment.relatedId,
    relatedType: comment.relatedType,
  })
}

export async function notifyTreasurers(listId: string, notification: Omit<CreateNotificationParams, 'userId'>) {
  try {
    // Récupérer tous les trésoriers de la liste
    const treasurers = await prisma.user.findMany({
      where: {
        listId,
        role: 'TREASURER',
      },
    })

    const promises = treasurers.map((treasurer) =>
      createNotification({
        ...notification,
        userId: treasurer.id,
      })
    )

    return Promise.all(promises)
  } catch (error) {
    console.error('Error notifying treasurers:', error)
    return []
  }
}

export async function notifyAllMembers(listId: string, notification: Omit<CreateNotificationParams, 'userId'>) {
  try {
    // Récupérer tous les membres de la liste
    const members = await prisma.user.findMany({
      where: {
        listId,
      },
    })

    const promises = members.map((member) =>
      createNotification({
        ...notification,
        userId: member.id,
      })
    )

    return Promise.all(promises)
  } catch (error) {
    console.error('Error notifying all members:', error)
    return []
  }
}
