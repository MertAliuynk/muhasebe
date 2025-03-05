"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { useQueryState } from "nuqs"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DateRangePicker({
  className,
  variant = "default",
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "outline"
}) {
  const searchParams = useSearchParams()
  const hasDateParam = searchParams.has("date")

  const defaultDate = React.useMemo(() => {
    const today = new Date()
    return {
      from: today,
      to: undefined,
    } as DateRange
  }, [])

  const [date, setDate] = useQueryState("date", {
    defaultValue: defaultDate,
    parse: (value: string | null) => {
      if (!value) return undefined

      try {
        const dates = value.split(",")

        if (dates.length === 0 || !dates[0]) return undefined

        const from = new Date(dates[0])
        if (isNaN(from.getTime())) return undefined

        let to: Date | undefined = undefined
        if (dates.length > 1 && dates[1]) {
          try {
            const toDate = new Date(dates[1])
            if (!isNaN(toDate.getTime())) {
              to = toDate
            }
          } catch {}
        }

        return { from, to } as DateRange
      } catch {
        return undefined
      }
    },
    serialize: (range: DateRange | undefined) => {
      if (!range?.from) return ""
      if (range.to) {
        return `${format(range.from, "yyyy-MM-dd")},${format(range.to, "yyyy-MM-dd")}`
      }
      return format(range.from, "yyyy-MM-dd")
    },
  })

  const handleDateSelect = React.useCallback(
    (selectedDate: DateRange | undefined) => {
      if (selectedDate?.from) {
        void setDate(selectedDate)
      }
    },
    [setDate]
  )

  const handleClearDate = React.useCallback(() => {
    void setDate(null)
  }, [setDate])

  React.useEffect(() => {
    if (!window.location.search.includes("date=")) {
      void setDate(defaultDate)
    }
  }, [setDate, defaultDate])

  const displayDate = hasDateParam && date ? date : undefined

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={variant}
              size="sm"
              className={cn("justify-start text-left font-normal")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {displayDate?.from ? (
                displayDate.to ? (
                  <>
                    {format(displayDate.from, "d MMMM")} -{" "}
                    {format(displayDate.to, "d MMMM yyyy")}
                  </>
                ) : (
                  format(displayDate.from, "d MMMM yyyy")
                )
              ) : (
                <span>Tarih Aralığı Seçin</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={displayDate}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {hasDateParam && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearDate}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Tarih filtresini temizle</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tarih filtresini temizle</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
