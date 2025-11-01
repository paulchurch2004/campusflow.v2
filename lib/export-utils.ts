import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { formatCurrency, formatDate, formatDateTime } from './utils'

// Type definitions
interface User {
  id: string
  name: string
  email: string
}

interface Pole {
  id: string
  name: string
  color: string
  allocatedBudget?: number
  spentAmount?: number
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
  requestedAt: string
  user: User
  pole: Pole
  notes?: string
}

interface Event {
  id: string
  name: string
  description?: string
  date: string
  location?: string
  capacity?: number
  ticketPrice: number
  status: string
  pole?: Pole
  _count?: {
    tickets: number
    expenses: number
  }
}

interface Ticket {
  id: string
  studentName: string
  studentEmail: string
  price: number
  purchasedAt: string
}

interface MonthlyReportData {
  totalBudget: number
  totalSpent: number
  totalEvents: number
  poles: {
    name: string
    allocatedBudget: number
    spentAmount: number
    remaining: number
  }[]
  events: Event[]
  topExpenses: Expense[]
}

// Status labels in French
const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  PAID: 'Payé',
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  CANCELLED: 'Annulé',
  COMPLETED: 'Terminé',
}

/**
 * Export expenses to Excel format
 */
export function exportExpensesToExcel(
  expenses: Expense[],
  poles: Pole[],
  users: User[]
) {
  // Prepare data for Excel
  const data = expenses.map(expense => ({
    Date: formatDate(expense.requestedAt),
    Description: expense.description,
    Montant: expense.amount,
    Catégorie: expense.category,
    Pôle: expense.pole.name,
    Demandeur: expense.user.name,
    Status: statusLabels[expense.status] || expense.status,
  }))

  // Add total row
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  data.push({
    Date: '',
    Description: 'TOTAL',
    Montant: total,
    Catégorie: '',
    Pôle: '',
    Demandeur: '',
    Status: '',
  })

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data)

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 30 }, // Description
    { wch: 12 }, // Montant
    { wch: 15 }, // Catégorie
    { wch: 15 }, // Pôle
    { wch: 20 }, // Demandeur
    { wch: 12 }, // Status
  ]

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Dépenses')

  // Generate filename with current date
  const now = new Date()
  const filename = `depenses_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`

  // Download file
  XLSX.writeFile(wb, filename)
}

/**
 * Export expenses to PDF format
 */
export function exportExpensesToPDF(
  expenses: Expense[],
  poles: Pole[],
  users: User[],
  listName: string = 'CampusFlow'
) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(`Rapport de Dépenses - ${listName}`, 14, 20)

  // Generation date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date de génération: ${formatDateTime(new Date())}`, 14, 28)

  // Prepare table data
  const tableData = expenses.map(expense => [
    formatDate(expense.requestedAt),
    expense.description,
    formatCurrency(expense.amount),
    expense.category,
    expense.pole.name,
    expense.user.name,
    statusLabels[expense.status] || expense.status,
  ])

  // Generate table
  autoTable(doc, {
    startY: 35,
    head: [['Date', 'Description', 'Montant', 'Catégorie', 'Pôle', 'Demandeur', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 45 }, // Description
      2: { cellWidth: 25 }, // Montant
      3: { cellWidth: 25 }, // Catégorie
      4: { cellWidth: 25 }, // Pôle
      5: { cellWidth: 30 }, // Demandeur
      6: { cellWidth: 20 }, // Status
    },
  })

  // Calculate totals by status
  const totals = {
    PENDING: 0,
    APPROVED: 0,
    PAID: 0,
    REJECTED: 0,
  }

  expenses.forEach(expense => {
    if (expense.status in totals) {
      totals[expense.status] += expense.amount
    }
  })

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Add totals section
  const finalY = (doc as any).lastAutoTable.finalY + 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Récapitulatif:', 14, finalY)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let yPos = finalY + 7

  Object.entries(totals).forEach(([status, amount]) => {
    if (amount > 0) {
      doc.text(
        `${statusLabels[status]}: ${formatCurrency(amount)}`,
        14,
        yPos
      )
      yPos += 6
    }
  })

  doc.setFont('helvetica', 'bold')
  doc.text(`Total général: ${formatCurrency(total)}`, 14, yPos + 3)

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Generate filename
  const now = new Date()
  const filename = `rapport_depenses_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`

  // Download file
  doc.save(filename)
}

