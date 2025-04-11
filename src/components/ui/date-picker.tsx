"use client"

import * as React from "react"
import { addDays, format, isSameDay, parseISO, subDays } from "date-fns"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClockArrowUp,
} from "lucide-react"
import { useQueryState } from "nuqs"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker() {
  const [date, setDate] = useQueryState("date", {
    parse: (value) => (value ? parseISO(value) : new Date()),
    serialize: (date) => format(date, "yyyy-MM-dd"),
  })
  const isToday = date ? isSameDay(date, new Date()) : false

  return (
    <div className="flex items-center gap-2">
      {!isToday && (
        <Button variant={"outline"} onClick={() => void setDate(new Date())}>
          Bugün&apos;e Git <ClockArrowUp size={16} className="ml-2" />
        </Button>
      )}
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          className="size-7"
          onClick={() => setDate(subDays(date ?? new Date(), 1))}
        >
          <ChevronLeft size={16} />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon size={16} className="mr-2" />
              {date ? format(date, "PPP EEEE") : <span>Tarih seçiniz</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date ?? undefined}
              onSelect={(day: Date | undefined) => {
                if (day) {
                  void setDate(day)
                }
              }}
              defaultMonth={date ? new Date(date) : undefined}
            />
          </PopoverContent>
        </Popover>
        <Button
          size="icon"
          variant="outline"
          className="size-7"
          onClick={() => setDate(addDays(date ?? new Date(), 1))}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
