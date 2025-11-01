'use client'

import { Download, FileSpreadsheet, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ExportMenuProps {
  onExportExcel?: () => void
  onExportPDF?: () => void
  onExportMonthlyReport?: () => void
  showMonthlyReport?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportMenu({
  onExportExcel,
  onExportPDF,
  onExportMonthlyReport,
  showMonthlyReport = false,
  variant = 'outline',
  size = 'default',
}: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Options d&apos;export</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {onExportExcel && (
          <DropdownMenuItem onClick={onExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exporter en Excel
          </DropdownMenuItem>
        )}

        {onExportPDF && (
          <DropdownMenuItem onClick={onExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Exporter en PDF
          </DropdownMenuItem>
        )}

        {showMonthlyReport && onExportMonthlyReport && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportMonthlyReport}>
              <Calendar className="mr-2 h-4 w-4" />
              Rapport mensuel PDF
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