/**
 * Export monthly report to PDF
 */
export function exportMonthlyReportPDF(data: MonthlyReportData, listName: string = 'CampusFlow') {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(`Rapport Mensuel - ${listName}`, 14, 20)

  // Generation date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const now = new Date()
  const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(now)
  doc.text(`Période: ${monthName}`, 14, 28)
  doc.text(`Généré le: ${formatDateTime(now)}`, 14, 34)

  // Statistics section
  let yPos = 45
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Statistiques Globales', 14, yPos)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  yPos += 8
  doc.text(`Budget total: ${formatCurrency(data.totalBudget)}`, 20, yPos)
  yPos += 6
  doc.text(`Dépenses totales: ${formatCurrency(data.totalSpent)}`, 20, yPos)
  yPos += 6
  doc.text(`Budget restant: ${formatCurrency(data.totalBudget - data.totalSpent)}`, 20, yPos)
  yPos += 6
  doc.text(`Nombre d'événements: ${data.totalEvents}`, 20, yPos)

  // Budget by pole table
  yPos += 15
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Budget par Pôle', 14, yPos)

  const poleTableData = data.poles.map(pole => [
    pole.name,
    formatCurrency(pole.allocatedBudget),
    formatCurrency(pole.spentAmount),
    formatCurrency(pole.remaining),
    `${((pole.spentAmount / pole.allocatedBudget) * 100).toFixed(1)}%`,
  ])

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Pôle', 'Budget Alloué', 'Dépensé', 'Restant', 'Utilisation']],
    body: poleTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
    },
  })

  // Events section
  yPos = (doc as any).lastAutoTable.finalY + 15
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Événements du Mois', 14, yPos)

  if (data.events.length > 0) {
    const eventsTableData = data.events.map(event => [
      event.name,
      formatDate(event.date),
      event.location || '-',
      event.ticketPrice > 0 ? formatCurrency(event.ticketPrice) : 'Gratuit',
      statusLabels[event.status] || event.status,
    ])

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Nom', 'Date', 'Lieu', 'Prix', 'Status']],
      body: eventsTableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
    })
    yPos = (doc as any).lastAutoTable.finalY
  } else {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Aucun événement ce mois-ci', 20, yPos + 8)
    yPos += 15
  }

  // Top expenses section
  yPos += 15
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Top 10 Dépenses', 14, yPos)

  if (data.topExpenses.length > 0) {
    const topExpensesData = data.topExpenses.slice(0, 10).map(expense => [
      formatDate(expense.requestedAt),
      expense.description,
      formatCurrency(expense.amount),
      expense.pole.name,
      statusLabels[expense.status] || expense.status,
    ])

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Date', 'Description', 'Montant', 'Pôle', 'Status']],
      body: topExpensesData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
    })
  } else {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Aucune dépense enregistrée', 20, yPos + 8)
  }

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Download file
  const filename = `rapport_mensuel_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.pdf`
  doc.save(filename)
}

/**
 * Export event report to PDF
 */
