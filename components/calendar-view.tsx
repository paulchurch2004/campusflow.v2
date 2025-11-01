'use client'

import { Calendar, dateFnsLocalizer, View, Event as BigCalendarEvent } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState, useMemo, useCallback } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Setup the localizer with date-fns
const locales = {
  'fr': fr,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent extends BigCalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  location?: string
  capacity?: number
  ticketsSold?: number
  poleColor?: string
  poleName?: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onSelectEvent?: (event: CalendarEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  selectedPole?: string
}

export function CalendarView({
  events,
  onSelectEvent,
  onSelectSlot,
  selectedPole,
}: CalendarViewProps) {
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  // Filter events by pole if selected
  const filteredEvents = useMemo(() => {
    if (!selectedPole || selectedPole === 'all') {
      return events
    }
    return events.filter(event => event.poleName === selectedPole)
  }, [events, selectedPole])

  // Custom event style getter
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      let backgroundColor = event.poleColor || '#3b82f6'
      let borderColor = event.poleColor || '#2563eb'

      // Adjust opacity based on status
      if (event.status === 'DRAFT') {
        backgroundColor = backgroundColor + '80' // 50% opacity
      } else if (event.status === 'CANCELLED') {
        backgroundColor = '#6b7280'
        borderColor = '#4b5563'
      } else if (event.status === 'COMPLETED') {
        backgroundColor = '#10b981'
        borderColor = '#059669'
      }

      return {
        style: {
          backgroundColor,
          borderColor,
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: '6px',
          opacity: event.status === 'DRAFT' ? 0.7 : 1,
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: '500',
          padding: '4px 8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      }
    },
    []
  )

  // Custom event component for tooltip
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const isFull = event.capacity && event.ticketsSold && event.ticketsSold >= event.capacity

    return (
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-xs font-medium">{event.title}</span>
        <div className="flex items-center gap-1">
          {isFull && (
            <Badge variant="destructive" className="h-4 px-1 text-[10px]">
              Complet
            </Badge>
          )}
          {event.status === 'DRAFT' && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              Brouillon
            </Badge>
          )}
          {event.status === 'CANCELLED' && (
            <Badge variant="outline" className="h-4 px-1 text-[10px]">
              Annulé
            </Badge>
          )}
        </div>
      </div>
    )
  }

  // Custom toolbar
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV')
    }

    const goToNext = () => {
      toolbar.onNavigate('NEXT')
    }

    const goToToday = () => {
      toolbar.onNavigate('TODAY')
    }

    const label = () => {
      const date = toolbar.date
      if (toolbar.view === 'month') {
        return format(date, 'MMMM yyyy', { locale: fr })
      } else if (toolbar.view === 'week') {
        return `Semaine du ${format(date, 'dd MMMM yyyy', { locale: fr })}`
      } else {
        return format(date, 'dd MMMM yyyy', { locale: fr })
      }
    }

    return (
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToBack}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Précédent
          </button>
          <button
            onClick={goToToday}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            Aujourd'hui
          </button>
          <button
            onClick={goToNext}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Suivant
          </button>
        </div>

        <h2 className="text-xl font-bold capitalize">{label()}</h2>

        <div className="flex gap-2">
          <button
            onClick={() => toolbar.onView('month')}
            className={cn(
              'rounded-lg border border-border px-3 py-2 text-sm font-medium',
              toolbar.view === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-accent'
            )}
          >
            Mois
          </button>
          <button
            onClick={() => toolbar.onView('week')}
            className={cn(
              'rounded-lg border border-border px-3 py-2 text-sm font-medium',
              toolbar.view === 'week'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-accent'
            )}
          >
            Semaine
          </button>
          <button
            onClick={() => toolbar.onView('agenda')}
            className={cn(
              'rounded-lg border border-border px-3 py-2 text-sm font-medium',
              toolbar.view === 'agenda'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-accent'
            )}
          >
            Agenda
          </button>
        </div>
      </div>
    )
  }

  const messages = {
    allDay: 'Toute la journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucun événement dans cette période.',
    showMore: (total: number) => `+ ${total} événement(s) supplémentaire(s)`,
  }

  return (
    <div className="calendar-container rounded-lg border border-border bg-background p-6">
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }

        .rbc-header {
          padding: 12px 8px;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 2px solid hsl(var(--border));
          background: hsl(var(--muted) / 0.3);
        }

        .rbc-today {
          background-color: hsl(var(--accent));
        }

        .rbc-off-range-bg {
          background: hsl(var(--muted) / 0.2);
        }

        .rbc-event {
          border: none !important;
          padding: 4px 8px !important;
        }

        .rbc-event:focus {
          outline: 2px solid hsl(var(--ring));
        }

        .rbc-selected {
          background-color: hsl(var(--primary)) !important;
        }

        .rbc-slot-selection {
          background-color: hsl(var(--primary) / 0.2);
        }

        .rbc-time-slot {
          border-top: 1px solid hsl(var(--border));
        }

        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid hsl(var(--border) / 0.5);
        }

        .rbc-agenda-view {
          font-size: 14px;
        }

        .rbc-agenda-view table {
          border: 1px solid hsl(var(--border));
        }

        .rbc-agenda-date-cell,
        .rbc-agenda-time-cell {
          white-space: normal;
          padding: 12px;
        }

        .rbc-agenda-event-cell {
          padding: 12px;
        }

        .rbc-month-view {
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          overflow: hidden;
        }

        .rbc-month-row {
          border-top: 1px solid hsl(var(--border));
          min-height: 100px;
        }

        .rbc-date-cell {
          padding: 8px;
          text-align: right;
        }

        .rbc-now {
          font-weight: bold;
          color: hsl(var(--primary));
        }

        .rbc-current-time-indicator {
          background-color: hsl(var(--destructive));
          height: 2px;
        }
      `}</style>

      <Calendar
        localizer={localizer}
        events={filteredEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
          toolbar: CustomToolbar,
        }}
        messages={messages}
        culture="fr"
        popup
        step={30}
        showMultiDayTimes
      />
    </div>
  )
}
