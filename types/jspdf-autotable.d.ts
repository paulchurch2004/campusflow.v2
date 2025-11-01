declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf'

  interface UserOptions {
    head?: any[][]
    body?: any[][]
    foot?: any[][]
    startY?: number
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
    theme?: 'striped' | 'grid' | 'plain'
    styles?: any
    headStyles?: any
    bodyStyles?: any
    footStyles?: any
    columnStyles?: Record<number, any>
    alternateRowStyles?: any
    tableWidth?: 'auto' | 'wrap' | number
    showHead?: 'everyPage' | 'firstPage' | 'never'
    showFoot?: 'everyPage' | 'lastPage' | 'never'
    didDrawCell?: (data: any) => void
    didDrawPage?: (data: any) => void
    willDrawCell?: (data: any) => void
    willDrawPage?: (data: any) => void
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): void

  export interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: {
      finalY: number
    }
  }
}