export function exportEventPDF(
  event: Event,
  tickets: Ticket[],
  expenses: Expense[],
  listName: string = 'CampusFlow'
) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(`Bilan d'Événement - ${listName}`, 14, 20)

  // Event title
  doc.setFontSize(16)
  doc.text(event.name, 14, 32)

  // Event information
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let yPos = 42
  doc.text(`Date: ${formatDateTime(event.date)}`, 14, yPos)
  yPos += 6
  if (event.location) {
    doc.text(`Lieu: ${event.location}`, 14, yPos)
    yPos += 6
  }
  if (event.description) {
    doc.text(`Description: ${event.description}`, 14, yPos)
    yPos += 6
  }
  doc.text(`Status: ${statusLabels[event.status] || event.status}`, 14, yPos)
  yPos += 6
  if (event.pole) {
    doc.text(`Pôle: ${event.pole.name}`, 14, yPos)
    yPos += 6
  }

  // Statistics section
  yPos += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Statistiques', 14, yPos)

  const totalTickets = tickets.length
  const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const balance = totalRevenue - totalExpenses

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  yPos += 8
  doc.text(`Nombre de participants: ${totalTickets}`, 20, yPos)
  yPos += 6
  if (event.capacity) {
    const fillRate = event.capacity > 0 ? (totalTickets / event.capacity * 100).toFixed(1) : 0
    doc.text(`Capacité: ${event.capacity} (${fillRate}% rempli)`, 20, yPos)
    yPos += 6
  }

  // Financial section
  yPos += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Bilan Financier', 14, yPos)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  yPos += 8
  doc.text(`Revenus billetterie: ${formatCurrency(totalRevenue)}`, 20, yPos)
  yPos += 6
  doc.text(`Dépenses totales: ${formatCurrency(totalExpenses)}`, 20, yPos)
  yPos += 6
  doc.setFont('helvetica', 'bold')
  const balanceColor = balance >= 0 ? [0, 128, 0] : [255, 0, 0]
  doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2])
  doc.text(`Bilan: ${formatCurrency(balance)}`, 20, yPos)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  // Tickets table
  if (tickets.length > 0) {
    yPos += 15
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Liste des Participants', 14, yPos)

    const ticketsData = tickets.map(ticket => [
      ticket.studentName,
      ticket.studentEmail,
      formatCurrency(ticket.price),
      formatDateTime(ticket.purchasedAt),
    ])

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Nom', 'Email', 'Prix', 'Date d\'achat']],
      body: ticketsData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
    })

    yPos = (doc as any).lastAutoTable.finalY
  }

  // Expenses table
  if (expenses.length > 0) {
    yPos += 15
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Dépenses Liées', 14, yPos)

    const expensesData = expenses.map(expense => [
      formatDate(expense.requestedAt),
      expense.description,
      formatCurrency(expense.amount),
      expense.category,
      statusLabels[expense.status] || expense.status,
    ])

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Date', 'Description', 'Montant', 'Catégorie', 'Status']],
      body: expensesData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
      },
    })
  }

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Download file
  const now = new Date()
  const filename = `bilan_evenement_${event.name.replace(/[^a-z0-9]/gi, '_')}_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`
  doc.save(filename)
}

/**
 * Export events to Excel
 */
export function exportEventsToExcel(events: Event[]) {
  // Prepare data for Excel
  const data = events.map(event => ({
    Nom: event.name,
    Date: formatDate(event.date),
    Lieu: event.location || '-',
    'Prix du billet': event.ticketPrice,
    Capacité: event.capacity || '-',
    Pôle: event.pole?.name || '-',
    Status: statusLabels[event.status] || event.status,
    Participants: event._count?.tickets || 0,
  }))

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data)

  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Nom
    { wch: 12 }, // Date
    { wch: 25 }, // Lieu
    { wch: 15 }, // Prix
    { wch: 10 }, // Capacité
    { wch: 15 }, // Pôle
    { wch: 12 }, // Status
    { wch: 12 }, // Participants
  ]

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Événements')

  // Generate filename with current date
  const now = new Date()
  const filename = `evenements_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`

  // Download file
  XLSX.writeFile(wb, filename)
}

/**
 * Export events to PDF
 */
export function exportEventsToPDF(events: Event[], listName: string = 'CampusFlow') {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(`Rapport d'Événements - ${listName}`, 14, 20)

  // Generation date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date de génération: ${formatDateTime(new Date())}`, 14, 28)

  // Prepare table data
  const tableData = events.map(event => [
    event.name,
    formatDate(event.date),
    event.location || '-',
    event.ticketPrice > 0 ? formatCurrency(event.ticketPrice) : 'Gratuit',
    event.capacity?.toString() || '-',
    event.pole?.name || '-',
    statusLabels[event.status] || event.status,
    event._count?.tickets?.toString() || '0',
  ])

  // Generate table
  autoTable(doc, {
    startY: 35,
    head: [['Nom', 'Date', 'Lieu', 'Prix', 'Capacité', 'Pôle', 'Status', 'Participants']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
    },
  })

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  // Generate filename
  const now = new Date()
  const filename = `rapport_evenements_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`

  // Download file
  doc.save(filename)
}
